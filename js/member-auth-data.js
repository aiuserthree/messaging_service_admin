/* 회원 인증 이력 공통 데이터·헬퍼
 *
 * 사용자 화면(마이페이지 > 2차 인증 설정 / 발송 전 인증)에서 발생하는 인증 이벤트를
 * 어드민에서 조회하기 위한 데이터 모듈이다. member-auth-history.html 과
 * member-list.html(회원 상세 모달 > 인증이력 탭)이 함께 사용한다.
 *
 * 인증 구분(category)
 *   login    다중인증(로그인)  로그인 시 알림톡·문자(SMS) 인증번호            보안심사 3.4-③
 *   send     발송 추가인증     발신번호 소유·계정 연계 확인(알림톡/ARS)        보안심사 3.5-①②③
 *   approval 발송 사후승인     기업 승인 담당자 이메일 OTP                     보안심사 3.5-④
 *   manage   인증수단 관리     인증 수단 등록·변경·해제·잠금 해제              보안심사 3.4-③
 *
 * 감사 로그이므로 어드민에서는 조회·내보내기만 가능하며 수정·삭제할 수 없다.
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET /api/admin/members/auth-logs      인증 이력 조회 (기간·구분·채널·결과·회원)
 *   GET /api/admin/members/auth-methods   회원별 인증 수단 현황
 *   POST /api/admin/members/{id}/auth/unlock  인증 잠금 해제 (사유 필수)
 */

var MEMBER_AUTH_CATEGORY = {
    login:    { label: '다중인증(로그인)', cls: 'login',    desc: '로그인 시 알림톡·문자(SMS) 인증번호' },
    send:     { label: '발송 추가인증',    cls: 'send',     desc: '발신번호 소유·계정 연계 확인 (알림톡/ARS)' },
    approval: { label: '발송 사후승인',    cls: 'approval', desc: '기업 승인 담당자 이메일 OTP' },
    manage:   { label: '인증수단 관리',    cls: 'manage',   desc: '인증 수단 등록·변경·해제·잠금 해제' }
};

var MEMBER_AUTH_STATUS = {
    active:   { label: '사용 중',  badge: 'badge-success' },
    locked:   { label: '잠금',     badge: 'badge-danger' },
    disabled: { label: '해제됨',   badge: 'badge-secondary' }
};

/* 회원별 인증 수단 현황 — 회원 목록(member-list.html)의 회원과 동일한 키를 사용한다 */
var MEMBER_AUTH_METHODS = [
    {
        memberId: 'M001', name: '홍길동', loginId: 'hong@example.com', memberType: '개인',
        mfaChannel: '알림톡', mfaPhone: '01098725784', mfaStatus: 'active',
        registeredAt: '2025-01-12 09:12:40', lastVerifiedAt: '2025-06-22 14:28:05',
        approverEmail: 'admin@ibank.co.kr', approverName: '김담당', recentFail: 0
    },
    {
        memberId: 'M002', name: '김철수', loginId: 'kim@example.com', memberType: '기업',
        mfaChannel: '알림톡', mfaPhone: '01033335678', mfaStatus: 'active',
        registeredAt: '2025-02-20 11:04:22', lastVerifiedAt: '2025-06-21 09:41:10',
        approverEmail: 'approve@corp.co.kr', approverName: '이승인', recentFail: 1
    },
    {
        memberId: 'M003', name: '이영희', loginId: 'lee@example.com', memberType: '개인',
        mfaChannel: '알림톡', mfaPhone: '01055551234', mfaStatus: 'locked',
        registeredAt: '2025-03-10 15:22:08', lastVerifiedAt: '2025-06-16 14:02:11',
        lockedAt: '2025-06-18 09:41:12',
        approverEmail: '', approverName: '', recentFail: 5
    },
    {
        memberId: 'M004', name: '박선거', loginId: 'election@example.com', memberType: '선거회원',
        mfaChannel: '알림톡', mfaPhone: '01077778888', mfaStatus: 'disabled',
        registeredAt: '2025-04-01 10:00:00', lastVerifiedAt: '2025-06-10 13:05:33',
        disabledAt: '2025-06-20 16:45:02',
        approverEmail: 'vote@camp.kr', approverName: '박담당', recentFail: 0
    }
];

/* 인증 이력 — 최신순.
 * target 이 비어 있으면 대상 컬럼에 note 를 표시한다(번호가 아닌 이메일 변경 등). */
var MEMBER_AUTH_LOGS = [
    { at: '2025-06-22 14:28:05', memberId: 'M001', category: 'login', event: '인증 성공', channel: '알림톡', phone: '01098725784', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250622-8841' },
    { at: '2025-06-22 14:27:31', memberId: 'M001', category: 'login', event: '인증번호 발송', channel: '알림톡', phone: '01098725784', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250622-8841' },
    { at: '2025-06-22 10:06:40', memberId: 'M001', category: 'approval', event: '발송 사후승인 완료', channel: '이메일 OTP', email: 'admin@ibank.co.kr', actor: '승인 담당자(김담당)', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250622-8837', caller: '02-1234-5678', count: 1200, reason: '대량발송(1,000건 이상)' },
    { at: '2025-06-22 10:05:12', memberId: 'M001', category: 'send', event: '추가인증 성공', channel: 'ARS', phone: '01098725784', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250622-8837', caller: '02-1234-5678', count: 1200, reason: '발신번호 변경' },
    { at: '2025-06-22 10:04:35', memberId: 'M001', category: 'send', event: 'ARS 발신', channel: 'ARS', phone: '01098725784', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250622-8837', caller: '02-1234-5678' },
    { at: '2025-06-21 09:41:10', memberId: 'M002', category: 'login', event: '인증 성공', channel: '알림톡', phone: '01033335678', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250621-3312' },
    { at: '2025-06-21 09:40:22', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01033335678', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250621-3312', reason: '인증번호 불일치 (1/5)' },
    { at: '2025-06-20 17:12:48', memberId: 'M002', category: 'approval', event: '발송 사후승인 완료', channel: '이메일 OTP', email: 'approve@corp.co.kr', actor: '승인 담당자(이승인)', result: 'ok', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250620-2901', caller: '1588-0000', count: 340 },
    { at: '2025-06-20 17:11:20', memberId: 'M002', category: 'send', event: '추가인증 성공', channel: '알림톡', phone: '01033335678', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250620-2901', caller: '1588-0000', count: 340, reason: '유효시간 30분 경과' },
    { at: '2025-06-20 16:45:02', memberId: 'M004', category: 'manage', event: '인증 수단 해제', channel: '알림톡', phone: '01077778888', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 17 / iPhone', session: 'S-20250620-7710', reason: '본인 재확인 후 해제 — 해제 시 로그인·발송 제한' },
    { at: '2025-06-20 16:44:10', memberId: 'M004', category: 'manage', event: '본인 재확인', channel: '알림톡', phone: '01077778888', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 17 / iPhone', session: 'S-20250620-7710' },
    { at: '2025-06-20 11:02:15', memberId: 'M002', category: 'send', event: '추가인증 유효 확인', channel: '-', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250620-2744', caller: '1588-0000', count: 120, reason: '동일 세션 인증 유효 (약 18분 남음) — 재인증 미요구' },
    { at: '2025-06-18 09:41:12', memberId: 'M003', category: 'login', event: '시도 횟수 초과 잠금', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '5회 연속 인증번호 불일치 — 계정 잠금' },
    { at: '2025-06-18 09:40:44', memberId: 'M003', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '인증번호 불일치 (5/5)' },
    { at: '2025-06-18 09:40:02', memberId: 'M003', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '인증번호 불일치 (4/5)' },
    { at: '2025-06-18 09:39:20', memberId: 'M003', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '인증번호 불일치 (3/5)' },
    { at: '2025-06-18 09:38:44', memberId: 'M003', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '인증번호 불일치 (2/5)' },
    { at: '2025-06-18 09:38:05', memberId: 'M003', category: 'login', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120', reason: '인증번호 불일치 (1/5)' },
    { at: '2025-06-18 09:37:40', memberId: 'M003', category: 'login', event: '인증번호 발송', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'ok', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250618-1120' },
    { at: '2025-06-17 02:14:33', memberId: 'M002', category: 'login', event: '해외 IP 차단', channel: '알림톡', phone: '01033335678', actor: '본인', result: 'fail', ip: '203.0.113.1', ua: 'Chrome 124 / Windows 10', session: 'S-20250617-0004', reason: '해외 IP 접근 차단 정책 — 인증번호 미발송', anomaly: '해외 IP' },
    { at: '2025-06-16 16:40:12', memberId: 'M003', category: 'manage', event: '인증 잠금 해제', channel: '-', phone: '01055551234', actor: '관리자(admin01)', result: 'ok', ip: '10.0.3.21', ua: 'Chrome 126 / Windows 11', session: 'A-20250616-0042', reason: 'CS 요청 — 유선 본인확인 완료 후 해제' },
    { at: '2025-06-16 14:02:11', memberId: 'M003', category: 'login', event: '인증 성공', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'ok', ip: '58.226.11.9', ua: 'Chrome 125 / Android', session: 'S-20250616-9902' },
    { at: '2025-06-15 11:15:07', memberId: 'M001', category: 'manage', event: '인증 번호 변경', channel: '알림톡', phone: '01098725784', before: '01055551234', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 126 / Windows 11', session: 'S-20250615-5510', reason: '기존 번호 재인증 후 변경' },
    { at: '2025-06-14 10:33:19', memberId: 'M002', category: 'manage', event: '승인 담당자 등록', channel: '이메일 OTP', note: 'approve@corp.co.kr (이승인)', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250614-4420' },
    { at: '2025-06-13 09:20:44', memberId: 'M002', category: 'send', event: '추가인증 실패', channel: 'ARS', phone: '01033335678', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 126 / Windows 11', session: 'S-20250613-3308', caller: '02-987-6543', reason: 'ARS 응답 시간 초과' },
    { at: '2025-06-12 13:22:31', memberId: 'M004', category: 'manage', event: '승인 담당자 변경', channel: '이메일 OTP', note: 'vote@camp.kr (이전 old@camp.kr)', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 17 / iPhone', session: 'S-20250612-6612', reason: '기존 주소 재인증 후 변경' },
    { at: '2025-06-10 13:05:33', memberId: 'M004', category: 'login', event: '인증 성공', channel: '알림톡', phone: '01077778888', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 17 / iPhone', session: 'S-20250610-1180' }
];

/* ---------- 헬퍼 (admin-common.js 로드 순서와 무관하게 동작하도록 자체 정의) ---------- */

function maskAuthPhone(digits) {
    if (!digits) return '-';
    var d = String(digits).replace(/\D/g, '');
    if (d.length < 7) return digits;
    return d.slice(0, 3) + '-****-' + d.slice(-4);
}

function maskAuthEmail(email) {
    if (!email) return '-';
    var parts = String(email).split('@');
    if (parts.length !== 2) return email;
    var local = parts[0];
    if (local.length <= 2) return email;
    return local.slice(0, 2) + '****@' + parts[1];
}

function getMemberAuthMethod(memberId) {
    return MEMBER_AUTH_METHODS.filter(function (m) { return m.memberId === memberId; })[0] || null;
}

function getMemberAuthLogs(memberId) {
    return MEMBER_AUTH_LOGS.filter(function (l) { return l.memberId === memberId; });
}

/* 이력 행의 '대상' 컬럼 — 번호 / 이메일 / 변경 메모 중 해당하는 값을 마스킹해 반환 */
function authTargetLabel(log) {
    if (log.note) return log.note.replace(/[\w.+-]+@[\w.-]+/g, function (m) { return maskAuthEmail(m); });
    if (log.email) return maskAuthEmail(log.email);
    if (log.phone) {
        return maskAuthPhone(log.phone) +
            (log.before ? ' <span style="color:var(--admin-text-muted);font-size:12px;">(이전 ' + maskAuthPhone(log.before) + ')</span>' : '');
    }
    return '-';
}

function authCategoryTag(category) {
    var meta = MEMBER_AUTH_CATEGORY[category];
    if (!meta) return '<span class="auth-tag manage">기타</span>';
    return '<span class="auth-tag ' + meta.cls + '">' + meta.label + '</span>';
}

function authResultCell(result) {
    return result === 'ok'
        ? '<span class="auth-result ok">성공</span>'
        : '<span class="auth-result fail">실패</span>';
}

function authMethodStatusBadge(status) {
    var meta = MEMBER_AUTH_STATUS[status] || MEMBER_AUTH_STATUS.disabled;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}
