/* 국외·우회 접속 차단 공통 데이터·헬퍼
 *
 * 전송자격인증제 2.2-01(국외 IP 차단)·2.2-02(우회접속 통제) 대응 화면
 * overseas-access-control.html 이 사용하는 데이터 모듈이다.
 *
 * 정책
 *   - 대한민국(KR) IP 에서만 서비스를 이용할 수 있다. 허용 국가는 KR 로 고정이며 추가할 수 없다.
 *   - 국외 IP 와 VPN·공개/익명 프록시·Tor·호스팅(IDC) 등 우회접속은
 *     사용자 웹 사이트(발송·로그인·회원가입), 발송 API, 관리자 페이지 모두에서 차단한다.
 *   - 예외 허용 없음. 해외 출장·협력사를 포함해 예외 IP 를 등록할 수 없으며,
 *     보안 정책 > IP 접근 제어(화이트리스트)는 관리자 접근을 좁히는 용도로만 쓰이고 국외 IP 를 통과시키지 못한다.
 *   - 차단 시 계정·IP·일시·사유·결과를 로그로 남기며, 이 로그는 수정·삭제할 수 없다(보관 3년).
 *
 * 판정 순서
 *   클라이언트 IP 식별 → GeoIP 국가 판정 → 우회접속 판정(IP 평판·Tor 목록·ASN·헤더) → 차단·로그 기록
 *   국가 판정과 우회접속 판정을 모두 수행하고 하나라도 해당하면 차단한다.
 *   로그의 탐지 유형은 우회 수단이 확인되면 우회 유형을, 아니면 '국외 IP' 로 기록한다.
 *
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET  /api/admin/access-control/policy          차단 설정·판정 DB 현황 조회
 *   PUT  /api/admin/access-control/policy          안내 문구·반복 차단 알림 기준 변경 (최고 관리자, 적용 대상·국가·탐지 항목은 변경 불가)
 *   POST /api/admin/access-control/test            판정 시험 (실제 차단 필터와 동일한 판정 엔진 호출)
 *   GET  /api/admin/access-control/tests           시험 결과 이력
 *   GET  /api/admin/access-control/block-logs      차단 로그 조회 (기간·대상 시스템·탐지 유형·계정)
 */

/* 프로토타입 기준일 — 실제 연동 시 서버 시각으로 대체 */
var OAC_TODAY = '2026-09-28';

/* 적용 대상 시스템 — 모두 적용 중이며 정책상 해제할 수 없다 */
var OAC_SYSTEMS = {
    web: {
        label: '사용자 웹 사이트', scope: '발송·로그인·회원가입',
        entry: '웹 방화벽(WAF) → 웹 서버 접속 필터',
        paths: '/login, /join, /send/*, /mypage/* 등 전체 경로',
        enabled: true, since: '2026-09-01 00:00'
    },
    api: {
        label: '발송 API', scope: '연동 고객',
        entry: 'API 게이트웨이 접속 필터',
        paths: '/api/v1/* 전체 (발송·조회·잔액)',
        enabled: true, since: '2026-09-01 00:00'
    },
    admin: {
        label: '관리자 페이지', scope: '운영·보안 관리자',
        entry: '웹 방화벽(WAF) → 관리자 서버 접속 필터',
        paths: '/admin/* 전체 (로그인 화면 포함)',
        enabled: true, since: '2026-09-01 00:00'
    }
};

/* 탐지 유형 — 로그·시험 결과의 '탐지 유형' 칩 */
var OAC_DETECT_TYPE = {
    none:     { label: '해당 없음',      cls: 'none' },
    foreign:  { label: '국외 IP',        cls: 'foreign' },
    vpn:      { label: 'VPN',            cls: 'vpn' },
    proxy:    { label: '프록시',         cls: 'proxy' },
    tor:      { label: 'Tor',            cls: 'tor' },
    hosting:  { label: '호스팅·IDC',     cls: 'hosting' },
    mismatch: { label: '국가 불일치',    cls: 'mismatch' },
    unknown:  { label: '판정 불가',      cls: 'unknown' }
};

/* 적용 규칙 — 차단 로그·시험 결과에 규칙 ID 로 남는다 */
var OAC_RULES = {
    'R-GEO-01': '허용 국가(KR) 외 IP 접속 차단',
    'R-BYP-01': 'VPN 접속 차단',
    'R-BYP-02': '공개·익명 프록시 접속 차단',
    'R-BYP-03': 'Tor 출구 노드 접속 차단',
    'R-BYP-04': '호스팅·IDC(클라우드) 대역 접속 차단',
    'R-BYP-05': '접속 국가 불일치 차단',
    'R-DEF-01': '국가 판정 불가 시 기본 차단',
    'R-ALW-01': '허용 국가(KR) 일반 회선 — 허용'
};

var OAC_TYPE_RULE = {
    foreign: 'R-GEO-01', vpn: 'R-BYP-01', proxy: 'R-BYP-02', tor: 'R-BYP-03',
    hosting: 'R-BYP-04', mismatch: 'R-BYP-05', unknown: 'R-DEF-01', none: 'R-ALW-01'
};

/* 국가 판정 기준 DB */
var OAC_GEO_SOURCES = [
    { name: 'MaxMind GeoIP2 Country', role: '1차 국가 판정 (IPv4·IPv6)', version: 'GeoIP2-Country 20260922', updatedAt: '2026-09-22 04:00:12', cycle: '매주 자동 (화 04:00)', status: 'ok' },
    { name: 'KISA 국가별 IP 주소 할당 현황', role: 'KR 할당 대역 교차 검증', version: 'KRNIC 2026-09-01 기준', updatedAt: '2026-09-21 04:10:03', cycle: '매주 자동 (월 04:10)', status: 'ok' },
    { name: 'MaxMind GeoIP2 Anonymous IP', role: 'VPN·프록시·호스팅 IP 평판', version: 'GeoIP2-Anonymous-IP 20260927', updatedAt: '2026-09-27 03:30:41', cycle: '매일 자동 (03:30)', status: 'ok' },
    { name: 'Tor Project Exit List', role: 'Tor 출구 노드 목록', version: '2026-09-28 10:00 스냅샷 (1,284개)', updatedAt: '2026-09-28 10:00:04', cycle: '1시간 주기 동기화', status: 'ok' }
];

/* 우회접속 탐지 항목 */
var OAC_BYPASS_RULES = [
    { type: 'vpn', item: 'VPN', rule: 'R-BYP-01',
      method: 'IP 평판 DB(Anonymous IP)의 상용 VPN 대역 조회 + VPN 사업자 ASN 목록 대조',
      target: '웹 · API · 관리자', action: '차단', enabled: true },
    { type: 'proxy', item: '공개·익명 프록시', rule: 'R-BYP-02',
      method: 'IP 평판 DB 공개 프록시 등재 여부 조회 + HTTP 헤더(X-Forwarded-For·Via·Forwarded) 검사 — 자사 로드밸런서 외 프록시 경유 흔적 탐지',
      target: '웹 · API · 관리자', action: '차단', enabled: true },
    { type: 'tor', item: 'Tor 출구 노드', rule: 'R-BYP-03',
      method: 'Tor Project 출구 노드 목록을 1시간 주기로 동기화하여 접속 IP 대조',
      target: '웹 · API · 관리자', action: '차단', enabled: true },
    { type: 'hosting', item: '호스팅·IDC(클라우드) IP', rule: 'R-BYP-04',
      method: 'ASN(자율시스템번호) 기반 호스팅·IDC 사업자 분류 — 웹·관리자는 호스팅 대역 전체, API 는 국외 호스팅 대역 차단',
      target: '웹 · API · 관리자', action: '차단', enabled: true },
    { type: 'mismatch', item: '국가 불일치', rule: 'R-BYP-05',
      method: 'IP 국가와 접속 환경(브라우저 WebRTC 노출 IP·시간대) 국가 비교 — 불일치 시 우회로 판정',
      target: '웹 · 관리자', action: '차단', enabled: true }
];

/* 차단 시 이용자 안내 문구·반복 차단 알림 기준 (최고 관리자만 변경) */
var OAC_NOTICE = {
    message: '국외 IP 또는 우회 접속(VPN·프록시 등)이 감지되어 접속이 제한되었습니다.\n국내 네트워크에서 다시 접속해 주세요.\n문의: 톡벨 고객센터 1588-5412 (평일 09:00~18:00)',
    alertThreshold: 3,
    alertWindow: 10,
    alertTo: 'security@ibank.co.kr'
};

/* 설정 변경 이력 — 최신순 */
var OAC_POLICY_HISTORY = [
    { at: '2026-09-15 14:20:31', admin: '박정호(jhpark@ibank.co.kr)', item: '차단 안내 문구', detail: '고객센터 운영시간 문구 추가', ip: '10.0.3.21' },
    { at: '2026-09-01 00:00:00', admin: '박정호(jhpark@ibank.co.kr)', item: '우회접속 탐지', detail: 'VPN·프록시·Tor·호스팅·국가 불일치 탐지 5개 항목 적용', ip: '10.0.3.21' },
    { at: '2026-09-01 00:00:00', admin: '박정호(jhpark@ibank.co.kr)', item: '국외 IP 차단', detail: '사용자 웹·발송 API·관리자 페이지 허용 국가 KR 적용 (예외 없음)', ip: '10.0.3.21' }
];

/* 판정 시험용 IP 정보 — 판정 엔진 응답을 흉내 낸 샘플.
 * 목록에 없는 IP 는 국내 주요 ISP 할당 대역(앞자리)로 KR 여부를 추정하고,
 * 사설·예약 대역은 국가 판정 불가 → 기본 차단으로 처리한다. */
var OAC_IP_SAMPLES = {
    '211.36.142.77': { country: 'KR', isp: 'SK브로드밴드 (AS9318)',       type: 'none',    note: '국내 유선 회선' },
    '121.190.24.5':  { country: 'KR', isp: 'KT (AS4766)',                  type: 'none',    note: '국내 유선 회선' },
    '175.223.10.44': { country: 'KR', isp: 'LG유플러스 (AS17858)',         type: 'none',    note: '국내 모바일 회선' },
    '203.0.113.1':   { country: 'US', isp: 'Comcast Cable (AS7922)',       type: 'foreign', note: 'GeoIP 국가 US' },
    '104.28.52.17':  { country: 'KR', isp: 'Cloudflare WARP (AS13335)',    type: 'vpn',     note: 'GeoIP 는 KR 이나 평판 DB 상용 VPN 대역' },
    '185.220.101.1': { country: 'DE', isp: 'Tor exit (AS60729)',           type: 'tor',     note: 'Tor 출구 노드 목록 일치' },
    '45.77.20.31':   { country: 'JP', isp: 'Vultr Holdings (AS20473)',     type: 'hosting', note: '국외 호스팅(VPS) 대역' },
    '58.120.33.4':   { country: 'KR', isp: 'KT (AS4766)',                  type: 'proxy',   note: '평판 DB 공개 프록시 등재 (3128/TCP)' },
    '43.201.10.88':  { country: 'KR', isp: 'Amazon AWS 서울 리전 (AS16509)', type: 'hosting', note: '국내 클라우드 VM — 웹·관리자는 차단, API 는 연동 서버로 허용', apiAllowed: true },
    '113.161.72.10': { country: 'VN', isp: 'VNPT (AS45899)',               type: 'foreign', note: 'GeoIP 국가 VN' }
};

/* KR 추정용 국내 주요 ISP 할당 대역 앞자리 (프로토타입 전용 — 실제는 GeoIP DB 조회) */
var OAC_KR_PREFIX = ['1', '14', '27', '39', '49', '58', '59', '61', '106', '110', '112', '114', '115', '116',
                     '117', '118', '119', '121', '122', '123', '124', '125', '175', '180', '182', '183',
                     '210', '211', '218', '220', '221', '222'];

var OAC_COUNTRY_NAME = {
    KR: '대한민국', US: '미국', DE: '독일', JP: '일본', CN: '중국', RU: '러시아',
    VN: '베트남', NL: '네덜란드', SG: '싱가포르'
};

/* 시험 결과 이력 — 최신순. round 가 같은 행이 한 회차의 정기 시험이다 */
var OAC_TESTS = [
    { at: '2026-09-24 15:42:08', id: 'AT-20260924-15', round: '2026-09 정기', system: 'admin', ip: '185.220.101.7',  country: 'DE', type: 'tor',     expected: 'block', actual: 'block', tester: '이수민' },
    { at: '2026-09-24 15:39:51', id: 'AT-20260924-14', round: '2026-09 정기', system: 'admin', ip: '58.120.33.4',    country: 'KR', type: 'proxy',   expected: 'block', actual: 'block', tester: '이수민' },
    { at: '2026-09-24 15:37:22', id: 'AT-20260924-13', round: '2026-09 정기', system: 'admin', ip: '104.28.52.17',   country: 'KR', type: 'vpn',     expected: 'block', actual: 'block', tester: '이수민' },
    { at: '2026-09-24 15:35:10', id: 'AT-20260924-12', round: '2026-09 정기', system: 'admin', ip: '203.0.113.1',    country: 'US', type: 'foreign', expected: 'block', actual: 'block', tester: '이수민' },
    { at: '2026-09-24 15:32:44', id: 'AT-20260924-11', round: '2026-09 정기', system: 'admin', ip: '121.190.24.5',   country: 'KR', type: 'none',    expected: 'allow', actual: 'allow', tester: '이수민' },
    { at: '2026-09-24 14:58:17', id: 'AT-20260924-10', round: '2026-09 정기', system: 'api',   ip: '185.220.101.1',  country: 'DE', type: 'tor',     expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:55:03', id: 'AT-20260924-09', round: '2026-09 정기', system: 'api',   ip: '58.120.33.4',    country: 'KR', type: 'proxy',   expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:52:40', id: 'AT-20260924-08', round: '2026-09 정기', system: 'api',   ip: '104.28.52.17',   country: 'KR', type: 'vpn',     expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:50:12', id: 'AT-20260924-07', round: '2026-09 정기', system: 'api',   ip: '203.0.113.1',    country: 'US', type: 'foreign', expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:47:36', id: 'AT-20260924-06', round: '2026-09 정기', system: 'api',   ip: '211.36.142.77',  country: 'KR', type: 'none',    expected: 'allow', actual: 'allow', tester: '박정호' },
    { at: '2026-09-24 14:21:09', id: 'AT-20260924-05', round: '2026-09 정기', system: 'web',   ip: '185.220.101.34', country: 'DE', type: 'tor',     expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:18:55', id: 'AT-20260924-04', round: '2026-09 정기', system: 'web',   ip: '58.120.33.4',    country: 'KR', type: 'proxy',   expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:16:20', id: 'AT-20260924-03', round: '2026-09 정기', system: 'web',   ip: '104.28.52.17',   country: 'KR', type: 'vpn',     expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:13:48', id: 'AT-20260924-02', round: '2026-09 정기', system: 'web',   ip: '203.0.113.1',    country: 'US', type: 'foreign', expected: 'block', actual: 'block', tester: '박정호' },
    { at: '2026-09-24 14:11:02', id: 'AT-20260924-01', round: '2026-09 정기', system: 'web',   ip: '211.36.142.77',  country: 'KR', type: 'none',    expected: 'allow', actual: 'allow', tester: '박정호' },
    { at: '2026-09-01 10:24:31', id: 'AT-20260901-03', round: '적용 검증',    system: 'admin', ip: '113.161.72.10',  country: 'VN', type: 'foreign', expected: 'block', actual: 'block', tester: '정하늘' },
    { at: '2026-09-01 10:18:05', id: 'AT-20260901-02', round: '적용 검증',    system: 'api',   ip: '203.0.113.1',    country: 'US', type: 'foreign', expected: 'block', actual: 'block', tester: '정하늘' },
    { at: '2026-09-01 10:12:47', id: 'AT-20260901-01', round: '적용 검증',    system: 'web',   ip: '45.77.20.31',    country: 'JP', type: 'hosting', expected: 'block', actual: 'block', tester: '정하늘' }
];

/* 차단 로그 — 최신순. account 가 비어 있으면 로그인 전 차단(미로그인)이다.
 * 감사 로그이므로 어드민에서는 조회·내보내기만 가능하다. */
var OAC_BLOCK_LOGS = [
    { at: '2026-09-28 10:42:17', id: 'BLK-20260928-0006', system: 'web',   account: '', accountType: '', ip: '185.220.101.34', country: 'DE', type: 'tor',
      reason: 'Tor 출구 노드 목록 일치', method: 'POST', path: '/login', ua: 'Firefox 128 ESR / Windows 10 (Tor Browser)', session: 'S-20260928-1042A',
      evidence: 'Tor Exit List 2026-09-28 10:00 스냅샷 · GeoIP2-Country 20260922 (DE)' },
    { at: '2026-09-28 09:15:03', id: 'BLK-20260928-0005', system: 'api',   account: 'kim@example.com', accountType: 'API 키 ak_****3f9c', ip: '45.77.20.31', country: 'JP', type: 'hosting',
      reason: '국외(JP) 호스팅(VPS) 대역에서 발송 API 호출', method: 'POST', path: '/api/v1/send', ua: 'python-requests/2.32', session: '-',
      evidence: 'GeoIP2-Country 20260922 (JP) · ASN AS20473 Vultr Holdings — 호스팅 분류' },
    { at: '2026-09-28 08:51:40', id: 'BLK-20260928-0004', system: 'web',   account: 'hong@example.com', accountType: '회원', ip: '104.28.52.17', country: 'KR', type: 'vpn',
      reason: '상용 VPN 대역 접속 (GeoIP 국가 KR)', method: 'GET', path: '/send/sms', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0851C',
      evidence: 'GeoIP2-Anonymous-IP 20260927 (is_anonymous_vpn) · ASN AS13335 Cloudflare WARP' },
    { at: '2026-09-28 03:12:09', id: 'BLK-20260928-0003', system: 'admin', account: '', accountType: '', ip: '91.240.118.22', country: 'RU', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 접속', method: 'GET', path: '/admin/login', ua: 'curl/8.5.0', session: '-',
      evidence: 'GeoIP2-Country 20260922 (RU) · KRNIC 할당 대역 미포함' },
    { at: '2026-09-28 02:47:55', id: 'BLK-20260928-0002', system: 'web',   account: '', accountType: '', ip: '203.0.113.45', country: 'US', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 접속', method: 'GET', path: '/join', ua: 'Safari 18 / macOS 15', session: 'S-20260928-0247F',
      evidence: 'GeoIP2-Country 20260922 (US) · KRNIC 할당 대역 미포함' },
    { at: '2026-09-28 01:20:31', id: 'BLK-20260928-0001', system: 'web',   account: '', accountType: '', ip: '36.110.14.8', country: 'CN', type: 'proxy',
      reason: '공개 프록시 경유 (Via 헤더 · 평판 DB 등재)', method: 'POST', path: '/login', ua: 'Chrome 138 / Windows 10', session: 'S-20260928-0120B',
      evidence: 'GeoIP2-Anonymous-IP 20260927 (is_public_proxy) · Via: 1.1 squid · GeoIP2-Country (CN)' },
    { at: '2026-09-27 22:04:18', id: 'BLK-20260927-0004', system: 'web',   account: 'lee@example.com', accountType: '회원', ip: '58.120.33.4', country: 'KR', type: 'proxy',
      reason: '공개 프록시 경유 (GeoIP 국가 KR)', method: 'POST', path: '/login', ua: 'Chrome 140 / Android 15', session: 'S-20260927-2204D',
      evidence: 'GeoIP2-Anonymous-IP 20260927 (is_public_proxy, 3128/TCP) · X-Forwarded-For 비신뢰 경유 흔적' },
    { at: '2026-09-27 14:33:02', id: 'BLK-20260927-0003', system: 'admin', account: 'smlee@ibank.co.kr', accountType: '관리자(이수민)', ip: '113.161.72.10', country: 'VN', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 접속 — 해외 출장 중 접속 시도, 예외 없이 차단', method: 'POST', path: '/admin/login', ua: 'Chrome 140 / macOS 15', session: 'A-20260927-1433',
      evidence: 'GeoIP2-Country 20260922 (VN) · KRNIC 할당 대역 미포함', alert: '동일 관리자 계정 반복 차단(2회) — 보안 담당자 재알림, 계정 모니터링 지정' },
    { at: '2026-09-27 14:31:47', id: 'BLK-20260927-0002', system: 'admin', account: 'smlee@ibank.co.kr', accountType: '관리자(이수민)', ip: '113.161.72.10', country: 'VN', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 접속', method: 'POST', path: '/admin/login', ua: 'Chrome 140 / macOS 15', session: 'A-20260927-1431',
      evidence: 'GeoIP2-Country 20260922 (VN) · KRNIC 할당 대역 미포함', alert: '관리자 계정 국외 접속 차단 — 보안 담당자(security@ibank.co.kr) 즉시 알림 발송' },
    { at: '2026-09-26 19:08:55', id: 'BLK-20260926-0002', system: 'web',   account: '', accountType: '', ip: '43.201.10.88', country: 'KR', type: 'hosting',
      reason: '클라우드 VM(AWS 서울 리전) 경유 회원가입 시도', method: 'POST', path: '/join', ua: 'Chrome 139 / Windows Server 2022', session: 'S-20260926-1908E',
      evidence: 'ASN AS16509 Amazon — 호스팅 분류 · GeoIP2-Country 20260922 (KR)' },
    { at: '2026-09-25 11:27:40', id: 'BLK-20260925-0001', system: 'api',   account: 'kim@example.com', accountType: 'API 키 ak_****3f9c', ip: '185.220.101.7', country: 'DE', type: 'tor',
      reason: 'Tor 출구 노드에서 발송 API 호출', method: 'POST', path: '/api/v1/send', ua: 'okhttp/4.12.0', session: '-',
      evidence: 'Tor Exit List 2026-09-25 11:00 스냅샷 · GeoIP2-Country 20260922 (DE)' },
    { at: '2026-09-24 16:02:13', id: 'BLK-20260924-0003', system: 'web',   account: 'hong@example.com', accountType: '회원', ip: '121.134.57.12', country: 'KR', type: 'mismatch',
      reason: 'IP 국가(KR)와 접속 환경 국가(US) 불일치', method: 'POST', path: '/send/lms', ua: 'Chrome 140 / Windows 11', session: 'S-20260924-1602A',
      evidence: 'WebRTC 노출 IP 198.51.100.23 (US) · 브라우저 시간대 America/Los_Angeles · GeoIP2-Country 20260922' },
    { at: '2026-09-22 09:44:21', id: 'BLK-20260922-0001', system: 'admin', account: '', accountType: '', ip: '45.77.31.140', country: 'JP', type: 'hosting',
      reason: '국외(JP) 호스팅 대역에서 관리자 페이지 접속', method: 'GET', path: '/admin/login', ua: 'Chrome 139 / Linux', session: '-',
      evidence: 'GeoIP2-Country 20260922 (JP) · ASN AS20473 Vultr Holdings — 호스팅 분류' },
    { at: '2026-09-19 23:10:05', id: 'BLK-20260919-0002', system: 'web',   account: '', accountType: '', ip: '36.110.14.21', country: 'CN', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 접속', method: 'POST', path: '/login', ua: 'Chrome 120 / Windows 10', session: 'S-20260919-2310C',
      evidence: 'GeoIP2-Country 20260915 (CN) · KRNIC 할당 대역 미포함', alert: '동일 IP 10분 내 14회 차단 — 보안 담당자 알림 발송, IP 모니터링 지정' },
    { at: '2026-09-15 13:55:30', id: 'BLK-20260915-0001', system: 'api',   account: 'lee@example.com', accountType: 'API 키 ak_****91d0', ip: '203.0.113.9', country: 'US', type: 'foreign',
      reason: '허용 국가(KR) 외 IP 에서 대량 발송 API 호출', method: 'POST', path: '/api/v1/send/bulk', ua: 'Java-http-client/21', session: '-',
      evidence: 'GeoIP2-Country 20260915 (US) · KRNIC 할당 대역 미포함' },
    { at: '2026-09-10 07:21:48', id: 'BLK-20260910-0001', system: 'web',   account: 'kim@example.com', accountType: '회원', ip: '89.187.161.5', country: 'JP', type: 'vpn',
      reason: '상용 VPN 서버 대역 접속', method: 'GET', path: '/send/sms', ua: 'Edge 140 / Windows 11', session: 'S-20260910-0721B',
      evidence: 'GeoIP2-Anonymous-IP 20260909 (is_anonymous_vpn) · ASN AS60068 Datacamp' },
    { at: '2026-09-03 18:30:12', id: 'BLK-20260903-0001', system: 'admin', account: '', accountType: '', ip: '185.220.101.1', country: 'DE', type: 'tor',
      reason: 'Tor 출구 노드에서 관리자 페이지 접속', method: 'GET', path: '/admin', ua: 'Firefox 128 ESR / Linux (Tor Browser)', session: '-',
      evidence: 'Tor Exit List 2026-09-03 18:00 스냅샷 · GeoIP2-Country 20260901 (DE)' },
    { at: '2026-09-02 10:05:44', id: 'BLK-20260902-0001', system: 'web',   account: '', accountType: '', ip: '5.188.62.140', country: 'NL', type: 'proxy',
      reason: '익명 프록시 경유 회원가입 시도', method: 'POST', path: '/join', ua: 'Chrome 138 / Windows 10', session: 'S-20260902-1005A',
      evidence: 'GeoIP2-Anonymous-IP 20260901 (is_anonymous) · GeoIP2-Country (NL)' }
];

/* ---------- 헬퍼 (admin-common.js 로드 순서와 무관하게 동작하도록 자체 정의) ---------- */

function oacEscape(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function oacSystemLabel(key) {
    var s = OAC_SYSTEMS[key];
    return s ? s.label : key;
}

/* XX: KR 할당 대역 밖(국외)으로만 확인된 IP, --: 사설·예약 대역 등 국가 판정 불가 */
function oacCountryLabel(code) {
    if (code === 'XX') return '국외 (KR 외)';
    if (code === '--') return '판정 불가';
    return code + ' ' + (OAC_COUNTRY_NAME[code] || '');
}

function oacTypeTag(type) {
    var meta = OAC_DETECT_TYPE[type] || OAC_DETECT_TYPE.unknown;
    return '<span class="oac-tag ' + meta.cls + '">' + meta.label + '</span>';
}

function oacDecisionBadge(decision) {
    return decision === 'allow'
        ? '<span class="badge badge-success">허용</span>'
        : '<span class="badge badge-danger">차단</span>';
}

function oacIsValidIPv4(ip) {
    var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
    if (!m) return false;
    for (var i = 1; i <= 4; i++) {
        if (+m[i] > 255 || (m[i].length > 1 && m[i][0] === '0')) return false;
    }
    return true;
}

/* 사설·루프백·링크로컬·예약 대역 — 외부 인입 경로에서 국가를 판정할 수 없다 */
function oacIsReserved(ip) {
    var p = ip.split('.').map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
        (p[0] === 169 && p[1] === 254) ||
        (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
        (p[0] === 192 && p[1] === 168) ||
        (p[0] === 100 && p[1] >= 64 && p[1] <= 127);
}

/* 판정 엔진 시뮬레이션 — 실제 연동 시 POST /api/admin/access-control/test 응답으로 대체.
 * 반환: { country, isp, type, decision, rule, note, evidence } */
function oacJudge(ip, system) {
    var geoVer = OAC_GEO_SOURCES[0].version;
    var sample = OAC_IP_SAMPLES[ip];

    if (sample) {
        var type = sample.type;
        // 국내 클라우드 대역은 발송 API 연동 서버로 허용 (웹·관리자는 차단)
        if (type === 'hosting' && sample.apiAllowed && system === 'api') type = 'none';
        return {
            country: sample.country, isp: sample.isp, type: type,
            decision: type === 'none' ? 'allow' : 'block',
            rule: OAC_TYPE_RULE[type],
            note: sample.note + (type === 'none' && sample.type === 'hosting' ? ' (발송 API 대상)' : ''),
            evidence: geoVer + ' · ' + OAC_GEO_SOURCES[2].version + ' · ' + OAC_GEO_SOURCES[3].version
        };
    }

    if (oacIsReserved(ip)) {
        return {
            country: '--', isp: '사설·예약 대역', type: 'unknown', decision: 'block',
            rule: 'R-DEF-01', note: '외부 인입 경로에서 국가를 판정할 수 없는 주소 — 기본 차단',
            evidence: geoVer + ' (조회 결과 없음)'
        };
    }

    var first = ip.split('.')[0];
    if (OAC_KR_PREFIX.indexOf(first) !== -1) {
        return {
            country: 'KR', isp: '국내 ISP (KRNIC 할당 대역)', type: 'none', decision: 'allow',
            rule: 'R-ALW-01', note: '국내 할당 대역 · IP 평판 DB 미등재 · Tor 목록 미일치',
            evidence: geoVer + ' · ' + OAC_GEO_SOURCES[1].version + ' · ' + OAC_GEO_SOURCES[2].version
        };
    }
    return {
        country: 'XX', isp: 'KR 할당 대역 외', type: 'foreign', decision: 'block',
        rule: 'R-GEO-01', note: 'KRNIC 국내 할당 대역에 포함되지 않음 — 국외 IP 로 차단',
        evidence: geoVer + ' · ' + OAC_GEO_SOURCES[1].version
    };
}
