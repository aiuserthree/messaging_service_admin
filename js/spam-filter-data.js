/* 금칙어 등 차단 체계(스팸 필터링) 공통 데이터·헬퍼
 *
 * 전송자격인증제 인증기준 5.2 대응.
 * spam-filter.html(차단정보 관리)과 spam-detection-log.html(탐지·차단 결과 로그)이 공유한다.
 *
 * ── 차단 판정 절차 ─────────────────────────────────────────────
 *   1) 발송 요청 시점에 문자 내용(제목·본문)에서 차단정보를 탐지한다.
 *      차단정보는 금칙어(단어) / URL·도메인 / 전화번호 3종이다.
 *   2) 다중 조합 규칙(차단정보 2개 이상 AND)에 걸리면 규칙의 조치를 적용한다.
 *   3) 조합 규칙에 걸리지 않으면 개별 차단정보의 조치 중 가장 강한 값을 적용한다.
 *        block(즉시 차단) > hold(보류)
 *   4) 즉시 차단 — 발송을 중단하고 이용자에게 차단 사유를 안내한다.
 *      보류      — 오탐 가능성이 있는 건. 기업 고객사 승인 담당자에게 검토를 요청하고,
 *                  승인되면 전송, 반려되면 차단으로 확정한다.
 *   5) 모든 탐지·조치 결과는 이력으로 남긴다(사후 점검·소명 대응 근거자료).
 *      이력은 3년 보관하며 수정·삭제할 수 없다(SPAM_LOG_RETENTION 참고).
 *
 * 차단정보 출처는 자체 등록과 외부기관(한국인터넷진흥원 등) 연동 두 가지이며,
 * 외부기관 차단정보는 주기적으로 동기화한다.
 *
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET    /api/admin/spam/block-items          차단정보 목록
 *   POST   /api/admin/spam/block-items          차단정보 등록 (엑셀 일괄 등록 포함)
 *   PUT    /api/admin/spam/block-items/{id}     차단정보 수정 (조치정책·사용여부)
 *   DELETE /api/admin/spam/block-items/{id}     차단정보 삭제
 *   GET    /api/admin/spam/rules                다중 조합 규칙
 *   GET    /api/admin/spam/sync-history         외부기관 차단정보 반영 내역
 *   POST   /api/admin/spam/sync                 외부기관 차단정보 즉시 동기화
 *   GET    /api/admin/spam/detections           탐지·차단 결과 로그
 *   POST   /api/admin/spam/detections/{id}/block  보류 건 강제 차단(운영자 개입)
 *   GET    /api/admin/spam/detections/retention   탐지·차단 로그 보관 현황
 */

var SPAM_TYPE = {
    word:  { label: '금칙어',      badge: 'badge-warning' },
    url:   { label: 'URL·도메인',  badge: 'badge-info' },
    phone: { label: '전화번호',    badge: 'badge-secondary' }
};

var SPAM_ACTION = {
    block: { label: '즉시 차단', badge: 'badge-danger',  desc: '탐지 즉시 발송 중단, 이용자에게 차단 안내' },
    hold:  { label: '보류',      badge: 'badge-warning', desc: '오탐 가능성 — 승인 담당자 검토 후 전송' }
};

var SPAM_SOURCE = {
    self: { label: '자체 등록',  badge: 'badge-secondary' },
    kisa: { label: '한국인터넷진흥원', badge: 'badge-info' }
};

/* 보류 건 처리 상태 — 승인 주체는 기업 고객사의 발송 승인 담당자다.
 * 톡벨 운영 관리자는 모니터링하며, 필요 시 강제 차단으로 개입한다. */
var SPAM_HOLD_STATUS = {
    pending:  { label: '승인 대기', badge: 'badge-warning' },
    approved: { label: '승인 후 발송', badge: 'badge-success' },
    rejected: { label: '반려(차단 확정)', badge: 'badge-danger' },
    forced:   { label: '운영자 차단', badge: 'badge-danger' }
};

/* ---------- 차단정보 ---------- */

var SPAM_BLOCK_ITEMS = [
    { id: 1,  type: 'word',  value: '도박',           action: 'block', source: 'self', enabled: true,  note: '불법 사행성',       createdAt: '2025-03-04', createdBy: '관리자',   updatedAt: '2025-06-02' },
    { id: 2,  type: 'word',  value: '카지노',         action: 'block', source: 'kisa', enabled: true,  note: '불법 사행성',       createdAt: '2025-03-04', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 3,  type: 'word',  value: '토토',           action: 'block', source: 'kisa', enabled: true,  note: '불법 사행성',       createdAt: '2025-03-04', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 4,  type: 'word',  value: '불법대출',       action: 'block', source: 'kisa', enabled: true,  note: '미등록 대부업',     createdAt: '2025-03-04', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 5,  type: 'word',  value: '신용조회없이',   action: 'block', source: 'self', enabled: true,  note: '미등록 대부업',     createdAt: '2025-04-11', createdBy: '관리자',   updatedAt: '2025-04-11' },
    { id: 6,  type: 'word',  value: '몸캠',           action: 'block', source: 'kisa', enabled: true,  note: '불법 성인물',       createdAt: '2025-03-04', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 7,  type: 'word',  value: '작업대출',       action: 'block', source: 'kisa', enabled: true,  note: '금융사기',          createdAt: '2025-05-08', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 8,  type: 'word',  value: '무료',           action: 'hold',  source: 'self', enabled: true,  note: '광고 상용구 — 오탐 많음', createdAt: '2025-03-04', createdBy: '관리자', updatedAt: '2025-05-19' },
    { id: 9,  type: 'word',  value: '당첨',           action: 'hold',  source: 'self', enabled: true,  note: '광고 상용구 — 오탐 많음', createdAt: '2025-03-04', createdBy: '관리자', updatedAt: '2025-05-19' },
    { id: 10, type: 'word',  value: '수익보장',       action: 'hold',  source: 'self', enabled: true,  note: '투자 유인 문구',    createdAt: '2025-04-11', createdBy: '관리자',   updatedAt: '2025-04-11' },
    { id: 11, type: 'word',  value: '원금보장',       action: 'hold',  source: 'self', enabled: true,  note: '투자 유인 문구',    createdAt: '2025-04-11', createdBy: '관리자',   updatedAt: '2025-04-11' },
    { id: 12, type: 'word',  value: '지금바로클릭',   action: 'hold',  source: 'self', enabled: true,  note: '피싱 유도 문구',    createdAt: '2025-05-08', createdBy: '관리자',   updatedAt: '2025-05-08' },
    { id: 13, type: 'url',   value: 'bit.ly',         action: 'hold',  source: 'self', enabled: true,  note: '단축 URL — 목적지 확인 불가', createdAt: '2025-03-04', createdBy: '관리자', updatedAt: '2025-06-02' },
    { id: 14, type: 'url',   value: 'me2.do',         action: 'hold',  source: 'self', enabled: true,  note: '단축 URL',          createdAt: '2025-03-04', createdBy: '관리자',   updatedAt: '2025-06-02' },
    { id: 15, type: 'url',   value: 'free-money.top', action: 'block', source: 'kisa', enabled: true,  note: '피싱 신고 도메인',  createdAt: '2025-06-20', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 16, type: 'url',   value: 'win-lotto.xyz',  action: 'block', source: 'kisa', enabled: true,  note: '불법 사행성 도메인', createdAt: '2025-06-20', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 17, type: 'url',   value: 'cash-loan.click', action: 'block', source: 'kisa', enabled: true, note: '불법 대부 도메인',  createdAt: '2025-06-20', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 18, type: 'phone', value: '070-1234-5678',  action: 'block', source: 'kisa', enabled: true,  note: '스팸 신고 다발 번호', createdAt: '2025-05-08', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 19, type: 'phone', value: '070-9999-0000',  action: 'block', source: 'kisa', enabled: true,  note: '보이스피싱 신고 번호', createdAt: '2025-06-20', createdBy: 'KISA 연동', updatedAt: '2025-06-20' },
    { id: 20, type: 'phone', value: '050-7777-1111',  action: 'hold',  source: 'self', enabled: false, note: '신고 취소 — 사용 중지', createdAt: '2025-04-11', createdBy: '관리자', updatedAt: '2025-06-15' }
];

/* ---------- 다중 조합 규칙 ----------
 * 인증기준: 차단정보는 다중으로 구성될 수 있어야 하며, 문자 내용을
 * 1개 이상의 차단정보 조합으로 구성하여 탐지·차단하여야 한다.
 * 단독으로는 보류 수준인 항목도 조합으로 탐지되면 즉시 차단으로 상향한다. */
var SPAM_RULES = [
    { id: 'R01', name: '도박 유인 조합', action: 'block', enabled: true,
      conditions: [{ type: 'word', value: '당첨' }, { type: 'url', value: '단축 URL' }],
      desc: '사행성 유인 문구와 목적지를 감출 수 있는 단축 URL 이 함께 있는 경우' },
    { id: 'R02', name: '불법 대부 조합', action: 'block', enabled: true,
      conditions: [{ type: 'word', value: '무료' }, { type: 'word', value: '수익보장' }, { type: 'phone', value: '차단 신고 번호' }],
      desc: '수익 보장 문구와 스팸 신고 이력이 있는 회신 번호가 함께 있는 경우' },
    { id: 'R03', name: '피싱 유도 조합', action: 'block', enabled: true,
      conditions: [{ type: 'word', value: '지금바로클릭' }, { type: 'url', value: '단축 URL' }],
      desc: '즉시 클릭을 유도하는 문구와 단축 URL 이 함께 있는 경우' },
    { id: 'R04', name: '투자 리딩 조합', action: 'hold', enabled: true,
      conditions: [{ type: 'word', value: '원금보장' }, { type: 'word', value: '수익보장' }],
      desc: '투자 원금·수익 보장 문구가 함께 있는 경우 — 정상 금융 광고일 수 있어 보류 처리' },
    { id: 'R05', name: '성인물 유통 조합', action: 'block', enabled: false,
      conditions: [{ type: 'word', value: '몸캠' }, { type: 'url', value: '단축 URL' }],
      desc: '단일 금칙어만으로 이미 즉시 차단되어 규칙은 사용 중지' }
];

/* ---------- 외부기관 차단정보 반영 내역 ---------- */

var SPAM_SYNC_HISTORY = [
    { at: '2026-09-26 04:00:12', source: 'kisa', added: 42, updated: 11, removed: 3, total: 14362, result: 'ok',   actor: '자동 동기화' },
    { at: '2026-09-19 04:00:08', source: 'kisa', added: 27, updated: 6,  removed: 1, total: 14323, result: 'ok',   actor: '자동 동기화' },
    { at: '2026-09-12 04:00:15', source: 'kisa', added: 35, updated: 9,  removed: 0, total: 14297, result: 'ok',   actor: '자동 동기화' },
    { at: '2026-09-08 11:24:37', source: 'self', added: 8,  updated: 4,  removed: 2, total: 14262, result: 'ok',   actor: '관리자(이수민) 수동 등록' },
    { at: '2026-09-05 04:00:11', source: 'kisa', added: 0,  updated: 0,  removed: 0, total: 14256, result: 'fail', actor: '자동 동기화', note: '외부기관 API 응답 지연 — 다음 회차 재시도' },
    { at: '2026-08-29 04:00:09', source: 'kisa', added: 19, updated: 3,  removed: 1, total: 14256, result: 'ok',   actor: '자동 동기화' }
];

/* ---------- 탐지·차단 결과 로그 ----------
 * 인증기준 5.2-03: 계정, 발신번호, 일시, 탐지정보, 조합, 차단/보류, 관리자 결과를 1년 이상 기록.
 *   회원(계정)   memberId · memberName · loginId
 *   발신번호     caller
 *   일시         at (탐지일시) · decidedAt (처리일시)
 *   탐지정보     matched (탐지된 차단정보) · content (메시지 원문)
 *   조합         rule (적용된 다중 조합 규칙, 단일 탐지는 '-')
 *   차단/보류    action
 *   관리자 결과  holdStatus · approver(처리자) · decidedAt · decisionReason
 * 목록은 최신순이다. */
var SPAM_DETECTIONS = [
    {
        id: 'D-20260928-0007', at: '2026-09-28 10:42:17',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 4200, ip: '121.190.24.5',
        content: '(광고) 지금바로클릭! 무료 이벤트 당첨 확인 ▶ https://bit.ly/abcd12 무료거부 08012345678',
        matched: [{ type: 'word', value: '지금바로클릭' }, { type: 'word', value: '무료' }, { type: 'word', value: '당첨' }, { type: 'url', value: 'bit.ly' }],
        rule: 'R03 피싱 유도 조합', action: 'block', holdStatus: null
    },
    {
        id: 'D-20260928-0003', at: '2026-09-28 09:31:05',
        memberId: 'M004', memberName: '박선거', loginId: 'election@example.com',
        msgType: '선거문자(LMS)', caller: '02-987-6543', count: 15000, ip: '175.223.10.44',
        content: '기호 1번 OOO 후보입니다. 원금보장 수익보장 정책으로 지역 경제를 살리겠습니다.',
        matched: [{ type: 'word', value: '원금보장' }, { type: 'word', value: '수익보장' }],
        rule: 'R04 투자 리딩 조합', action: 'hold', holdStatus: 'pending'
    },
    {
        id: 'D-20260926-0012', at: '2026-09-26 15:02:48',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 6300, ip: '121.190.24.5',
        content: '(광고) 추석 연휴 한정! 원금보장 수익보장 재테크 리딩방 무료 입장 ▶ https://me2.do/Fx8kQ 무료거부 08012345678',
        matched: [{ type: 'word', value: '원금보장' }, { type: 'word', value: '수익보장' }, { type: 'word', value: '무료' }, { type: 'url', value: 'me2.do' }],
        rule: 'R04 투자 리딩 조합', action: 'hold', holdStatus: 'forced',
        approver: '이수민(smlee@ibank.co.kr)', decidedAt: '2026-09-26 15:19:32',
        verify: '관리자 콘솔', decidedIp: '10.0.3.21',
        decisionReason: '투자 리딩방 유인 문구 확인 — 유사투자자문업 미신고 업체 광고로 판단, 승인 담당자 검토 전 운영자 차단'
    },
    {
        id: 'D-20260925-0009', at: '2026-09-25 11:38:20',
        memberId: 'M001', memberName: '홍길동', loginId: 'hong@example.com',
        msgType: '일반문자(SMS)', caller: '02-1234-5678', count: 320, ip: '211.36.142.77',
        content: '[아이뱅크] 10월 정기 점검 안내드립니다. 점검 중 서비스 이용이 무료로 제공됩니다.',
        matched: [{ type: 'word', value: '무료' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '김담당(admin@ibank.co.kr)', decidedAt: '2026-09-25 11:52:06',
        approvalNo: 'APV-2609251152-8841', verify: 'email-otp', decidedIp: '211.36.142.77',
        decisionReason: '점검 안내 문구로 광고성 아님 — 오탐 확인'
    },
    {
        id: 'D-20260924-0015', at: '2026-09-24 16:47:02',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(SMS)', caller: '1588-0000', count: 640, ip: '121.190.24.5',
        content: '(광고) 가을맞이 무료 체험 이벤트! 자세히 보기 https://me2.do/xyz 무료거부 08012345678',
        matched: [{ type: 'word', value: '무료' }, { type: 'url', value: 'me2.do' }],
        rule: '-', action: 'hold', holdStatus: 'rejected',
        approver: '이승인(approve@corp.co.kr)', decidedAt: '2026-09-24 17:10:41',
        verify: 'email-otp', decidedIp: '121.190.24.5',
        decisionReason: '광고 수신동의 확보 내역이 확인되지 않아 반려'
    },
    {
        id: 'D-20260923-0006', at: '2026-09-23 09:22:35',
        memberId: 'M003', memberName: '이영희', loginId: 'lee@example.com',
        msgType: '광고문자(LMS)', caller: '010-5555-1234', count: 8800, ip: '58.226.11.9',
        content: '(광고) 신용조회없이 당일 대출 가능! 상담 070-1234-5678 무료거부 08012345678',
        matched: [{ type: 'word', value: '신용조회없이' }, { type: 'phone', value: '070-1234-5678' }],
        rule: '-', action: 'block', holdStatus: null
    },
    {
        id: 'D-20260922-0010', at: '2026-09-22 10:14:58',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 12000, ip: '203.0.113.1',
        content: '(광고) 카지노 첫 충전 200% 당첨 이벤트 ▶ https://win-lotto.xyz 무료거부 08012345678',
        matched: [{ type: 'word', value: '카지노' }, { type: 'word', value: '당첨' }, { type: 'url', value: 'win-lotto.xyz' }],
        rule: 'R01 도박 유인 조합', action: 'block', holdStatus: null
    },
    {
        id: 'D-20260918-0009', at: '2026-09-18 13:29:16',
        memberId: 'M001', memberName: '홍길동', loginId: 'hong@example.com',
        msgType: '일반문자(SMS)', caller: '02-1234-5678', count: 90, ip: '211.36.142.77',
        content: '[아이뱅크] 이번 달 이벤트 당첨자 안내입니다. 자세한 내용은 고객센터로 문의해주세요.',
        matched: [{ type: 'word', value: '당첨' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '김담당(admin@ibank.co.kr)', decidedAt: '2026-09-18 13:41:52',
        approvalNo: 'APV-2609181341-2207', verify: 'email-otp', decidedIp: '211.36.142.77',
        decisionReason: '자사 이벤트 당첨 안내 — 정상 발송 확인'
    },
    {
        id: 'D-20260917-0021', at: '2026-09-17 17:52:39',
        memberId: 'M003', memberName: '이영희', loginId: 'lee@example.com',
        msgType: '광고문자(LMS)', caller: '010-5555-1234', count: 2100, ip: '58.226.11.9',
        content: '(광고) 무료 상담! 수익보장 투자 정보 070-1234-5678 무료거부 08012345678',
        matched: [{ type: 'word', value: '무료' }, { type: 'word', value: '수익보장' }, { type: 'phone', value: '070-1234-5678' }],
        rule: 'R02 불법 대부 조합', action: 'block', holdStatus: null
    },
    {
        id: 'D-20260915-0008', at: '2026-09-15 20:11:09',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(MMS)', caller: '1588-0000', count: 2500, ip: '121.190.24.5',
        content: '(광고) 신규가입 즉시 3만원 지급! 토토 안전놀이터 ▶ https://free-money.top/join 무료거부 08012345678',
        matched: [{ type: 'word', value: '토토' }, { type: 'url', value: 'free-money.top' }],
        rule: '-', action: 'block', holdStatus: null
    },
    {
        id: 'D-20260911-0005', at: '2026-09-11 14:36:44',
        memberId: 'M001', memberName: '홍길동', loginId: 'hong@example.com',
        msgType: '일반문자(LMS)', caller: '02-1234-5678', count: 1200, ip: '211.36.142.77',
        content: '[아이뱅크] 9월 고객 만족도 설문에 참여해주세요. 참여하기 ▶ https://bit.ly/ibank-survey',
        matched: [{ type: 'url', value: 'bit.ly' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '김담당(admin@ibank.co.kr)', decidedAt: '2026-09-11 14:49:10',
        approvalNo: 'APV-2609111449-5530', verify: 'email-otp', decidedIp: '211.36.142.77',
        decisionReason: '자사 설문 링크 — 단축 URL 목적지(survey.ibank.co.kr) 확인, 정상 발송'
    },
    {
        id: 'D-20260908-0013', at: '2026-09-08 18:05:27',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 3400, ip: '121.190.24.5',
        content: '(광고) 가을 신상품 무료 배송 이벤트 ▶ https://bit.ly/aut26 무료거부 08012345678',
        matched: [{ type: 'word', value: '무료' }, { type: 'url', value: 'bit.ly' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '이승인(approve@corp.co.kr)', decidedAt: '2026-09-08 18:12:40',
        approvalNo: 'APV-2609081812-7719', verify: 'email-otp', decidedIp: '121.190.24.5',
        decisionReason: '자사 쇼핑몰 이벤트 링크 목적지 확인 — 수신동의 고객 대상 정상 광고'
    },
    {
        id: 'D-20260904-0002', at: '2026-09-04 08:57:13',
        memberId: 'M003', memberName: '이영희', loginId: 'lee@example.com',
        msgType: '광고문자(SMS)', caller: '010-5555-1234', count: 300, ip: '58.226.11.9',
        content: '(광고) 직장인 작업대출 당일 승인 상담 ▶ cash-loan.click 무료거부 08012345678',
        matched: [{ type: 'word', value: '작업대출' }, { type: 'url', value: 'cash-loan.click' }],
        rule: '-', action: 'block', holdStatus: null
    }
];

/* ---------- 탐지·차단 로그 보관 정책 ----------
 * 인증기준 5.2-03 은 1년 이상 기록을 요구한다. 톡벨은 3년 보관한다.
 * 최근 12개월은 운영 DB 와 아카이브 저장소에 이중 보관하고, 12개월이 지난 로그는
 * 아카이브 저장소(WORM — 한 번 쓰면 수정·삭제 불가)에만 남긴다. 조회 요청 시 복원한다.
 * 보관 기간이 지난 월은 다음 달 5일 정기 파기 작업에서 파기하고 파기 대장에 기록한다.
 *
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET /api/admin/spam/detections/retention   보관 현황(기간별 건수·저장 위치·무결성 검증)
 */
var SPAM_LOG_RETENTION = {
    years: 3,
    since: '2024-10-01',                                     // 탐지 로그 수집 개시일
    firstLog: { id: 'D-20241002-0001', at: '2024-10-02 10:41:07' },
    lastVerifiedAt: '2026-09-01 03:00:14',                   // 월 1회 해시 검증(매월 1일 03:00)
    archivePath: 'archive://tokbell-log/spam-detection/',
    // 기간별 보관 현황 — 당월(진행 중)은 화면에서 SPAM_DETECTIONS 로 계산한다
    periods: [
        { label: '2026-08',         from: '2026-08', to: '2026-08', total: 19, block: 10, hold: 9,  store: 'dual',    verify: 'ok' },
        { label: '2026-07',         from: '2026-07', to: '2026-07', total: 17, block: 9,  hold: 8,  store: 'dual',    verify: 'ok' },
        { label: '2026년 2분기',    from: '2026-04', to: '2026-06', total: 52, block: 27, hold: 25, store: 'dual',    verify: 'ok' },
        { label: '2026년 1분기',    from: '2026-01', to: '2026-03', total: 47, block: 24, hold: 23, store: 'dual',    verify: 'ok' },
        { label: '2025년 4분기',    from: '2025-10', to: '2025-12', total: 44, block: 23, hold: 21, store: 'dual',    verify: 'ok' },
        { label: '2025년 3분기',    from: '2025-07', to: '2025-09', total: 39, block: 21, hold: 18, store: 'archive', verify: 'ok' },
        { label: '2025년 2분기',    from: '2025-04', to: '2025-06', total: 31, block: 17, hold: 14, store: 'archive', verify: 'ok' },
        { label: '2025년 1분기',    from: '2025-01', to: '2025-03', total: 26, block: 15, hold: 11, store: 'archive', verify: 'ok' },
        { label: '2024년 4분기',    from: '2024-10', to: '2024-12', total: 18, block: 11, hold: 7,  store: 'archive', verify: 'ok' }
    ],
    disposals: []                                            // 파기 대장 — 최초 파기는 2027-11-05 예정
};

var SPAM_STORE_LABEL = {
    db:      '운영 DB',
    dual:    '운영 DB + 아카이브',
    archive: '아카이브'
};

/* ---------- 헬퍼 ---------- */

function spamTypeBadge(type) {
    var meta = SPAM_TYPE[type] || SPAM_TYPE.word;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}

function spamActionBadge(action) {
    var meta = SPAM_ACTION[action] || SPAM_ACTION.hold;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}

function spamSourceBadge(source) {
    var meta = SPAM_SOURCE[source] || SPAM_SOURCE.self;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}

function spamHoldBadge(status) {
    if (!status) return '<span style="color:var(--admin-text-muted);">-</span>';
    var meta = SPAM_HOLD_STATUS[status] || SPAM_HOLD_STATUS.pending;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}

function spamEscape(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* 탐지된 차단정보를 칩으로 나열 */
function spamMatchedChips(matched) {
    if (!matched || !matched.length) return '-';
    return matched.map(function (m) {
        var meta = SPAM_TYPE[m.type] || SPAM_TYPE.word;
        return '<span class="spam-chip ' + m.type + '" title="' + meta.label + '">' + spamEscape(m.value) + '</span>';
    }).join(' ');
}

/* 메시지 원문에서 탐지된 부분을 표시 — 증빙 화면에서 탐지 근거를 보여준다 */
function spamHighlight(content, matched) {
    var html = spamEscape(content);
    (matched || []).forEach(function (m) {
        var safe = spamEscape(m.value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html = html.replace(new RegExp(safe, 'g'), '<mark class="spam-mark ' + m.type + '">' + spamEscape(m.value) + '</mark>');
    });
    return html;
}

function getSpamDetection(id) {
    return SPAM_DETECTIONS.filter(function (d) { return d.id === id; })[0] || null;
}
