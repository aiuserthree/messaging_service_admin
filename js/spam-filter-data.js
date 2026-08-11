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
    { at: '2025-06-20 04:00:12', source: 'kisa', added: 42, updated: 11, removed: 3, total: 12840, result: 'ok',   actor: '자동 동기화' },
    { at: '2025-06-13 04:00:08', source: 'kisa', added: 27, updated: 6,  removed: 1, total: 12790, result: 'ok',   actor: '자동 동기화' },
    { at: '2025-06-06 04:00:15', source: 'kisa', added: 35, updated: 9,  removed: 0, total: 12758, result: 'ok',   actor: '자동 동기화' },
    { at: '2025-06-02 11:24:37', source: 'self', added: 8,  updated: 4,  removed: 2, total: 12723, result: 'ok',   actor: '관리자(admin01) 수동 등록' },
    { at: '2025-05-30 04:00:11', source: 'kisa', added: 0,  updated: 0,  removed: 0, total: 12717, result: 'fail', actor: '자동 동기화', note: '외부기관 API 응답 지연 — 다음 회차 재시도' },
    { at: '2025-05-23 04:00:09', source: 'kisa', added: 19, updated: 3,  removed: 1, total: 12717, result: 'ok',   actor: '자동 동기화' }
];

/* ---------- 탐지·차단 결과 로그 ---------- */

var SPAM_DETECTIONS = [
    {
        id: 'D-20250622-0031', at: '2025-06-22 15:12:44',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 4200, ip: '121.190.24.5',
        content: '(광고) 지금바로클릭! 무료 이벤트 당첨 확인 ▶ https://bit.ly/abcd12 무료거부 08012345678',
        matched: [{ type: 'word', value: '지금바로클릭' }, { type: 'word', value: '무료' }, { type: 'word', value: '당첨' }, { type: 'url', value: 'bit.ly' }],
        rule: 'R03 피싱 유도 조합', action: 'block', holdStatus: null
    },
    {
        id: 'D-20250622-0029', at: '2025-06-22 11:38:20',
        memberId: 'M001', memberName: '홍길동', loginId: 'hong@example.com',
        msgType: '일반문자(SMS)', caller: '02-1234-5678', count: 320, ip: '211.36.142.77',
        content: '[아이뱅크] 6월 정기 점검 안내드립니다. 점검 중 서비스 이용이 무료로 제공됩니다.',
        matched: [{ type: 'word', value: '무료' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '김담당(admin@ibank.co.kr)', decidedAt: '2025-06-22 11:52:06',
        approvalNo: 'APV-2506221152-8841', verify: 'email-otp', decidedIp: '211.36.142.77',
        decisionReason: '점검 안내 문구로 광고성 아님 — 오탐 확인'
    },
    {
        id: 'D-20250621-0018', at: '2025-06-21 16:05:11',
        memberId: 'M004', memberName: '박선거', loginId: 'election@example.com',
        msgType: '선거문자(LMS)', caller: '02-987-6543', count: 15000, ip: '175.223.10.44',
        content: '기호 1번 OOO 후보입니다. 원금보장 수익보장 정책으로 지역 경제를 살리겠습니다.',
        matched: [{ type: 'word', value: '원금보장' }, { type: 'word', value: '수익보장' }],
        rule: 'R04 투자 리딩 조합', action: 'hold', holdStatus: 'pending'
    },
    {
        id: 'D-20250621-0012', at: '2025-06-21 09:22:35',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 8800, ip: '121.190.24.5',
        content: '(광고) 신용조회없이 당일 대출 가능! 상담 070-1234-5678 무료거부 08012345678',
        matched: [{ type: 'word', value: '신용조회없이' }, { type: 'phone', value: '070-1234-5678' }],
        rule: '-', action: 'block', holdStatus: null
    },
    {
        id: 'D-20250620-0044', at: '2025-06-20 14:47:02',
        memberId: 'M003', memberName: '이영희', loginId: 'lee@example.com',
        msgType: '광고문자(SMS)', caller: '010-5555-1234', count: 640, ip: '58.226.11.9',
        content: '(광고) 여름맞이 무료 체험 이벤트! 자세히 보기 https://me2.do/xyz 무료거부 08012345678',
        matched: [{ type: 'word', value: '무료' }, { type: 'url', value: 'me2.do' }],
        rule: '-', action: 'hold', holdStatus: 'rejected',
        approver: '이승인(approve@corp.co.kr)', decidedAt: '2025-06-20 15:10:41',
        verify: 'email-otp', decidedIp: '121.190.24.5',
        decisionReason: '승인 인증번호 미입력(유효시간 만료) — 광고 수신동의 확보 내역이 확인되지 않아 미승인'
    },
    {
        id: 'D-20250619-0027', at: '2025-06-19 10:14:58',
        memberId: 'M002', memberName: '김철수', loginId: 'kim@example.com',
        msgType: '광고문자(LMS)', caller: '1588-0000', count: 12000, ip: '203.0.113.1',
        content: '(광고) 카지노 첫 충전 200% 당첨 이벤트 ▶ https://win-lotto.xyz 무료거부 08012345678',
        matched: [{ type: 'word', value: '카지노' }, { type: 'word', value: '당첨' }, { type: 'url', value: 'win-lotto.xyz' }],
        rule: 'R01 도박 유인 조합', action: 'block', holdStatus: null
    },
    {
        id: 'D-20250618-0009', at: '2025-06-18 13:29:16',
        memberId: 'M001', memberName: '홍길동', loginId: 'hong@example.com',
        msgType: '일반문자(SMS)', caller: '02-1234-5678', count: 90, ip: '211.36.142.77',
        content: '[아이뱅크] 이번 달 이벤트 당첨자 안내입니다. 자세한 내용은 고객센터로 문의해주세요.',
        matched: [{ type: 'word', value: '당첨' }],
        rule: '-', action: 'hold', holdStatus: 'approved',
        approver: '김담당(admin@ibank.co.kr)', decidedAt: '2025-06-18 13:41:52',
        approvalNo: 'APV-2506181341-2207', verify: 'email-otp', decidedIp: '211.36.142.77',
        decisionReason: '자사 이벤트 당첨 안내 — 정상 발송 확인'
    },
    {
        id: 'D-20250617-0021', at: '2025-06-17 17:52:39',
        memberId: 'M003', memberName: '이영희', loginId: 'lee@example.com',
        msgType: '광고문자(LMS)', caller: '010-5555-1234', count: 2100, ip: '58.226.11.9',
        content: '(광고) 무료 상담! 수익보장 투자 정보 070-1234-5678 무료거부 08012345678',
        matched: [{ type: 'word', value: '무료' }, { type: 'word', value: '수익보장' }, { type: 'phone', value: '070-1234-5678' }],
        rule: 'R02 불법 대부 조합', action: 'block', holdStatus: null
    }
];

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
