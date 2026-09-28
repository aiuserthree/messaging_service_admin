/* 회원 인증 이력(인증 로그) 공통 데이터·헬퍼
 *
 * 사용자 화면(회원가입 본인인증 / 로그인 이메일 인증 / 발송 전 인증 / 마이페이지 > 2차 인증 설정)에서
 * 발생하는 인증 이벤트를 어드민에서 조회하기 위한 데이터 모듈이다. member-auth-history.html 과
 * member-list.html(회원 상세 모달 > 인증이력 탭)이 함께 사용한다.
 *
 * 인증 구분(category)
 *   signup   회원가입 인증     휴대폰 본인인증(이름·생년월일·휴대폰번호) 인증번호  전송자격인증 4.1-01
 *   login    다중인증(로그인)  아이디·비밀번호 확인 후 이메일(아이디) 인증번호 6자리 보안심사 3.4-③
 *   send     발송 추가인증     발신번호 소유·계정 연계 확인(알림톡/문자(SMS)/ARS)    보안심사 3.5-①②③
 *   approval 발송 사후승인     기업 승인 담당자 이메일 OTP                         보안심사 3.5-④
 *   manage   인증수단 관리     추가인증 번호·승인 담당자 변경, 잠금 해제            보안심사 3.4-③
 *
 * 기록 항목(전송자격인증 4.1-01) — 로그 1건마다 아래 값을 남긴다.
 *   계정(memberId·아이디) / 이메일(마스킹) / 요청일시(at) / 결과(result: ok·fail) / 사유(reason)
 *   접속 IP(ip) / 유효시간(validMin·validKeep·expiresAt) / 발송결과(delivery)
 *   유효시간  validMin 분. validKeep=true 면 인증 후 유지시간(추가인증·사후승인 30분),
 *             아니면 인증번호 유효시간(3분, ARS 수신 대기 5분). expiresAt 이 없으면 at 기준으로 계산한다.
 *   발송결과  인증번호 전송 결과(발송 성공 / 발송 실패(사유) / 미발송(사유))와
 *             발송 추가인증·사후승인의 문자 발송 허용·차단 결과(발송 허용 (n건) / 발송 차단).
 *
 * 정책 값(사용자 화면과 동일)
 *   인증번호 6자리, 유효시간 3분, 5회 오류 또는 만료 시 입력 잠금 → 재전송 필요(이전 번호 무효)
 *   로그인 아이디·비밀번호 5회 오류 → 계정 10분 잠금
 *   발송 추가인증 인증 후 30분 유지 — 재요구: 30분 경과 / 발신번호 변경 / 대량발송(1,000건 이상) / 접속환경 변경
 *   발송 사후승인 승인 후 30분 유지 — 재요구: 30분 경과
 *
 * 감사 로그이므로 어드민에서는 조회·내보내기만 가능하며 수정·삭제할 수 없다. 보관 기간 1년 이상.
 * 이메일·휴대폰번호는 화면·내보내기 모두 마스킹해 표시한다.
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET /api/admin/members/auth-logs      인증 이력 조회 (기간·구분·채널·결과·회원)
 *   GET /api/admin/members/auth-methods   회원별 인증 수단 현황
 *   POST /api/admin/members/{id}/auth/unlock  인증 잠금 해제 (사유 필수)
 */

var MEMBER_AUTH_CATEGORY = {
    signup:   { label: '회원가입 인증',    cls: 'signup',   desc: '휴대폰 본인인증 (이름·생년월일·휴대폰번호)' },
    login:    { label: '다중인증(로그인)', cls: 'login',    desc: '로그인 시 이메일(아이디) 인증번호' },
    send:     { label: '발송 추가인증',    cls: 'send',     desc: '발신번호 소유·계정 연계 확인 (알림톡/ARS)' },
    approval: { label: '발송 사후승인',    cls: 'approval', desc: '기업 승인 담당자 이메일 OTP' },
    manage:   { label: '인증수단 관리',    cls: 'manage',   desc: '추가인증 번호·승인 담당자 변경·잠금 해제' }
};

var MEMBER_AUTH_STATUS = {
    active:   { label: '사용 중',  badge: 'badge-success' },
    locked:   { label: '잠금',     badge: 'badge-danger' },
    disabled: { label: '해제됨',   badge: 'badge-secondary' }
};

/* 회원별 인증 수단 현황 — 회원 목록(member-list.html)의 회원과 동일한 키를 사용한다.
 *   mfaChannel/mfaEmail  로그인 다중인증 수단 — 아이디(이메일)로 인증번호 발송
 *   mfaPhone             발송 추가인증 번호 — 휴대폰 발신번호 외(유선·대표번호 등)일 때 알림톡을 받는 담당자 번호
 * M005·M006 은 이번 달 신규 가입 회원(회원가입 인증 이력과 연결) */
var MEMBER_AUTH_METHODS = [
    {
        memberId: 'M001', name: '홍길동', loginId: 'hong@example.com', memberType: '개인',
        mfaChannel: '이메일 OTP', mfaEmail: 'hong@example.com', mfaPhone: '01098725784', mfaStatus: 'active',
        registeredAt: '2024-01-15 10:22:31', lastVerifiedAt: '2026-09-28 10:21:40',
        approverEmail: 'admin@ibank.co.kr', approverName: '김담당', recentFail: 0
    },
    {
        memberId: 'M002', name: '김철수', loginId: 'kim@example.com', memberType: '기업',
        mfaChannel: '이메일 OTP', mfaEmail: 'kim@example.com', mfaPhone: '01033335678', mfaStatus: 'active',
        registeredAt: '2024-02-20 11:04:22', lastVerifiedAt: '2026-09-27 15:38:58',
        approverEmail: 'approve@corp.co.kr', approverName: '이승인', recentFail: 1
    },
    {
        memberId: 'M003', name: '이영희', loginId: 'lee@example.com', memberType: '개인',
        mfaChannel: '이메일 OTP', mfaEmail: 'lee@example.com', mfaPhone: '01055551234', mfaStatus: 'locked',
        registeredAt: '2024-03-10 15:22:08', lastVerifiedAt: '2026-09-22 14:02:40',
        lockedAt: '2026-09-28 11:41:12',
        approverEmail: '', approverName: '', recentFail: 5
    },
    {
        memberId: 'M004', name: '박선거', loginId: 'election@example.com', memberType: '선거회원',
        mfaChannel: '이메일 OTP', mfaEmail: 'election@example.com', mfaPhone: '01077778888', mfaStatus: 'active',
        registeredAt: '2024-04-01 10:00:00', lastVerifiedAt: '2026-09-25 13:20:44',
        approverEmail: 'vote@camp.kr', approverName: '박담당', recentFail: 1
    },
    {
        memberId: 'M005', name: '정민수', loginId: 'jung.ms@example.com', memberType: '개인',
        mfaChannel: '이메일 OTP', mfaEmail: 'jung.ms@example.com', mfaPhone: '01024681357', mfaStatus: 'active',
        registeredAt: '2026-09-24 19:44:37', lastVerifiedAt: '2026-09-24 19:46:02',
        approverEmail: '', approverName: '', recentFail: 0
    },
    {
        memberId: 'M006', name: '최서연', loginId: 'choi.sy@example.com', memberType: '개인',
        mfaChannel: '이메일 OTP', mfaEmail: 'choi.sy@example.com', mfaPhone: '01046572390', mfaStatus: 'active',
        registeredAt: '2026-09-26 14:27:48', lastVerifiedAt: '2026-09-28 08:48:15',
        approverEmail: '', approverName: '', recentFail: 1
    }
];

/* 인증 이력 — 로드 시 최신순으로 정렬한다.
 * target 은 phone(휴대폰·발신번호) / email / note(변경 메모) 중 하나를 마스킹해 표시한다.
 * memberId 가 null 인 회원가입 인증은 가입을 마치지 않은 신청자(applicant, 마스킹 표시)이며,
 * 가입을 마치면 같은 본인인증 세션(J-…)의 이력이 신규 회원에 연결된다. */
var MEMBER_AUTH_LOGS = [
    /* ===== 2026-09-28 ===== */
    { at: '2026-09-28 11:41:12', memberId: 'M003', category: 'login', event: '계정 잠금 (비밀번호 5회 오류)', channel: '-', email: 'lee@example.com', actor: '시스템', result: 'fail', delivery: '미발송(로그인 차단)', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260928-1120', reason: '아이디·비밀번호 5회 연속 불일치 — 10분간 로그인 제한 (~11:51:12)', anomaly: '반복 실패' },
    { at: '2026-09-28 11:40:48', memberId: 'M003', category: 'login', event: '비밀번호 불일치', channel: '-', email: 'lee@example.com', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260928-1120', reason: '아이디·비밀번호 불일치 (4/5)' },
    { at: '2026-09-28 10:21:47', memberId: 'M001', category: 'approval', event: '사후승인 유효 확인', channel: '이메일 OTP', email: 'admin@ibank.co.kr', actor: '시스템', result: 'ok', validMin: 30, validKeep: true, expiresAt: '2026-09-28 10:36:40', delivery: '발송 허용 (80건)', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '010-9872-5784', count: 80, reason: '동일 세션 승인 유효 (약 14분 남음) — 재승인 미요구' },
    { at: '2026-09-28 10:21:40', memberId: 'M001', category: 'send', event: '추가인증 성공', channel: '알림톡', phone: '01098725784', actor: '본인', result: 'ok', validMin: 30, validKeep: true, ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '010-9872-5784', count: 80, reason: '재인증 사유: 발신번호 변경 (02-1234-5678 → 010-9872-5784)' },
    { at: '2026-09-28 10:21:02', memberId: 'M001', category: 'send', event: '인증번호 발송', channel: '알림톡', phone: '01098725784', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '010-9872-5784', count: 80, reason: '재인증 사유: 발신번호 변경' },
    { at: '2026-09-28 10:06:40', memberId: 'M001', category: 'approval', event: '발송 사후승인 완료', channel: '이메일 OTP', email: 'admin@ibank.co.kr', actor: '승인 담당자(김담당)', result: 'ok', validMin: 30, validKeep: true, delivery: '발송 허용 (1,200건)', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '02-1234-5678', count: 1200, approvalNo: 'AP-20260928-0031' },
    { at: '2026-09-28 10:06:02', memberId: 'M001', category: 'approval', event: '승인 인증번호 발송', channel: '이메일 OTP', email: 'admin@ibank.co.kr', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '02-1234-5678', count: 1200 },
    { at: '2026-09-28 10:05:12', memberId: 'M001', category: 'send', event: '추가인증 성공', channel: 'ARS', phone: '0212345678', actor: '본인', result: 'ok', validMin: 30, validKeep: true, ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '02-1234-5678', count: 1200, reason: '재인증 사유: 최초 발송 · 대량발송(1,000건 이상)' },
    { at: '2026-09-28 10:04:35', memberId: 'M001', category: 'send', event: 'ARS 인증 요청', channel: 'ARS', phone: '0212345678', actor: '본인', result: 'ok', validMin: 5, delivery: '-', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412', caller: '02-1234-5678', count: 1200, reason: '유선번호 — 인증 전화(1600-0000) 수신 대기' },
    { at: '2026-09-28 09:12:40', memberId: 'M001', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'hong@example.com', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412' },
    { at: '2026-09-28 09:12:05', memberId: 'M001', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'hong@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260928-0412' },
    { at: '2026-09-28 08:48:15', memberId: 'M006', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'choi.sy@example.com', actor: '본인', result: 'ok', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'S-20260928-0355' },
    { at: '2026-09-28 08:47:40', memberId: 'M006', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'choi.sy@example.com', actor: '본인', result: 'fail', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'S-20260928-0355', reason: '재전송으로 무효 처리된 이전 인증번호 입력 (1/5)' },
    { at: '2026-09-28 08:47:02', memberId: 'M006', category: 'login', event: '인증번호 재전송', channel: '이메일 OTP', email: 'choi.sy@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'S-20260928-0355', reason: '재전송 — 이전 인증번호(08:45:10 발송) 무효 처리' },
    { at: '2026-09-28 08:45:10', memberId: 'M006', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'choi.sy@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'S-20260928-0355' },

    /* ===== 2026-09-27 ===== */
    { at: '2026-09-27 15:39:05', memberId: 'M002', category: 'approval', event: '사후승인 유효 확인', channel: '이메일 OTP', email: 'approve@corp.co.kr', actor: '시스템', result: 'ok', validMin: 30, validKeep: true, expiresAt: '2026-09-27 15:45:32', delivery: '발송 허용 (500건)', ip: '121.190.24.88', ua: 'Chrome 140 / Windows 11', session: 'S-20260927-3390', caller: '1588-0000', count: 500, reason: '승인 유효 (약 6분 남음) — 사후승인은 접속환경 변경과 무관' },
    { at: '2026-09-27 15:38:58', memberId: 'M002', category: 'send', event: '추가인증 성공', channel: 'ARS', phone: '15880000', actor: '본인', result: 'ok', validMin: 30, validKeep: true, ip: '121.190.24.88', ua: 'Chrome 140 / Windows 11', session: 'S-20260927-3390', caller: '1588-0000', count: 500, reason: '재인증 사유: 접속환경 변경 (IP 121.190.24.5 → 121.190.24.88)' },
    { at: '2026-09-27 15:38:21', memberId: 'M002', category: 'send', event: 'ARS 인증 요청', channel: 'ARS', phone: '15880000', actor: '본인', result: 'ok', validMin: 5, delivery: '-', ip: '121.190.24.88', ua: 'Chrome 140 / Windows 11', session: 'S-20260927-3390', caller: '1588-0000', count: 500, reason: '재인증 사유: 접속환경 변경' },
    { at: '2026-09-27 15:37:15', memberId: 'M002', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', ip: '121.190.24.88', ua: 'Chrome 140 / Windows 11', session: 'S-20260927-3390' },
    { at: '2026-09-27 15:36:40', memberId: 'M002', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '121.190.24.88', ua: 'Chrome 140 / Windows 11', session: 'S-20260927-3390' },
    { at: '2026-09-27 15:31:09', memberId: 'M002', category: 'approval', event: '사후승인 유효 확인', channel: '이메일 OTP', email: 'approve@corp.co.kr', actor: '시스템', result: 'ok', validMin: 30, validKeep: true, expiresAt: '2026-09-27 15:45:32', delivery: '발송 허용 (120건)', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 120, reason: '동일 세션 승인 유효 (약 14분 남음) — 재승인 미요구' },
    { at: '2026-09-27 15:31:07', memberId: 'M002', category: 'send', event: '추가인증 유효 확인', channel: '-', actor: '시스템', result: 'ok', validMin: 30, validKeep: true, expiresAt: '2026-09-27 15:44:52', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 120, reason: '동일 세션 인증 유효 (약 13분 남음) — 재인증 미요구' },
    { at: '2026-09-27 15:15:32', memberId: 'M002', category: 'approval', event: '발송 사후승인 완료', channel: '이메일 OTP', email: 'approve@corp.co.kr', actor: '승인 담당자(이승인)', result: 'ok', validMin: 30, validKeep: true, delivery: '발송 허용 (2,000건)', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 2000, approvalNo: 'AP-20260927-0118' },
    { at: '2026-09-27 15:15:01', memberId: 'M002', category: 'approval', event: '승인 인증번호 발송', channel: '이메일 OTP', email: 'approve@corp.co.kr', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 2000 },
    { at: '2026-09-27 15:14:52', memberId: 'M002', category: 'send', event: '추가인증 성공', channel: 'ARS', phone: '15880000', actor: '본인', result: 'ok', validMin: 30, validKeep: true, ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 2000, reason: '재인증 사유: 30분 경과 · 대량발송(1,000건 이상)' },
    { at: '2026-09-27 15:14:10', memberId: 'M002', category: 'send', event: 'ARS 인증 요청', channel: 'ARS', phone: '15880000', actor: '본인', result: 'ok', validMin: 5, delivery: '-', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', caller: '1588-0000', count: 2000, reason: '대표번호 — 인증 전화(1600-0000) 수신 대기' },
    { at: '2026-09-27 09:41:10', memberId: 'M002', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312' },
    { at: '2026-09-27 09:40:22', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312', reason: '인증번호 불일치 (1/5)' },
    { at: '2026-09-27 09:39:48', memberId: 'M002', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260927-3312' },

    /* ===== 2026-09-26 ===== */
    { at: '2026-09-26 14:27:48', memberId: 'M006', category: 'signup', event: '회원가입 완료', channel: '-', email: 'choi.sy@example.com', actor: '본인(가입 신청자)', result: 'ok', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'J-20260926-0231', reason: '본인인증 완료 세션으로 계정 생성' },
    { at: '2026-09-26 14:24:02', memberId: 'M006', category: 'signup', event: '본인인증 성공', channel: '휴대폰 본인인증', phone: '01046572390', actor: '본인(가입 신청자)', result: 'ok', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'J-20260926-0231' },
    { at: '2026-09-26 14:23:31', memberId: 'M006', category: 'signup', event: '인증번호 재발송', channel: '휴대폰 본인인증', phone: '01046572390', actor: '본인(가입 신청자)', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'J-20260926-0231', reason: '재발송 — 이전 인증번호 무효 처리' },
    { at: '2026-09-26 14:23:10', memberId: 'M006', category: 'signup', event: '유효시간 만료', channel: '휴대폰 본인인증', phone: '01046572390', actor: '본인(가입 신청자)', result: 'fail', validMin: 3, expiresAt: '2026-09-26 14:23:05', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'J-20260926-0231', reason: '인증번호 유효시간(3분) 만료 — 재발송 필요' },
    { at: '2026-09-26 14:20:05', memberId: 'M006', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01046572390', actor: '본인(가입 신청자)', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '112.169.52.31', ua: 'Chrome 140 / macOS', session: 'J-20260926-0231' },
    { at: '2026-09-26 11:05:15', memberId: null, applicant: '윤지희', category: 'signup', event: '유효시간 만료', channel: '휴대폰 본인인증', phone: '01073318826', actor: '본인(가입 신청자)', result: 'fail', validMin: 3, expiresAt: '2026-09-26 11:05:14', ip: '106.101.8.77', ua: 'Safari 26 / iPhone', session: 'J-20260926-0198', reason: '인증번호 유효시간(3분) 만료 — 이후 가입 미진행' },
    { at: '2026-09-26 11:03:01', memberId: null, applicant: '윤지희', category: 'signup', event: '인증번호 불일치', channel: '휴대폰 본인인증', phone: '01073318826', actor: '본인(가입 신청자)', result: 'fail', ip: '106.101.8.77', ua: 'Safari 26 / iPhone', session: 'J-20260926-0198', reason: '인증번호 불일치 (1/5)' },
    { at: '2026-09-26 11:02:14', memberId: null, applicant: '윤지희', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01073318826', actor: '본인(가입 신청자)', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '106.101.8.77', ua: 'Safari 26 / iPhone', session: 'J-20260926-0198' },
    { at: '2026-09-26 11:01:50', memberId: null, applicant: '윤지희', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01073318826', actor: '본인(가입 신청자)', result: 'fail', delivery: '발송 실패(명의 정보 불일치)', ip: '106.101.8.77', ua: 'Safari 26 / iPhone', session: 'J-20260926-0198', reason: '입력한 이름·생년월일이 통신사 가입 정보와 불일치' },

    /* ===== 2026-09-25 ===== */
    { at: '2026-09-25 13:25:31', memberId: 'M004', category: 'approval', event: '발송 사후승인 완료', channel: '이메일 OTP', email: 'vote@camp.kr', actor: '승인 담당자(박담당)', result: 'ok', validMin: 30, validKeep: true, delivery: '발송 허용 (450건)', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, approvalNo: 'AP-20260925-0072' },
    { at: '2026-09-25 13:24:15', memberId: 'M004', category: 'approval', event: '승인 인증번호 재전송', channel: '이메일 OTP', email: 'vote@camp.kr', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, reason: '재전송 — 이전 인증번호 무효 처리' },
    { at: '2026-09-25 13:24:02', memberId: 'M004', category: 'approval', event: '유효시간 만료', channel: '이메일 OTP', email: 'vote@camp.kr', actor: '승인 담당자(박담당)', result: 'fail', validMin: 3, expiresAt: '2026-09-25 13:23:50', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, reason: '승인 인증번호 유효시간(3분) 만료 — 입력 잠금, 재전송 필요' },
    { at: '2026-09-25 13:20:50', memberId: 'M004', category: 'approval', event: '승인 인증번호 발송', channel: '이메일 OTP', email: 'vote@camp.kr', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450 },
    { at: '2026-09-25 13:20:44', memberId: 'M004', category: 'send', event: '추가인증 성공', channel: '문자(SMS)', phone: '01077778888', actor: '본인', result: 'ok', validMin: 30, validKeep: true, ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, reason: '재인증 사유: 최초 발송' },
    { at: '2026-09-25 13:20:10', memberId: 'M004', category: 'send', event: '인증번호 대체 발송', channel: '문자(SMS)', phone: '01077778888', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, reason: '알림톡 수신 불가 — 문자(SMS) 대체 발송' },
    { at: '2026-09-25 13:19:40', memberId: 'M004', category: 'send', event: '인증번호 발송', channel: '알림톡', phone: '01077778888', actor: '본인', result: 'fail', delivery: '발송 실패(카카오톡 미사용)', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', caller: '010-7777-8888', count: 450, reason: '알림톡 전송 실패 — 문자(SMS) 대체 발송 안내' },
    { at: '2026-09-25 13:07:02', memberId: 'M004', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710' },
    { at: '2026-09-25 13:06:30', memberId: 'M004', category: 'login', event: '인증번호 재전송', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', reason: '재전송 — 이전 인증번호 무효 처리' },
    { at: '2026-09-25 13:06:12', memberId: 'M004', category: 'login', event: '유효시간 만료', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'fail', validMin: 3, expiresAt: '2026-09-25 13:06:05', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', reason: '인증번호 유효시간(3분) 만료 — 입력 잠금, 재전송 필요' },
    { at: '2026-09-25 13:03:05', memberId: 'M004', category: 'login', event: '인증번호 재전송', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', reason: '재전송 — 직전 요청 발송 실패' },
    { at: '2026-09-25 13:02:40', memberId: 'M004', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'fail', delivery: '발송 실패(메일서버 무응답)', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260925-7710', reason: '수신 메일서버 응답 없음 — 재전송 안내' },

    /* ===== 2026-09-24 ===== */
    { at: '2026-09-24 19:46:02', memberId: 'M005', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'jung.ms@example.com', actor: '본인', result: 'ok', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'S-20260924-6120' },
    { at: '2026-09-24 19:45:30', memberId: 'M005', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'jung.ms@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'S-20260924-6120', reason: '가입 후 최초 로그인' },
    { at: '2026-09-24 19:44:37', memberId: 'M005', category: 'signup', event: '회원가입 완료', channel: '-', email: 'jung.ms@example.com', actor: '본인(가입 신청자)', result: 'ok', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'J-20260924-0117', reason: '본인인증 완료 세션으로 계정 생성' },
    { at: '2026-09-24 19:41:20', memberId: 'M005', category: 'signup', event: '본인인증 성공', channel: '휴대폰 본인인증', phone: '01024681357', actor: '본인(가입 신청자)', result: 'ok', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'J-20260924-0117' },
    { at: '2026-09-24 19:40:51', memberId: 'M005', category: 'signup', event: '인증번호 불일치', channel: '휴대폰 본인인증', phone: '01024681357', actor: '본인(가입 신청자)', result: 'fail', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'J-20260924-0117', reason: '인증번호 불일치 (1/5)' },
    { at: '2026-09-24 19:40:02', memberId: 'M005', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01024681357', actor: '본인(가입 신청자)', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '118.235.14.62', ua: 'Samsung Internet 28 / Android 16', session: 'J-20260924-0117' },
    { at: '2026-09-24 10:15:58', memberId: null, applicant: '강민준', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01090421176', actor: '본인(가입 신청자)', result: 'fail', delivery: '발송 실패(통신사 응답 오류)', ip: '223.38.21.140', ua: 'Chrome 140 / Android 16', session: 'J-20260924-0042', reason: '본인확인기관 응답 오류(E-503) — 재시도 후 가입 미진행' },
    { at: '2026-09-24 10:15:22', memberId: null, applicant: '강민준', category: 'signup', event: '인증번호 발송', channel: '휴대폰 본인인증', phone: '01090421176', actor: '본인(가입 신청자)', result: 'fail', delivery: '발송 실패(통신사 응답 오류)', ip: '223.38.21.140', ua: 'Chrome 140 / Android 16', session: 'J-20260924-0042', reason: '본인확인기관 응답 오류(E-503) — 재시도 안내' },

    /* ===== 2026-09-22 ===== */
    { at: '2026-09-22 14:11:50', memberId: 'M003', category: 'send', event: '추가인증 입력 잠금 (5회 초과)', channel: '알림톡', phone: '01055551234', actor: '시스템', result: 'fail', delivery: '발송 차단', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 5회 오류 — 재전송 전까지 입력 잠금, 문자 발송 미실행', anomaly: '반복 실패' },
    { at: '2026-09-22 14:11:49', memberId: 'M003', category: 'send', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 불일치 (5/5)' },
    { at: '2026-09-22 14:11:30', memberId: 'M003', category: 'send', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 불일치 (4/5)' },
    { at: '2026-09-22 14:11:12', memberId: 'M003', category: 'send', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 불일치 (3/5)' },
    { at: '2026-09-22 14:10:50', memberId: 'M003', category: 'send', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 불일치 (2/5)' },
    { at: '2026-09-22 14:10:31', memberId: 'M003', category: 'send', event: '인증번호 불일치', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'fail', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '인증번호 불일치 (1/5)' },
    { at: '2026-09-22 14:10:05', memberId: 'M003', category: 'send', event: '인증번호 발송', channel: '알림톡', phone: '01055551234', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120', caller: '010-5555-1234', count: 300, reason: '재인증 사유: 최초 발송' },
    { at: '2026-09-22 14:02:40', memberId: 'M003', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'lee@example.com', actor: '본인', result: 'ok', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120' },
    { at: '2026-09-22 14:02:11', memberId: 'M003', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'lee@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260922-1120' },

    /* ===== 2026-09-17 ~ 09-01 ===== */
    { at: '2026-09-17 02:14:33', memberId: 'M002', category: 'login', event: '해외 IP 차단', channel: '이메일 OTP', email: 'kim@example.com', actor: '시스템', result: 'fail', delivery: '미발송(해외 IP 차단)', ip: '203.0.113.1', ua: 'Chrome 139 / Windows 10', session: 'S-20260917-0004', reason: '해외 IP 접근 차단 정책 — 인증번호 미발송', anomaly: '해외 IP' },
    { at: '2026-09-15 11:15:07', memberId: 'M001', category: 'manage', event: '추가인증 번호 변경', channel: '알림톡', phone: '01098725784', before: '01092213344', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260915-5510', reason: '기존 번호 재인증 후 변경' },
    { at: '2026-09-15 08:58:05', memberId: 'M002', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210' },
    { at: '2026-09-15 08:57:30', memberId: 'M002', category: 'login', event: '인증번호 재전송', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '재전송 — 이전 인증번호 무효 처리, 시도 횟수 초기화' },
    { at: '2026-09-15 08:57:03', memberId: 'M002', category: 'login', event: '인증번호 입력 잠금 (5회 초과)', channel: '이메일 OTP', email: 'kim@example.com', actor: '시스템', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 5회 오류 — 입력 잠금, 재전송해야 재시도 가능' },
    { at: '2026-09-15 08:57:02', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 불일치 (5/5)' },
    { at: '2026-09-15 08:56:41', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 불일치 (4/5)' },
    { at: '2026-09-15 08:56:20', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 불일치 (3/5)' },
    { at: '2026-09-15 08:55:58', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 불일치 (2/5)' },
    { at: '2026-09-15 08:55:40', memberId: 'M002', category: 'login', event: '인증번호 불일치', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'fail', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210', reason: '인증번호 불일치 (1/5)' },
    { at: '2026-09-15 08:55:10', memberId: 'M002', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'kim@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260915-2210' },
    { at: '2026-09-14 10:33:19', memberId: 'M002', category: 'manage', event: '승인 담당자 등록', channel: '이메일 OTP', note: 'approve@corp.co.kr (이승인)', actor: '본인', result: 'ok', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260914-4420', reason: '담당자 이메일 인증번호 확인 후 등록' },
    { at: '2026-09-13 09:20:11', memberId: 'M002', category: 'send', event: '추가인증 실패', channel: 'ARS', phone: '029876543', actor: '시스템', result: 'fail', validMin: 5, expiresAt: '2026-09-13 09:20:10', delivery: '발송 차단', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260913-3308', caller: '02-987-6543', count: 60, reason: 'ARS 수신 대기 5분 초과 — 인증 전화 미수신' },
    { at: '2026-09-13 09:15:10', memberId: 'M002', category: 'send', event: 'ARS 인증 요청', channel: 'ARS', phone: '029876543', actor: '본인', result: 'ok', validMin: 5, delivery: '-', ip: '121.190.24.5', ua: 'Edge 140 / Windows 11', session: 'S-20260913-3308', caller: '02-987-6543', count: 60, reason: '유선번호 — 인증 전화(1600-0000) 수신 대기' },
    { at: '2026-09-12 13:22:31', memberId: 'M004', category: 'manage', event: '승인 담당자 변경', channel: '이메일 OTP', note: 'vote@camp.kr (이전 old@camp.kr)', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260912-6612', reason: '기존 주소 재인증 후 변경' },
    { at: '2026-09-10 13:05:33', memberId: 'M004', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'ok', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260910-1180' },
    { at: '2026-09-10 13:05:02', memberId: 'M004', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'election@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '175.223.10.44', ua: 'Safari 26 / iPhone', session: 'S-20260910-1180' },
    { at: '2026-09-08 16:24:40', memberId: 'M003', category: 'manage', event: '인증 잠금 해제', channel: '-', email: 'lee@example.com', actor: '관리자(admin01)', result: 'ok', ip: '10.0.3.21', ua: 'Chrome 140 / Windows 11', session: 'A-20260908-0042', reason: 'CS 요청 — 유선 본인확인 완료 후 조기 해제' },
    { at: '2026-09-08 16:20:03', memberId: 'M003', category: 'login', event: '계정 잠금 (비밀번호 5회 오류)', channel: '-', email: 'lee@example.com', actor: '시스템', result: 'fail', delivery: '미발송(로그인 차단)', ip: '58.226.11.9', ua: 'Chrome 140 / Android 16', session: 'S-20260908-0915', reason: '아이디·비밀번호 5회 연속 불일치 — 10분간 로그인 제한 (~16:30:03)' },
    { at: '2026-09-03 09:31:18', memberId: 'M001', category: 'login', event: '인증 성공', channel: '이메일 OTP', email: 'hong@example.com', actor: '본인', result: 'ok', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260903-0107' },
    { at: '2026-09-03 09:30:44', memberId: 'M001', category: 'login', event: '인증번호 발송', channel: '이메일 OTP', email: 'hong@example.com', actor: '본인', result: 'ok', validMin: 3, delivery: '발송 성공', ip: '211.36.142.77', ua: 'Chrome 140 / Windows 11', session: 'S-20260903-0107' }
];

// 최신순 정렬 (같은 초에 발생한 이벤트는 정의 순서 유지)
MEMBER_AUTH_LOGS.sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });

/* ---------- 헬퍼 (admin-common.js 로드 순서와 무관하게 동작하도록 자체 정의) ---------- */

function escapeAuthHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* 휴대폰 010-****-1234 / 서울 02-****-5678 / 대표번호 1588-**** */
function maskAuthPhone(digits) {
    if (!digits) return '-';
    var d = String(digits).replace(/\D/g, '');
    if (/^1[5-9]\d{6}$/.test(d)) return d.slice(0, 4) + '-****';
    if (/^02\d{7,8}$/.test(d)) return '02-****-' + d.slice(-4);
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

/* 가입 미완료 신청자 이름 — 강민준 → 강*준, 김수 → 김* */
function maskAuthName(name) {
    if (!name) return '-';
    var s = String(name);
    if (s.length <= 1) return s;
    if (s.length === 2) return s.charAt(0) + '*';
    return s.charAt(0) + '*'.repeat(s.length - 2) + s.charAt(s.length - 1);
}

function getMemberAuthMethod(memberId) {
    return MEMBER_AUTH_METHODS.filter(function (m) { return m.memberId === memberId; })[0] || null;
}

function getMemberAuthLogs(memberId) {
    return MEMBER_AUTH_LOGS.filter(function (l) { return l.memberId === memberId; });
}

/* 로그의 계정 정보 — 회원이면 인증 수단 현황에서, 가입 미완료 신청자면 로그에서 가져온다 */
function authLogAccount(log) {
    var m = log.memberId ? getMemberAuthMethod(log.memberId) : null;
    if (m) return { memberId: m.memberId, name: m.name, loginId: m.loginId, joined: true };
    return {
        memberId: log.memberId || '',
        name: log.applicant ? maskAuthName(log.applicant) : (log.memberId || '-'),
        loginId: '',
        joined: false
    };
}

/* 계정 아이디(이메일) 마스킹 표시 — 가입 전 신청자는 '가입 미완료' */
function authAccountLabel(log) {
    var acc = authLogAccount(log);
    return acc.loginId ? maskAuthEmail(acc.loginId) : '가입 미완료';
}

/* 이력 행의 '대상' 컬럼 — 번호 / 이메일 / 변경 메모 중 해당하는 값을 마스킹해 반환 */
function authTargetLabel(log) {
    if (log.note) return escapeAuthHtml(log.note).replace(/[\w.+-]+@[\w.-]+/g, function (m) { return maskAuthEmail(m); });
    if (log.email) return maskAuthEmail(log.email);
    if (log.phone) {
        return maskAuthPhone(log.phone) +
            (log.before ? ' <span style="color:var(--admin-text-muted);font-size:12px;">(이전 ' + maskAuthPhone(log.before) + ')</span>' : '');
    }
    return '-';
}

/* ---------- 유효시간 ---------- */

function parseAuthStamp(stamp) {
    var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(stamp || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

function formatAuthStamp(d) {
    var p = function (n) { return ('0' + n).slice(-2); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
           p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

/* 만료(유지 종료) 일시 — expiresAt 이 없으면 at + validMin 분 */
function authExpiresAt(log) {
    if (!log.validMin) return '';
    if (log.expiresAt) return log.expiresAt;
    var d = parseAuthStamp(log.at);
    if (!d) return '';
    d.setMinutes(d.getMinutes() + log.validMin);
    return formatAuthStamp(d);
}

/* 유효시간 표시 — '3분 (~14:30:31)' / '30분 유지 (~10:35:12)' / 만료 시 '3분 (~14:30:31 만료)' / 해당 없음 '-' */
function authValidityLabel(log) {
    var until = authExpiresAt(log);
    if (!until) return '-';
    var time = until.slice(0, 10) === log.at.slice(0, 10) ? until.slice(11) : until.slice(5);
    if (log.validKeep) return log.validMin + '분 유지 (~' + time + ')';
    return log.validMin + '분 (~' + time + (log.at >= until ? ' 만료' : '') + ')';
}

/* ---------- 발송결과 ---------- */

function authDeliveryText(log) {
    return log.delivery || '-';
}

/* 인증번호 전송 결과(발송 성공·실패)를 남긴 이벤트인지 */
function isAuthCodeIssue(log) {
    return /^발송 (성공|실패)/.test(log.delivery || '');
}

function authDeliveryCell(log) {
    var text = authDeliveryText(log);
    if (text === '-') return '-';
    var cls = /실패|차단|미발송/.test(text) ? 'fail' : 'ok';
    return '<span class="auth-result ' + cls + '">' + escapeAuthHtml(text) + '</span>';
}

/* ---------- 표시 공통 ---------- */

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
