/* 관리자 권한 공통 데이터·헬퍼
 *
 * 관리자 시스템의 메뉴 구조, 권한 그룹 정의, 관리자 계정별 소속 그룹을 한곳에 모은 모듈이다.
 * permission-group.html(권한 그룹 관리)과 admin-permission-status.html(관리자별 권한 현황)이
 * 함께 사용한다. 메뉴 키는 js/sidebar.js 의 activeMenu 키와 동일하게 유지한다.
 *
 * 권한 모델
 *   - 권한은 '권한 그룹' 단위로만 부여한다. 관리자 계정은 반드시 1개 그룹에 소속되며,
 *     계정별 개별 예외 권한은 두지 않는다. (계정 권한 = 소속 그룹 권한)
 *   - 권한 종류는 메뉴별 3가지다.
 *       read   조회        메뉴 접근·목록/상세 조회·내보내기
 *       write  등록·수정   신규 등록, 정보 수정, 승인·반려 등 상태 변경
 *       delete 삭제        데이터 삭제·말소 (최고 관리자 그룹에만 부여)
 *   - 계정 생성·삭제·그룹 변경은 '계정 생성·삭제·권한 변경'(admin-account-delete.html)에서
 *     요청·승인 절차를 거쳐 처리하고, 그룹별 메뉴 권한은 '권한 그룹 관리'에서만 변경한다.
 *   - 권한 부여 현황은 분기 1회(1·4·7·10월 초) 정기 검토한다. 보안심사 3.2-01 / 3.3-02
 *
 * 민감 권한 (ADMIN_SENSITIVE_CATEGORIES)
 *   admin    관리자 계정·권한 관리  관리자 계정·권한 그룹·계정 변경 메뉴의 등록·수정/삭제
 *   security 보안 설정              보안 정책·국외 접속 차단·환경 설정의 등록·수정/삭제
 *   privacy  개인정보 처리          회원 목록·회원 정보·서류의 등록·수정/삭제
 *   delete   삭제 권한              메뉴 구분 없이 삭제 권한 보유
 *   log      로그 조회              보안 및 감사 로그 메뉴 조회
 *
 * 실제 연동 시 아래 API 로 대체한다.
 *   GET  /api/admin/menus                              관리자 메뉴 구조
 *   GET  /api/admin/permission-groups                  권한 그룹 목록·그룹별 메뉴 권한
 *   PUT  /api/admin/permission-groups/{groupId}/permissions  그룹 메뉴 권한 저장 (최고 관리자)
 *   GET  /api/admin/accounts/permissions               관리자 계정별 소속 그룹·권한 요약
 *   GET  /api/admin/accounts/permissions/export        계정 × 메뉴 권한 매트릭스 내보내기(CSV)
 */

/* 관리자 메뉴 구조 (섹션 → 메뉴). js/sidebar.js 메뉴 순서와 동일 */
var ADMIN_MENU_STRUCTURE = [
    {
        section: '메인',
        items: [
            { key: 'index', name: '대시보드', href: 'index.html' },
            { key: 'banner-manage', name: '배너 관리', href: 'banner-manage.html' },
            { key: 'popup-manage', name: '팝업 관리', href: 'popup-manage.html' }
        ]
    },
    {
        section: '발송관리',
        items: [
            { key: 'send-list', name: '전체 발송 내역', href: 'send-list.html' },
            { key: 'send-policy', name: '발송 정책 관리', href: 'send-policy.html' }
        ]
    },
    {
        section: '회원 관리',
        items: [
            { key: 'member-list', name: '회원 목록', href: 'member-list.html' },
            { key: 'member-conversion', name: '회원 전환 관리', href: 'member-conversion.html' },
            { key: 'member-grade', name: '회원 등급 관리', href: 'member-grade.html' },
            { key: 'member-dormant', name: '휴면 회원 관리', href: 'member-dormant.html' },
            { key: 'member-edit', name: '회원 정보 관리', href: 'member-edit.html' },
            { key: 'member-document-list', name: '서류 목록 조회', href: 'member-document-list.html' },
            { key: 'member-caller-number', name: '회원 발신번호 관리', href: 'member-caller-number.html' }
        ]
    },
    {
        section: '발신번호 관리',
        items: [
            { key: 'caller-number-pending', name: '발신번호 인증', href: 'caller-number-pending.html' },
            { key: 'kakao-profile-list', name: '카카오톡 발신 프로필', href: 'kakao-profile-list.html' }
        ]
    },
    {
        section: '결제 및 정산',
        items: [
            { key: 'payment-list', name: '결제 관리', href: 'payment-list.html' },
            { key: 'settlement-monthly', name: '정산 관리(예시)', href: 'settlement-monthly.html' },
            { key: 'refund-list', name: '환불 신청 내역', href: 'refund-list.html' },
            { key: 'tax-invoice', name: '세금계산서 자동발행 신청 내역', href: 'tax-invoice.html' }
        ]
    },
    {
        section: '고객 지원',
        items: [
            { key: 'consultation-list', name: '견적 문의', href: 'consultation-list.html' },
            { key: 'inquiry-list', name: '문의 관리', href: 'inquiry-list.html' },
            { key: 'notice-list', name: '공지사항', href: 'notice-list.html' },
            { key: 'faq-list', name: 'FAQ 관리', href: 'faq-list.html' },
            { key: 'promotion-manage', name: '프로모션 관리', href: 'promotion-manage.html' }
        ]
    },
    {
        section: '스팸·제재 관리',
        items: [
            { key: 'spam-filter', name: '차단정보(금칙어) 관리', href: 'spam-filter.html' },
            { key: 'spam-detection-log', name: '탐지·차단 결과 로그', href: 'spam-detection-log.html' },
            { key: 'sanction-manage', name: '계정 제재 관리', href: 'sanction-manage.html' }
        ]
    },
    {
        section: '시스템 설정',
        items: [
            { key: 'system-settings', name: '환경 설정', href: 'system-settings.html' },
            { key: 'code-manage', name: '코드 관리', href: 'code-manage.html' }
        ]
    },
    {
        section: '관리자 계정',
        items: [
            { key: 'user-list', name: '관리자 계정 관리', href: 'user-list.html' },
            { key: 'permission-group', name: '권한 그룹 관리', href: 'permission-group.html' },
            { key: 'admin-permission-status', name: '관리자별 권한 현황', href: 'admin-permission-status.html' },
            { key: 'admin-account-delete', name: '계정 생성·삭제·권한 변경', href: 'admin-account-delete.html' }
        ]
    },
    {
        section: '보안 및 감사',
        items: [
            { key: 'access-log-admin', name: '관리자 접근 로그', href: 'access-log-admin.html' },
            { key: 'access-log-member', name: '회원 접근 로그', href: 'access-log-member.html' },
            { key: 'member-auth-history', name: '회원 인증 이력', href: 'member-auth-history.html' },
            { key: 'work-log', name: '작업 로그', href: 'work-log.html' },
            { key: 'security-log-check', name: '로그 점검', href: 'security-log-check.html' },
            { key: 'security-action-result', name: '조치 및 결과 확인', href: 'security-action-result.html' },
            { key: 'overseas-access-control', name: '국외·우회 접속 차단', href: 'overseas-access-control.html' },
            { key: 'security-policy', name: '보안 정책', href: 'security-policy.html' }
        ]
    }
];

/* 권한 종류 — 화면 표기와 매트릭스 약어 */
var ADMIN_PERMISSION_TYPES = [
    { key: 'read',   label: '조회',      short: 'R' },
    { key: 'write',  label: '등록·수정', short: 'W' },
    { key: 'delete', label: '삭제',      short: 'D' }
];

/* 권한 그룹 정의. permissions 는 아래 기본 권한 계산에서 채운다 */
var ADMIN_PERMISSION_GROUPS = {
    'super': {
        name: '최고 관리자',
        description: '모든 권한을 가진 최고 관리자 그룹',
        badge: 'badge-danger',
        createdAt: '2024-01-01',
        permissions: {}
    },
    'operator': {
        name: '운영 관리자',
        description: '일반 운영 업무를 담당하는 관리자 그룹',
        badge: 'badge-warning',
        createdAt: '2024-01-15',
        permissions: {}
    },
    'reviewer': {
        name: '심사 관리자',
        description: '발신번호 및 템플릿 심사를 담당하는 관리자 그룹',
        badge: 'badge-info',
        createdAt: '2024-02-01',
        permissions: {}
    },
    'support': {
        name: '고객 지원',
        description: '고객 문의 및 지원을 담당하는 관리자 그룹',
        badge: 'badge-secondary',
        createdAt: '2024-02-10',
        permissions: {}
    },
    'general': {
        name: '일반 관리자',
        description: '조회 위주의 최소 권한을 가진 기본 관리자 그룹',
        badge: 'badge-secondary',
        createdAt: '2025-06-01',
        permissions: {}
    }
};

/* ---------- 그룹별 기본 권한 (최소 권한 원칙) ---------- */

(function () {
    var R   = { read: true, write: false, delete: false };
    var RW  = { read: true, write: true,  delete: false };

    function grant(groupId, keys, perm) {
        keys.forEach(function (key) {
            ADMIN_PERMISSION_GROUPS[groupId].permissions[key] =
                { read: perm.read, write: perm.write, delete: perm.delete };
        });
    }

    // 최고 관리자는 모든 권한, 다른 그룹은 기본적으로 권한 없음
    ADMIN_MENU_STRUCTURE.forEach(function (section) {
        section.items.forEach(function (item) {
            Object.keys(ADMIN_PERMISSION_GROUPS).forEach(function (groupId) {
                ADMIN_PERMISSION_GROUPS[groupId].permissions[item.key] = groupId === 'super'
                    ? { read: true, write: true, delete: true }
                    : { read: false, write: false, delete: false };
            });
        });
    });

    // 운영 관리자 — 운영 메뉴 등록·수정. 삭제 권한 없음,
    // 관리자 계정·시스템 설정·보안 설정 메뉴 접근 불가, 감사 로그는 회원 인증 이력 조회만 허용(CS 대응)
    grant('operator', ['send-list', 'send-policy', 'member-list', 'member-conversion',
        'member-grade', 'member-dormant', 'member-edit', 'member-document-list', 'member-caller-number',
        'caller-number-pending', 'kakao-profile-list',
        'payment-list', 'settlement-monthly', 'refund-list', 'tax-invoice',
        'consultation-list', 'inquiry-list', 'notice-list', 'faq-list', 'promotion-manage',
        'spam-filter', 'spam-detection-log', 'sanction-manage'], RW);
    grant('operator', ['index', 'member-auth-history'], R);

    // 심사 관리자 — 발신번호·발신 프로필 심사만 등록·수정
    grant('reviewer', ['caller-number-pending', 'kakao-profile-list'], RW);
    grant('reviewer', ['index'], R);

    // 고객 지원 — 문의·게시물 등록·수정, 회원 정보는 조회만
    grant('support', ['consultation-list', 'inquiry-list', 'notice-list', 'faq-list', 'promotion-manage'], RW);
    grant('support', ['index', 'member-list'], R);

    // 일반 관리자 (조회 전용) — 외부 협력사 계정이 소속되므로 회원 개인정보 메뉴는 제외
    grant('general', ['index', 'send-list', 'notice-list', 'faq-list'], R);
})();

/* 민감 권한 분류 — 해당 권한 보유 시 현황 화면에서 표시·집계한다.
 * rules: 메뉴 키 → 민감으로 보는 권한 종류. anyMenu 는 메뉴 구분 없이 적용 */
var ADMIN_SENSITIVE_CATEGORIES = [
    {
        id: 'admin', label: '관리자·권한 관리', cls: 'admin',
        desc: '관리자 계정 생성·삭제, 권한 그룹 변경',
        rules: {
            'user-list': ['write', 'delete'],
            'permission-group': ['write', 'delete'],
            'admin-account-delete': ['write', 'delete'],
            'admin-permission-status': ['write', 'delete']
        }
    },
    {
        id: 'security', label: '보안 설정', cls: 'security',
        desc: '보안 정책·국외 접속 차단·환경 설정 변경',
        rules: {
            'security-policy': ['write', 'delete'],
            'overseas-access-control': ['write', 'delete'],
            'system-settings': ['write', 'delete']
        }
    },
    {
        id: 'privacy', label: '개인정보 처리', cls: 'privacy',
        desc: '회원 개인정보·제출 서류 수정·삭제',
        rules: {
            'member-list': ['write', 'delete'],
            'member-edit': ['write', 'delete'],
            'member-document-list': ['write', 'delete']
        }
    },
    {
        id: 'delete', label: '삭제 권한', cls: 'delete',
        desc: '메뉴 구분 없이 데이터 삭제 가능',
        anyMenu: ['delete']
    },
    {
        id: 'log', label: '로그 조회', cls: 'log',
        desc: '보안 및 감사 로그 열람',
        rules: {
            'access-log-admin': ['read'],
            'access-log-member': ['read'],
            'member-auth-history': ['read'],
            'work-log': ['read'],
            'security-log-check': ['read'],
            'security-action-result': ['read']
        }
    }
];

/* 권한 현황 기준일시와 정기 검토 주기 */
var ADMIN_PERMISSION_BASE_AT = '2026-09-28 09:00';
var ADMIN_PERMISSION_REVIEW = {
    cycle: '분기 1회',
    lastReviewedAt: '2026-07-01',
    nextReviewAt: '2026-10-01',
    reviewer: '박정호 (정보보호팀장)'
};

/* 관리자 계정별 소속 권한 그룹.
 * external: 외부 협력사 계정 — 사용 기한(expiresAt) 이후 자동 정지 */
var ADMIN_PERMISSION_ACCOUNTS = [
    {
        name: '박정호', email: 'jhpark@ibank.co.kr', dept: '정보보호팀', groupId: 'super', status: 'active',
        createdAt: '2024-01-01', changedAt: '2024-01-01', changeNote: '계정 생성 시 최고 관리자 부여 (CRT-2024-0001)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '김나영', email: 'nykim@ibank.co.kr', dept: '서비스운영팀', groupId: 'super', status: 'active',
        createdAt: '2024-01-01', changedAt: '2026-01-02', changeNote: '권한 변경 (일반 관리자 → 최고 관리자, CHG-2026-0001)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '이수민', email: 'smlee@ibank.co.kr', dept: '서비스운영팀', groupId: 'operator', status: 'active',
        createdAt: '2024-01-15', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 운영 관리자 그룹 대시보드 쓰기·관리자 계정 메뉴 회수 (GRP-2026-0004·0005)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '정하늘', email: 'hnjung@ibank.co.kr', dept: '서비스운영팀', groupId: 'operator', status: 'active',
        createdAt: '2024-03-02', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 운영 관리자 그룹 대시보드 쓰기·관리자 계정 메뉴 회수 (GRP-2026-0004·0005)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '윤지아', email: 'jayoon@ibank.co.kr', dept: '고객지원팀', groupId: 'operator', status: 'active',
        createdAt: '2024-02-10', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 운영 관리자 그룹 대시보드 쓰기·관리자 계정 메뉴 회수 (GRP-2026-0004·0005) / 2026-03-16 고객 지원 → 운영 관리자 (CHG-2026-0002)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '한지우', email: 'jwhan@ibank.co.kr', dept: '서비스운영팀', groupId: 'reviewer', status: 'active',
        createdAt: '2026-02-16', changedAt: '2026-02-16', changeNote: '계정 생성 시 심사 관리자 부여 — 오세훈 퇴사에 따른 심사 업무 인수',
        reviewedAt: '2026-07-01'
    },
    {
        name: '문서연', email: 'symoon@ibank.co.kr', dept: '고객지원팀', groupId: 'support', status: 'active',
        createdAt: '2026-04-06', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 고객 지원 그룹 회원 목록 쓰기 회수, 조회만 유지 (GRP-2026-0006)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '강민서', email: 'mskang@ibank.co.kr', dept: '사업기획팀', groupId: 'general', status: 'suspended',
        createdAt: '2025-06-11', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 일반 관리자 그룹 회원 목록·문의 관리 조회 회수 (GRP-2026-0007)',
        statusNote: '90일 이상 미접속 — 2026-04-28 자동 정지 (로그인 차단)',
        reviewedAt: '2026-07-01'
    },
    {
        name: '장태민', email: 'tmjang@nexsolution.co.kr', dept: '(주)넥스솔루션 (유지보수 협력사)', groupId: 'general', status: 'active',
        external: true, expiresAt: '2026-12-31',
        createdAt: '2026-07-01', changedAt: '2026-07-01', changeNote: '유지보수 계약(IB-MA-2026-014)에 따라 조회 전용(일반 관리자) 부여',
        reviewedAt: '2026-07-01'
    },
    {
        name: '백영훈', email: 'yhbaek@datalinks.co.kr', dept: '(주)데이터링크스 (발송 모듈 구축 협력사)', groupId: 'general', status: 'suspended',
        external: true, expiresAt: '2026-09-15',
        createdAt: '2026-03-16', changedAt: '2026-07-01', changeNote: '분기 정기 검토 — 일반 관리자 그룹 회원 목록·문의 관리 조회 회수 (GRP-2026-0007)',
        statusNote: '사용 기한(2026-09-15) 만료 — 2026-09-16 자동 정지',
        reviewedAt: '2026-07-01'
    }
];

var ADMIN_ACCOUNT_STATUS = {
    active:    { label: '활성', badge: 'badge-success' },
    suspended: { label: '정지', badge: 'badge-secondary' }
};

/* ---------- 헬퍼 (admin-common.js 로드 순서와 무관하게 동작하도록 자체 정의) ---------- */

function escapePermHtml(text) {
    return String(text === null || text === undefined ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* 섹션 정보를 포함한 메뉴 평면 목록 */
function getAdminMenuItems() {
    var list = [];
    ADMIN_MENU_STRUCTURE.forEach(function (section) {
        section.items.forEach(function (item) {
            list.push({ key: item.key, name: item.name, href: item.href, section: section.section });
        });
    });
    return list;
}

function getAdminPermissionGroup(groupId) {
    return ADMIN_PERMISSION_GROUPS[groupId] || null;
}

/* 그룹의 메뉴 권한 — 정의가 없으면 권한 없음 */
function getGroupMenuPermission(groupId, menuKey) {
    var group = ADMIN_PERMISSION_GROUPS[groupId];
    var perm = group && group.permissions[menuKey];
    return perm || { read: false, write: false, delete: false };
}

/* 그룹 권한 집계 — 접근 가능 메뉴(권한 1개 이상), 종류별 메뉴 수 */
function summarizeGroupPermissions(groupId) {
    var summary = { total: 0, access: 0, read: 0, write: 0, delete: 0 };
    getAdminMenuItems().forEach(function (item) {
        var p = getGroupMenuPermission(groupId, item.key);
        summary.total++;
        if (p.read || p.write || p.delete) summary.access++;
        if (p.read) summary.read++;
        if (p.write) summary.write++;
        if (p.delete) summary.delete++;
    });
    return summary;
}

/* 특정 메뉴·권한 종류가 속하는 민감 권한 분류 목록 */
function getSensitiveCategoriesFor(menuKey, type) {
    return ADMIN_SENSITIVE_CATEGORIES.filter(function (cat) {
        if (cat.anyMenu) return cat.anyMenu.indexOf(type) !== -1;
        return !!(cat.rules[menuKey] && cat.rules[menuKey].indexOf(type) !== -1);
    });
}

/* 메뉴 자체가 민감 권한 대상인지 (삭제 권한 전반은 제외 — 모든 메뉴가 해당하므로) */
function isSensitiveMenu(menuKey) {
    return ADMIN_SENSITIVE_CATEGORIES.some(function (cat) {
        return !cat.anyMenu && !!cat.rules[menuKey];
    });
}

/* 그룹이 보유한 민감 권한 분류 — [{ category, menus: [메뉴명...] }] */
function getGroupSensitiveFlags(groupId) {
    var items = getAdminMenuItems();
    return ADMIN_SENSITIVE_CATEGORIES.map(function (cat) {
        var menus = [];
        items.forEach(function (item) {
            var p = getGroupMenuPermission(groupId, item.key);
            var hit = ADMIN_PERMISSION_TYPES.some(function (t) {
                return p[t.key] && getSensitiveCategoriesFor(item.key, t.key).indexOf(cat) !== -1;
            });
            if (hit) menus.push(item.name);
        });
        return { category: cat, menus: menus };
    }).filter(function (f) { return f.menus.length > 0; });
}

function groupHasSensitive(groupId, categoryId) {
    return getGroupSensitiveFlags(groupId).some(function (f) { return f.category.id === categoryId; });
}

function getAdminPermissionAccount(email) {
    return ADMIN_PERMISSION_ACCOUNTS.filter(function (a) { return a.email === email; })[0] || null;
}

function getGroupAccounts(groupId) {
    return ADMIN_PERMISSION_ACCOUNTS.filter(function (a) { return a.groupId === groupId; });
}

function permGroupBadge(groupId) {
    var g = ADMIN_PERMISSION_GROUPS[groupId];
    if (!g) return '<span class="badge badge-secondary">미지정</span>';
    return '<span class="badge ' + g.badge + '">' + escapePermHtml(g.name) + '</span>';
}

function permStatusBadge(status) {
    var meta = ADMIN_ACCOUNT_STATUS[status] || ADMIN_ACCOUNT_STATUS.suspended;
    return '<span class="badge ' + meta.badge + '">' + meta.label + '</span>';
}

/* 민감 권한 칩 — 스타일(.perm-chip)은 admin-permission-status.html 에 정의 */
function permSensitiveChip(category, title) {
    return '<span class="perm-chip ' + category.cls + '"' +
        (title ? ' title="' + escapePermHtml(title) + '"' : '') + '>' +
        escapePermHtml(category.label) + '</span>';
}
