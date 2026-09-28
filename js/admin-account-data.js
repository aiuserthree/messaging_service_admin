/* 관리자 계정 공통 데이터·헬퍼
 *
 * 관리자 계정의 생성 → 권한 변경 → 삭제(탈퇴·말소) 전 과정을 한 곳에서 관리하기 위한 데이터 모듈이다.
 * user-list.html(관리자 계정 관리)과 admin-account-delete.html(계정 생성·삭제·권한 변경 관리대장)이
 * 함께 사용하며, 두 화면은 반드시 이 파일의 목록을 기준으로 표시한다(화면별 사본을 두지 않는다).
 *
 * 계정 운영 원칙 (운영정책서 11.2 관리자 계정 관리)
 *   1. 관리자 계정은 사내 도메인(@ibank.co.kr) 발급이 원칙이다.
 *   2. 외부 도메인 계정은 협력사(유지보수 등) 투입 인력에 한해 발급하며,
 *      도메인 소유·재직 확인과 계약 근거가 있어야 하고 사용 기한은 최대 6개월이다.
 *      개인 메일(무료 메일) 도메인은 발급할 수 없고, 최고 관리자 권한은 부여할 수 없다.
 *      분기 1회 소유·재직 여부를 재확인하며, 기한이 지나면 자동 정지된다.
 *   3. 계정 생성·삭제·권한 변경은 모두 요청 → 승인 → 처리 순서를 거치며, 처리는 최고 관리자만 할 수 있다.
 *      승인자와 처리자는 같은 사람일 수 없다(직무 분리).
 *   4. 요청자·승인자·처리자와 요청·승인·처리 일시, 사유, 변경 전·후 권한이 관리대장에 기록되며
 *      기록은 수정·삭제할 수 없다(분기 1회 검토·감사).
 *
 * 처리번호 체계
 *   CRT-YYYY-NNNN  계정 생성          DEL-YYYY-NNNN  계정 삭제(탈퇴·말소)
 *   CHG-YYYY-NNNN  계정 권한 변경      GRP-YYYY-NNNN  권한 그룹 생성·수정·삭제
 *
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET  /api/admin/accounts                      관리자 계정 목록 (소속·도메인 구분·상태)
 *   POST /api/admin/accounts                      계정 생성 (요청자·승인자·사유 필수, 외부 도메인은 통제 항목 필수)
 *   POST /api/admin/accounts/{email}/delete       계정 삭제(말소)
 *   POST /api/admin/accounts/{email}/role         권한 변경
 *   GET  /api/admin/accounts/ledger               계정 생성·삭제·권한 변경 관리대장 (기간·구분·권한·키워드)
 *   GET  /api/admin/permission-groups/history     권한 그룹 생성·수정·삭제 이력
 *   GET  /api/admin/accounts/external             외부 도메인 계정 통제 현황 (소유 확인·계약·사용 기한)
 */

var ADMIN_PERMISSION_GROUPS = ['최고 관리자', '운영 관리자', '심사 관리자', '고객 지원', '일반 관리자'];
var ADMIN_SUPER_ROLE = '최고 관리자';

var ADMIN_ROLE_BADGE = {
    '최고 관리자': 'badge-danger',
    '운영 관리자': 'badge-warning',
    '심사 관리자': 'badge-info',
    '고객 지원': 'badge-secondary',
    '일반 관리자': 'badge-secondary'
};

/* 사내 도메인 · (주)아이뱅크 부서 */
var ADMIN_INTERNAL_DOMAIN = 'ibank.co.kr';
var ADMIN_COMPANY = '(주)아이뱅크';
var ADMIN_DEPARTMENTS = ['정보보호팀', '서비스운영팀', '고객지원팀', '개발팀', '사업기획팀', '경영지원팀'];

/* 외부 도메인 계정 통제 기준 */
var ADMIN_EXTERNAL_POLICY = {
    maxMonths: 6,              // 사용 기한 최대 개월 수
    checkCycle: '분기 1회',     // 소유·재직 재확인 주기
    ownershipMethods: [
        '협력사 도메인 WHOIS 소유자 확인 + 재직증명서',
        '협력사 공문(도메인 소유 확인서) + 재직증명서',
        '협력사 메일 서버 발신 확인 + 재직증명서'
    ]
};

/* 개인 메일(무료 메일) 도메인 — 관리자 계정 발급 불가 */
var ADMIN_FREE_MAIL_DOMAINS = [
    'gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'kakao.com', 'nate.com',
    'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com', 'yahoo.co.kr', 'icloud.com', 'me.com', 'korea.com'
];

/* 승인권자 — 계정 생성·삭제·권한 변경 승인 (승인자와 처리자는 같은 사람일 수 없다) */
var ADMIN_APPROVERS = [
    '김태윤 (정보보호최고책임자)',
    '박정호 (정보보호팀장)',
    '한동석 (서비스운영팀장)'
];

/* 요청자 입력 추천 목록 (부서장·인사 담당) — 직접 입력도 가능 */
var ADMIN_REQUESTER_SUGGESTIONS = [
    '한동석 (서비스운영팀장)',
    '박정호 (정보보호팀장)',
    '서민재 (개발팀장)',
    '정유라 (경영지원팀 · 인사)',
    '고은비 (고객지원팀장)'
];

/* 관리자 계정 목록 — 현재 존재하는(정상·정지) 계정. 삭제(말소)된 계정은 ADMIN_DELETE_HISTORY 에만 남는다.
 * external: 외부 도메인 계정의 소유·통제 항목 (보안심사 3.2-02) */
var ADMIN_ACCOUNTS = [
    {
        email: 'jhpark@ibank.co.kr', name: '박정호', role: '최고 관리자',
        org: '(주)아이뱅크 정보보호팀', domainType: 'internal',
        createdAt: '2024-01-01', lastLogin: '2026-09-28 09:05', status: '정상'
    },
    {
        email: 'nykim@ibank.co.kr', name: '김나영', role: '최고 관리자',
        org: '(주)아이뱅크 서비스운영팀', domainType: 'internal',
        createdAt: '2024-01-01', lastLogin: '2026-09-25 18:12', status: '정상'
    },
    {
        email: 'smlee@ibank.co.kr', name: '이수민', role: '운영 관리자',
        org: '(주)아이뱅크 서비스운영팀', domainType: 'internal',
        createdAt: '2024-01-15', lastLogin: '2026-09-28 08:47', status: '정상'
    },
    {
        email: 'hnjung@ibank.co.kr', name: '정하늘', role: '운영 관리자',
        org: '(주)아이뱅크 서비스운영팀', domainType: 'internal',
        createdAt: '2024-03-02', lastLogin: '2026-09-26 17:33', status: '정상'
    },
    {
        email: 'jayoon@ibank.co.kr', name: '윤지아', role: '운영 관리자',
        org: '(주)아이뱅크 고객지원팀', domainType: 'internal',
        createdAt: '2024-02-10', lastLogin: '2026-09-28 09:12', status: '정상'
    },
    {
        email: 'jwhan@ibank.co.kr', name: '한지우', role: '심사 관리자',
        org: '(주)아이뱅크 서비스운영팀', domainType: 'internal',
        createdAt: '2026-02-16', lastLogin: '2026-09-28 08:58', status: '정상'
    },
    {
        email: 'symoon@ibank.co.kr', name: '문서연', role: '고객 지원',
        org: '(주)아이뱅크 고객지원팀', domainType: 'internal',
        createdAt: '2026-04-06', lastLogin: '2026-09-27 16:21', status: '정상'
    },
    {
        email: 'mskang@ibank.co.kr', name: '강민서', role: '일반 관리자',
        org: '(주)아이뱅크 사업기획팀', domainType: 'internal',
        createdAt: '2025-06-11', lastLogin: '2026-01-28 14:02', status: '정지',
        statusNote: '90일 이상 미접속 — 2026-04-28 자동 정지'
    },
    {
        email: 'tmjang@nexsolution.co.kr', name: '장태민', role: '일반 관리자',
        org: '(주)넥스솔루션 (유지보수 협력사)', domainType: 'external',
        createdAt: '2026-07-01', lastLogin: '2026-09-25 10:41', status: '정상',
        external: {
            company: '(주)넥스솔루션', domain: 'nexsolution.co.kr',
            ownershipCheck: '협력사 도메인 WHOIS 소유자 확인 + 재직증명서',
            contract: 'IB-MA-2026-014 톡벨 운영 유지보수 계약 (2026-07-01 ~ 2026-12-31)',
            internalOwner: '한동석 (서비스운영팀장)',
            approver: '박정호 (정보보호팀장)', approvedAt: '2026-06-29 16:10',
            expiresAt: '2026-12-31',
            lastCheckedAt: '2026-09-15', checkResult: '적합 — 재직·계약 유효 확인', checkOk: true
        }
    },
    {
        email: 'yhbaek@datalinks.co.kr', name: '백영훈', role: '일반 관리자',
        org: '(주)데이터링크스 (발송 모듈 구축 협력사)', domainType: 'external',
        createdAt: '2026-03-16', lastLogin: '2026-09-14 17:40', status: '정지',
        statusNote: '사용 기한(2026-09-15) 만료 — 2026-09-16 00:00 자동 정지',
        external: {
            company: '(주)데이터링크스', domain: 'datalinks.co.kr',
            ownershipCheck: '협력사 공문(도메인 소유 확인서) + 재직증명서',
            contract: 'IB-DV-2026-006 대량 발송 모듈 고도화 용역 (2026-03-16 ~ 2026-09-15)',
            internalOwner: '서민재 (개발팀장)',
            approver: '박정호 (정보보호팀장)', approvedAt: '2026-03-13 11:25',
            expiresAt: '2026-09-15',
            lastCheckedAt: '2026-09-16', checkResult: '기한 만료 — 자동 정지 (연장 계약 미체결 시 삭제 예정)', checkOk: false
        }
    }
];

/* 계정 생성 이력 — 모든 계정(삭제된 계정 포함)은 생성 이력이 있어야 한다.
 * initial: 서비스 오픈 전 초기 구축 계정 */
var ADMIN_CREATE_HISTORY = [
    {
        id: 'CRT-2024-0001', name: '박정호', email: 'jhpark@ibank.co.kr', org: '(주)아이뱅크 정보보호팀',
        domainType: 'internal', role: '최고 관리자', initial: true,
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '서비스 오픈 전 관리자 시스템 초기 구축 — 정보보호 총괄 최고 관리자 계정',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:12'
    },
    {
        id: 'CRT-2024-0002', name: '김나영', email: 'nykim@ibank.co.kr', org: '(주)아이뱅크 서비스운영팀',
        domainType: 'internal', role: '일반 관리자', initial: true,
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '서비스 오픈 전 관리자 시스템 초기 구축 — 서비스운영팀 조회 담당',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '박정호', processedAt: '2024-01-01 09:14:37'
    },
    {
        id: 'CRT-2024-0003', name: '이수민', email: 'smlee@ibank.co.kr', org: '(주)아이뱅크 서비스운영팀',
        domainType: 'internal', role: '운영 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2024-01-12 14:05',
        reason: '발송 운영·회원 관리 담당자 배치',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2024-01-15 09:30',
        processor: '박정호', processedAt: '2024-01-15 10:02:48'
    },
    {
        id: 'CRT-2024-0004', name: '오세훈', email: 'shoh@ibank.co.kr', org: '(주)아이뱅크 고객지원팀',
        domainType: 'internal', role: '고객 지원',
        requester: '고은비 (고객지원팀장)', requestedAt: '2024-01-30 11:40',
        reason: '고객센터 상담 인력 신규 배치',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2024-01-31 17:15',
        processor: '박정호', processedAt: '2024-02-01 09:21:05'
    },
    {
        id: 'CRT-2024-0005', name: '윤지아', email: 'jayoon@ibank.co.kr', org: '(주)아이뱅크 고객지원팀',
        domainType: 'internal', role: '고객 지원',
        requester: '고은비 (고객지원팀장)', requestedAt: '2024-02-07 15:22',
        reason: '고객센터 상담 인력 신규 배치',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2024-02-08 10:04',
        processor: '박정호', processedAt: '2024-02-10 09:47:31'
    },
    {
        id: 'CRT-2024-0006', name: '정하늘', email: 'hnjung@ibank.co.kr', org: '(주)아이뱅크 서비스운영팀',
        domainType: 'internal', role: '운영 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2024-02-28 16:10',
        reason: '발신번호·발송 정책 운영 담당자 충원',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2024-02-29 13:20',
        processor: '박정호', processedAt: '2024-03-02 10:11:09'
    },
    {
        id: 'CRT-2024-0007', name: '최유진', email: 'yjchoi@ibank.co.kr', org: '(주)아이뱅크 서비스운영팀',
        domainType: 'internal', role: '운영 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2024-05-16 09:50',
        reason: '결제·정산 운영 담당자 배치',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2024-05-17 14:35',
        processor: '박정호', processedAt: '2024-05-20 09:33:52'
    },
    {
        id: 'CRT-2024-0008', name: '서지훈', email: 'jhseo@ibank.co.kr', org: '(주)아이뱅크 고객지원팀',
        domainType: 'internal', role: '고객 지원',
        requester: '고은비 (고객지원팀장)', requestedAt: '2024-05-30 10:12',
        reason: '고객센터 상담 인력 충원',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2024-05-31 16:48',
        processor: '박정호', processedAt: '2024-06-03 09:05:27'
    },
    {
        id: 'CRT-2025-0001', name: '강민서', email: 'mskang@ibank.co.kr', org: '(주)아이뱅크 사업기획팀',
        domainType: 'internal', role: '일반 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2025-06-09 13:25',
        reason: '발송 통계·리포트 조회 목적 (조회 전용 최소 권한)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-06-10 11:02',
        processor: '박정호', processedAt: '2025-06-11 10:18:44'
    },
    {
        id: 'CRT-2026-0001', name: '류승완', email: 'swryu@nexsolution.co.kr', org: '(주)넥스솔루션 (유지보수 협력사)',
        domainType: 'external', role: '일반 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2025-12-29 10:40',
        reason: '톡벨 운영 유지보수 계약에 따른 협력사 투입 인력 — 장애 대응 시 로그 조회 목적',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-12-30 15:12',
        processor: '박정호', processedAt: '2026-01-02 14:26:03',
        external: {
            company: '(주)넥스솔루션', domain: 'nexsolution.co.kr',
            ownershipCheck: '협력사 도메인 WHOIS 소유자 확인 + 재직증명서',
            contract: 'IB-MA-2026-003 톡벨 운영 유지보수 계약 (2026-01-01 ~ 2026-06-30)',
            internalOwner: '한동석 (서비스운영팀장)', expiresAt: '2026-06-30'
        }
    },
    {
        id: 'CRT-2026-0002', name: '한지우', email: 'jwhan@ibank.co.kr', org: '(주)아이뱅크 서비스운영팀',
        domainType: 'internal', role: '심사 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2026-02-12 15:30',
        reason: '심사 담당 오세훈 퇴사에 따른 발신번호·템플릿 심사 업무 인수',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-02-13 10:05',
        processor: '김나영', processedAt: '2026-02-16 09:12:40'
    },
    {
        id: 'CRT-2026-0003', name: '백영훈', email: 'yhbaek@datalinks.co.kr', org: '(주)데이터링크스 (발송 모듈 구축 협력사)',
        domainType: 'external', role: '일반 관리자',
        requester: '서민재 (개발팀장)', requestedAt: '2026-03-12 14:18',
        reason: '대량 발송 모듈 고도화 용역 — 발송 이력·통계 조회 및 검수 목적',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-03-13 11:25',
        processor: '김나영', processedAt: '2026-03-16 10:03:17',
        external: {
            company: '(주)데이터링크스', domain: 'datalinks.co.kr',
            ownershipCheck: '협력사 공문(도메인 소유 확인서) + 재직증명서',
            contract: 'IB-DV-2026-006 대량 발송 모듈 고도화 용역 (2026-03-16 ~ 2026-09-15)',
            internalOwner: '서민재 (개발팀장)', expiresAt: '2026-09-15'
        }
    },
    {
        id: 'CRT-2026-0004', name: '문서연', email: 'symoon@ibank.co.kr', org: '(주)아이뱅크 고객지원팀',
        domainType: 'internal', role: '고객 지원',
        requester: '고은비 (고객지원팀장)', requestedAt: '2026-04-01 11:05',
        reason: '윤지아 직무 변경(운영 관리자)에 따른 고객센터 상담 인력 충원',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2026-04-02 09:40',
        processor: '박정호', processedAt: '2026-04-06 09:28:55'
    },
    {
        id: 'CRT-2026-0005', name: '장태민', email: 'tmjang@nexsolution.co.kr', org: '(주)넥스솔루션 (유지보수 협력사)',
        domainType: 'external', role: '일반 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2026-06-26 13:50',
        reason: '유지보수 계약 갱신 및 협력사 투입 인력 교체(전임 류승완) — 장애 대응 시 로그 조회 목적',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-06-29 16:10',
        processor: '김나영', processedAt: '2026-07-01 09:41:22',
        external: {
            company: '(주)넥스솔루션', domain: 'nexsolution.co.kr',
            ownershipCheck: '협력사 도메인 WHOIS 소유자 확인 + 재직증명서',
            contract: 'IB-MA-2026-014 톡벨 운영 유지보수 계약 (2026-07-01 ~ 2026-12-31)',
            internalOwner: '한동석 (서비스운영팀장)', expiresAt: '2026-12-31'
        }
    }
];

/* 계정 삭제(탈퇴·말소) 이력 */
var ADMIN_DELETE_HISTORY = [
    {
        id: 'DEL-2025-0001', name: '서지훈', email: 'jhseo@ibank.co.kr', role: '고객 지원', domainType: 'internal',
        type: '자진 탈퇴',
        requester: '서지훈 (본인)', requestedAt: '2025-11-05 10:32',
        reason: '담당 업무 종료 및 인수인계 완료로 계정 삭제',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-11-06 14:10',
        processor: '박정호', processedAt: '2025-11-07 16:48:19'
    },
    {
        id: 'DEL-2026-0001', name: '최유진', email: 'yjchoi@ibank.co.kr', role: '운영 관리자', domainType: 'internal',
        type: '권한 말소',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2026-01-02 17:05',
        reason: '부서 이동(서비스운영팀 → 재무팀)으로 인한 관리자 권한 말소',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-01-05 09:20',
        processor: '김나영', processedAt: '2026-01-05 14:22:05'
    },
    {
        id: 'DEL-2026-0002', name: '오세훈', email: 'shoh@ibank.co.kr', role: '심사 관리자', domainType: 'internal',
        type: '퇴사 삭제',
        requester: '정유라 (경영지원팀 · 인사)', requestedAt: '2026-02-10 11:30',
        reason: '2026-02-12 자 퇴사에 따른 관리자 계정 삭제',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2026-02-11 16:45',
        processor: '김나영', processedAt: '2026-02-12 09:10:41'
    },
    {
        id: 'DEL-2026-0003', name: '류승완', email: 'swryu@nexsolution.co.kr', role: '일반 관리자', domainType: 'external',
        type: '계약 종료',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2026-06-26 13:50',
        reason: '유지보수 계약(IB-MA-2026-003) 기간 만료 및 협력사 투입 인력 교체에 따른 외부 계정 삭제',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-06-29 16:10',
        processor: '김나영', processedAt: '2026-06-30 18:02:36'
    }
];

/* 계정 권한 변경 이력 */
var ADMIN_CHANGE_HISTORY = [
    {
        id: 'CHG-2025-0001', name: '오세훈', email: 'shoh@ibank.co.kr', domainType: 'internal',
        beforeRole: '고객 지원', afterRole: '심사 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2025-12-01 15:40',
        reason: '발신번호·템플릿 심사 담당으로 직무 변경',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-12-02 10:15',
        processor: '박정호', processedAt: '2025-12-02 13:41:57'
    },
    {
        id: 'CHG-2026-0001', name: '김나영', email: 'nykim@ibank.co.kr', domainType: 'internal',
        beforeRole: '일반 관리자', afterRole: '최고 관리자',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2025-12-31 16:20',
        reason: '일반 직원에서 문자 발송 운영 총괄로 직무가 확대되어 최고 관리자 권한을 요청합니다 (최고 관리자 2인 체계)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-01-02 09:30',
        processor: '박정호', processedAt: '2026-01-02 10:05:33'
    },
    {
        id: 'CHG-2026-0002', name: '윤지아', email: 'jayoon@ibank.co.kr', domainType: 'internal',
        beforeRole: '고객 지원', afterRole: '운영 관리자',
        requester: '고은비 (고객지원팀장)', requestedAt: '2026-03-13 17:02',
        reason: '고객 지원 업무에 발송 정책 관리 업무가 추가되어 운영 관리자 권한 필요',
        approver: '한동석 (서비스운영팀장)', approvedAt: '2026-03-16 09:48',
        processor: '김나영', processedAt: '2026-03-16 11:27:02'
    }
];

/* 권한 그룹 생성·수정·삭제 이력 (권한 그룹 관리 메뉴에서 발생)
 * menu: 권한이 바뀐 메뉴 (대메뉴 > 메뉴) — 그룹 생성·삭제는 빈 값
 * before / after: 읽기 · 쓰기 · 삭제 조합 또는 '권한 없음' */
var ADMIN_GROUP_CHANGE_HISTORY = [
    {
        id: 'GRP-2024-0001', groupName: '최고 관리자', action: '생성', menu: '',
        before: '-', after: '전체 메뉴 읽기·쓰기·삭제',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '관리자 시스템 초기 구축 — 권한 그룹 5종 생성',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:05'
    },
    {
        id: 'GRP-2024-0002', groupName: '운영 관리자', action: '생성', menu: '',
        before: '-', after: '발송·회원·발신번호·결제·고객 지원 읽기·쓰기 / 관리자 계정·보안 메뉴 권한 없음',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '관리자 시스템 초기 구축 — 권한 그룹 5종 생성',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:05'
    },
    {
        id: 'GRP-2024-0003', groupName: '심사 관리자', action: '생성', menu: '',
        before: '-', after: '발신번호 관리·템플릿 심사 읽기·쓰기 / 그 외 읽기',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '관리자 시스템 초기 구축 — 권한 그룹 5종 생성',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:05'
    },
    {
        id: 'GRP-2024-0004', groupName: '고객 지원', action: '생성', menu: '',
        before: '-', after: '고객 지원 읽기·쓰기 / 회원 관리 읽기·쓰기 / 그 외 읽기',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '관리자 시스템 초기 구축 — 권한 그룹 5종 생성',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:05'
    },
    {
        id: 'GRP-2024-0005', groupName: '일반 관리자', action: '생성', menu: '',
        before: '-', after: '대시보드·발송 통계 읽기 (조회 전용 최소 권한)',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2023-12-27 10:20',
        reason: '관리자 시스템 초기 구축 — 권한 그룹 5종 생성',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2023-12-28 15:02',
        processor: '시스템 초기 등록', processedAt: '2024-01-01 09:00:05'
    },
    {
        id: 'GRP-2025-0001', groupName: '심사 관리자', action: '수정', menu: '발신번호 관리 > 발신번호 인증',
        before: '읽기', after: '읽기·쓰기',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2025-04-10 14:30',
        reason: '발신번호 사전등록 서류 심사 업무를 심사 관리자 그룹으로 이관',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-04-11 10:00',
        processor: '박정호', processedAt: '2025-04-14 09:52:18'
    },
    {
        id: 'GRP-2025-0002', groupName: '임시 점검 관리자', action: '생성', menu: '',
        before: '-', after: '보안 및 감사 읽기 (조회 전용)',
        requester: '박정호 (정보보호팀장)', requestedAt: '2025-08-18 11:00',
        reason: '전송자격인증 사전 점검 기간(2025-08-20 ~ 2025-09-30) 내부 점검 인력용 임시 그룹',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-08-19 15:30',
        processor: '박정호', processedAt: '2025-08-20 09:15:40'
    },
    {
        id: 'GRP-2025-0003', groupName: '임시 점검 관리자', action: '삭제', menu: '',
        before: '보안 및 감사 읽기 (조회 전용)', after: '-',
        requester: '박정호 (정보보호팀장)', requestedAt: '2025-09-30 10:05',
        reason: '사전 점검 종료 — 소속 계정 0명 확인 후 임시 그룹 삭제',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2025-09-30 13:20',
        processor: '박정호', processedAt: '2025-09-30 17:48:02'
    },
    {
        id: 'GRP-2026-0001', groupName: '운영 관리자', action: '수정', menu: '스팸·제재 관리 > 탐지·차단 결과 로그',
        before: '읽기', after: '읽기·쓰기',
        requester: '한동석 (서비스운영팀장)', requestedAt: '2026-02-19 16:40',
        reason: '스팸 탐지 오탐 해제 처리를 운영팀에서 직접 수행하도록 업무 조정',
        approver: '박정호 (정보보호팀장)', approvedAt: '2026-02-20 11:10',
        processor: '김나영', processedAt: '2026-02-23 10:31:47'
    },
    {
        id: 'GRP-2026-0002', groupName: '고객 지원', action: '수정', menu: '회원 관리 > 회원 정보 관리',
        before: '읽기·쓰기', after: '읽기',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-05-06 09:50',
        reason: '개인정보 최소 권한 원칙 — 회원 정보 수정은 운영 관리자만 수행',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-05-08 14:00',
        processor: '김나영', processedAt: '2026-05-11 09:06:29'
    },
    {
        id: 'GRP-2026-0003', groupName: '일반 관리자', action: '수정', menu: '보안 및 감사 > 관리자 접근 로그',
        before: '읽기', after: '권한 없음',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-06-24 15:15',
        reason: '외부 도메인(협력사) 계정이 속한 그룹의 권한 최소화 — 타 관리자 접근 기록 열람 차단',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-06-26 10:20',
        processor: '김나영', processedAt: '2026-06-29 09:44:13'
    },
    /* 2026-07-01 분기 정기 권한 검토 — 같은 그룹 안에서 불필요한 메뉴 권한 회수 (관리자별 권한 현황 메뉴의 검토 기록과 일치) */
    {
        id: 'GRP-2026-0004', groupName: '운영 관리자', action: '수정', menu: '메인 > 대시보드',
        before: '읽기·쓰기', after: '읽기',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-06-30 14:00',
        reason: '분기 정기 권한 검토 — 최소 권한 재조정 (대시보드 쓰기 회수)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-06-30 17:30',
        processor: '김나영', processedAt: '2026-07-01 09:20:11'
    },
    {
        id: 'GRP-2026-0005', groupName: '운영 관리자', action: '수정', menu: '관리자 계정 > 관리자 계정 관리',
        before: '읽기', after: '권한 없음',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-06-30 14:00',
        reason: '분기 정기 권한 검토 — 최소 권한 재조정 (관리자 계정 메뉴 권한 회수, 최고 관리자만 접근)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-06-30 17:30',
        processor: '김나영', processedAt: '2026-07-01 09:22:47'
    },
    {
        id: 'GRP-2026-0006', groupName: '고객 지원', action: '수정', menu: '회원 관리 > 회원 목록',
        before: '읽기·쓰기', after: '읽기',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-06-30 14:00',
        reason: '분기 정기 권한 검토 — 최소 권한 재조정 (회원 목록 쓰기 회수, 조회만 유지)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-06-30 17:30',
        processor: '김나영', processedAt: '2026-07-01 09:25:03'
    },
    {
        id: 'GRP-2026-0007', groupName: '일반 관리자', action: '수정', menu: '회원 관리 > 회원 목록 · 고객 지원 > 문의 관리',
        before: '읽기', after: '권한 없음',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-06-30 14:00',
        reason: '분기 정기 권한 검토 — 최소 권한 재조정 (회원 목록·문의 관리 조회 회수, 개인정보 열람 최소화)',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-06-30 17:30',
        processor: '김나영', processedAt: '2026-07-01 09:27:36'
    },
    {
        id: 'GRP-2026-0008', groupName: '최고 관리자', action: '수정', menu: '관리자 계정 > 관리자별 권한 현황',
        before: '권한 없음', after: '읽기·쓰기·삭제',
        requester: '박정호 (정보보호팀장)', requestedAt: '2026-09-17 11:30',
        reason: '신규 메뉴(관리자별 권한 현황) 추가에 따른 최고 관리자 그룹 권한 부여',
        approver: '김태윤 (정보보호최고책임자)', approvedAt: '2026-09-18 16:05',
        processor: '김나영', processedAt: '2026-09-21 10:12:08'
    }
];

/* ---------- 헬퍼 (admin-common.js 로드 순서와 무관하게 동작하도록 자체 정의) ---------- */

function adminEscapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
}

function adminRoleBadge(role) {
    if (!role || role === '-') return '-';
    return '<span class="badge ' + (ADMIN_ROLE_BADGE[role] || 'badge-secondary') + '">' + adminEscapeHtml(role) + '</span>';
}

function adminEmailDomain(email) {
    var parts = String(email || '').trim().toLowerCase().split('@');
    return parts.length === 2 ? parts[1] : '';
}

/* 사내 도메인(@ibank.co.kr) 여부 */
function isInternalDomain(email) {
    return adminEmailDomain(email) === ADMIN_INTERNAL_DOMAIN;
}

/* 개인 메일(무료 메일) 도메인 여부 — 관리자 계정 발급 불가 */
function isFreeMailDomain(email) {
    return ADMIN_FREE_MAIL_DOMAINS.indexOf(adminEmailDomain(email)) !== -1;
}

function adminDomainBadge(domainType) {
    return domainType === 'external'
        ? '<span class="badge badge-warning">외부</span>'
        : '<span class="badge badge-success">내부</span>';
}

function adminStatusBadge(status) {
    return status === '정지'
        ? '<span class="badge badge-warning">정지</span>'
        : '<span class="badge badge-success">정상</span>';
}

function getAdminAccount(email) {
    return ADMIN_ACCOUNTS.filter(function (a) { return a.email === email; })[0] || null;
}

function getAdminCreateRecord(email) {
    return ADMIN_CREATE_HISTORY.filter(function (r) { return r.email === email; })[0] || null;
}

function adminSuperCount() {
    return ADMIN_ACCOUNTS.filter(function (a) { return a.role === ADMIN_SUPER_ROLE; }).length;
}

/* 처리번호 생성 — 같은 해의 가장 큰 일련번호 + 1 (PREFIX-YYYY-NNNN) */
function nextAdminLogId(prefix, dateStr, list) {
    var year = String(dateStr).substring(0, 4);
    var head = prefix + '-' + year + '-';
    var max = 0;
    list.forEach(function (r) {
        if (r.id.indexOf(head) === 0) max = Math.max(max, parseInt(r.id.substring(head.length), 10) || 0);
    });
    return head + ('000' + (max + 1)).slice(-4);
}

/* 승인자 표기에서 이름만 추출 — '박정호 (정보보호팀장)' → '박정호' (직무 분리 검사용) */
function adminPersonName(label) {
    return String(label || '').split('(')[0].trim();
}

/* 사용 기한까지 남은 일수 (음수면 만료) */
function adminDaysUntil(dateStr) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var p = String(dateStr).split('-');
    var target = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return Math.round((target - today) / 86400000);
}

/* CSV 내려받기 (엑셀 호환을 위해 BOM 포함) */
function adminDownloadCsv(filename, header, rows) {
    var csv = [header].concat(rows)
        .map(function (cols) {
            return cols.map(function (c) {
                return '"' + String(c === null || c === undefined ? '' : c).replace(/"/g, '""') + '"';
            }).join(',');
        })
        .join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
