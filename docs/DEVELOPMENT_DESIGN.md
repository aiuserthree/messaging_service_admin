# 톡벨 관리자 시스템 상세개발설계서

## 1. 문서 개요

### 1.1 문서 정보
| 항목 | 내용 |
|------|------|
| **문서명** | 톡벨 관리자 시스템 상세개발설계서 |
| **버전** | v1.0.0 |
| **작성일** | 2025-01-05 |
| **프로젝트** | Tokbell Admin |

### 1.2 참조 문서
- 프로젝트 명세서 (PROJECT_SPECIFICATION.md)
- 운영정책서 (운영정책서_목차_초안_v0_33.md)
- 기능정의서 (ADM_0~7_기능정의서.md)

---

## 2. 개발 환경 설정

### 2.1 개발 도구
| 도구 | 용도 | 버전 |
|------|------|------|
| Visual Studio Code | 코드 에디터 | Latest |
| Git | 버전 관리 | 2.x |
| Chrome DevTools | 디버깅 | Latest |
| Live Server | 로컬 개발 서버 | VS Code Extension |

### 2.2 브라우저 지원
| 브라우저 | 최소 버전 |
|----------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 2.3 코딩 컨벤션
```
- HTML: 시맨틱 태그 사용, 들여쓰기 4칸
- CSS: BEM 네이밍 (변형), 변수 활용
- JavaScript: camelCase, ES6+ 문법
- 파일명: kebab-case (예: member-list.html)
- 함수명: camelCase (예: loadMemberList)
```

---

## 3. CSS 설계 상세

### 3.1 CSS 변수 (Design Tokens)
```css
:root {
    /* Primary Colors */
    --admin-primary: #1e40af;
    --admin-primary-hover: #1e3a8a;
    
    /* Semantic Colors */
    --admin-secondary: #64748b;
    --admin-success: #10b981;
    --admin-danger: #ef4444;
    --admin-warning: #f59e0b;
    
    /* Background Colors */
    --admin-bg: #f1f5f9;
    --admin-surface: #ffffff;
    --admin-border: #e2e8f0;
    
    /* Text Colors */
    --admin-text-primary: #0f172a;
    --admin-text-secondary: #475569;
    --admin-text-muted: #94a3b8;
    
    /* Sidebar Colors */
    --admin-sidebar-bg: #1e293b;
    --admin-sidebar-hover: #334155;
    --admin-sidebar-active: #3b82f6;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
}
```

### 3.2 레이아웃 클래스
| 클래스명 | 용도 | 속성 |
|----------|------|------|
| `.admin-container` | 전체 컨테이너 | flex, min-height: 100vh |
| `.admin-sidebar` | 사이드바 | width: 260px, fixed |
| `.admin-main` | 메인 영역 | margin-left: 260px |
| `.admin-header` | 상단 헤더 | height: 64px, sticky |
| `.admin-content` | 콘텐츠 영역 | padding: 24px |

### 3.3 컴포넌트 클래스

#### 3.3.1 버튼 (Button)
```css
.btn { /* 기본 버튼 */ }
.btn-primary { /* 파란색 주요 버튼 */ }
.btn-secondary { /* 회색 보조 버튼 */ }
.btn-success { /* 초록색 성공 버튼 */ }
.btn-danger { /* 빨간색 삭제 버튼 */ }
.btn-warning { /* 주황색 경고 버튼 */ }
.btn-info { /* 연파랑 정보 버튼 */ }
.btn-outline { /* 테두리만 있는 버튼 */ }
.btn-sm { /* 작은 버튼 */ }
.btn-lg { /* 큰 버튼 */ }
```

#### 3.3.2 배지 (Badge)
```css
.badge { /* 기본 배지 */ }
.badge-success { /* 초록 - 완료, 활성 */ }
.badge-warning { /* 주황 - 대기, 검토중 */ }
.badge-danger { /* 빨강 - 실패, 차단 */ }
.badge-info { /* 파랑 - 정보 */ }
.badge-secondary { /* 회색 - 비활성 */ }
```

#### 3.3.3 카드 (Card)
```css
.card { /* 카드 컨테이너 */ }
.card-header { /* 카드 헤더 */ }
.card-title { /* 카드 제목 */ }
.card-description { /* 카드 설명 */ }
```

#### 3.3.4 테이블 (Table)
```css
.table-container { /* 테이블 래퍼 - overflow-x: auto */ }
table { /* 기본 테이블 */ }
thead { /* 테이블 헤더 */ }
th { /* 헤더 셀 */ }
td { /* 데이터 셀 */ }
tbody tr:hover { /* 행 호버 효과 */ }
```

#### 3.3.5 폼 (Form)
```css
.form-group { /* 폼 그룹 */ }
.form-label { /* 레이블 */ }
.form-control { /* 입력 필드 */ }
.form-control:focus { /* 포커스 상태 */ }
.form-control:disabled { /* 비활성 상태 */ }
```

#### 3.3.6 모달 (Modal)
```css
.modal { /* 모달 오버레이 */ }
.modal.show { /* 표시 상태 */ }
.modal-content { /* 모달 컨텐츠 */ }
.modal-header { /* 모달 헤더 */ }
.modal-title { /* 모달 제목 */ }
.modal-close { /* 닫기 버튼 */ }
.modal-body { /* 모달 본문 */ }
.modal-footer { /* 모달 푸터 */ }
```

### 3.4 반응형 브레이크포인트
```css
/* Tablet */
@media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile */
@media (max-width: 768px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-main { margin-left: 0; }
    .stats-grid { grid-template-columns: 1fr; }
}
```

---

## 4. JavaScript 설계 상세

### 4.1 공통 함수 (admin-common.js)

#### 4.1.1 모달 제어
```javascript
/**
 * 모달 열기
 * @param {string} modalId - 모달 요소 ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 모달 닫기
 * @param {string} modalId - 모달 요소 ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}
```

#### 4.1.2 토스트 알림
```javascript
/**
 * 토스트 메시지 표시
 * @param {string} message - 메시지 내용
 * @param {string} type - 타입 (success, error, warning, info)
 * @param {number} duration - 표시 시간 (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
```

#### 4.1.3 날짜 포맷
```javascript
/**
 * 날짜 포맷팅
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @param {string} format - 포맷 (YYYY-MM-DD, YYYY-MM-DD HH:mm:ss)
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
```

#### 4.1.4 숫자 포맷
```javascript
/**
 * 숫자에 천단위 콤마 추가
 * @param {number} num - 숫자
 * @returns {string} 포맷된 숫자 문자열
 */
function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}

/**
 * 원화 포맷
 * @param {number} amount - 금액
 * @returns {string} 포맷된 금액 문자열
 */
function formatCurrency(amount) {
    return '₩' + formatNumber(amount);
}
```

### 4.2 사이드바 모듈 (sidebar.js)

#### 4.2.1 사이드바 HTML 생성
```javascript
/**
 * 사이드바 HTML 생성
 * @param {string} activeMenu - 현재 활성 메뉴 키
 * @returns {string} 사이드바 HTML 문자열
 */
function getSidebarHTML(activeMenu) {
    return `
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h1>Tokbell Admin</h1>
                <div class="subtitle">관리자 시스템</div>
            </div>
            <nav class="sidebar-menu">
                ${generateMenuSections(activeMenu)}
            </nav>
        </aside>
    `;
}
```

#### 4.2.2 헤더 HTML 생성
```javascript
/**
 * 헤더 HTML 생성
 * @param {string} pageTitle - 페이지 제목
 * @param {string} userRole - 사용자 역할
 * @returns {string} 헤더 HTML 문자열
 */
function getHeaderHTML(pageTitle, userRole = '최고 관리자') {
    return `
        <header class="admin-header">
            <div class="header-left">
                <h2 class="page-title">${pageTitle}</h2>
            </div>
            <div class="header-right">
                <div class="admin-user-info">
                    <div class="user-avatar">관</div>
                    <div>
                        <div class="user-name">관리자</div>
                        <div class="user-role">${userRole}</div>
                    </div>
                </div>
                <button class="btn btn-outline btn-sm">로그아웃</button>
            </div>
        </header>
    `;
}
```

### 4.3 페이지별 JavaScript 패턴

#### 4.3.1 목록 페이지 패턴
```javascript
// Mock 데이터
const mockData = [...];

// 전역 상태
let currentPage = 1;
let pageSize = 10;
let filteredData = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeEventListeners();
});

// 데이터 로드
function loadData(data = null) {
    const items = data || mockData;
    const tbody = document.getElementById('list-tbody');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="N" class="text-center">데이터가 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => generateRowHTML(item)).join('');
    updatePagination(items.length);
}

// 검색/필터
function search() {
    const keyword = document.getElementById('search-keyword').value.trim().toLowerCase();
    const status = document.getElementById('filter-status').value;
    
    filteredData = mockData.filter(item => {
        if (keyword && !item.name.toLowerCase().includes(keyword)) return false;
        if (status && item.status !== status) return false;
        return true;
    });
    
    loadData(filteredData);
    showToast(`${filteredData.length}건이 조회되었습니다.`, 'success');
}

// 페이지네이션
function updatePagination(totalCount) {
    const totalPages = Math.ceil(totalCount / pageSize);
    // 페이지네이션 UI 업데이트
}
```

#### 4.3.2 상세/수정 모달 패턴
```javascript
let currentItemId = null;
let currentItemData = null;

// 모달 열기
function openDetailModal(id) {
    const item = mockData.find(i => i.id === id);
    if (!item) return;
    
    currentItemId = id;
    currentItemData = item;
    
    // 모달 데이터 바인딩
    document.getElementById('modal-field1').textContent = item.field1;
    document.getElementById('modal-field2').value = item.field2;
    
    openModal('detail-modal');
}

// 저장 처리
function saveItem() {
    // 유효성 검사
    if (!validateForm()) {
        showToast('필수 항목을 입력해주세요.', 'error');
        return;
    }
    
    // 데이터 업데이트
    const index = mockData.findIndex(i => i.id === currentItemId);
    if (index !== -1) {
        mockData[index] = { ...mockData[index], ...getFormData() };
    }
    
    closeModal('detail-modal');
    loadData();
    showToast('저장되었습니다.', 'success');
}
```

---

## 5. 주요 기능 상세 설계

### 5.1 회원 가입 승인 (member-approval.html)

#### 5.1.1 데이터 구조
```javascript
const applicationData = {
    id: Number,
    applicationDate: String,          // 신청일시
    memberId: String,                  // 신청 아이디
    memberName: String,                // 회원명
    memberType: 'personal' | 'business', // 회원유형
    ownerType: 'ceo' | 'staff',       // 소유자유형 (사업자)
    email: String,
    phone: String,
    companyName: String,              // 회사명 (사업자)
    businessNo: String,               // 사업자등록번호
    status: 'pending' | 'approved' | 'rejected' | 'supplement',
    documents: [
        {
            id: Number,
            name: String,             // 서류명
            fileName: String,         // 파일명
            fileSize: String,         // 파일크기
            issueDate: String,        // 발급일
            type: 'image' | 'pdf',
            required: Boolean
        }
    ]
};
```

#### 5.1.2 검증 로직
```javascript
/**
 * 서류 검증
 * @param {Object} document - 서류 객체
 * @returns {Object} { isValid, message }
 */
function validateDocument(document) {
    // 발급일자 3개월 체크
    const issueDate = new Date(document.issueDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (issueDate < threeMonthsAgo) {
        return {
            isValid: false,
            message: '발급일자가 3개월을 초과했습니다.'
        };
    }
    
    return { isValid: true, message: '' };
}

/**
 * 회원 유형별 필수 서류 체크
 * @param {string} memberType - 회원유형
 * @param {Array} documents - 제출 서류 목록
 * @returns {Object} { isComplete, missingDocs }
 */
function checkRequiredDocuments(memberType, documents) {
    const requiredDocs = memberType === 'personal'
        ? ['신분증 사본']
        : ['사업자등록증', '통신서비스이용증명원', '대표자 신분증 사본'];
    
    const submittedNames = documents.map(d => d.name);
    const missingDocs = requiredDocs.filter(doc => !submittedNames.includes(doc));
    
    return {
        isComplete: missingDocs.length === 0,
        missingDocs
    };
}
```

### 5.2 환불 관리 (refund-list.html)

#### 5.2.1 데이터 구조
```javascript
const refundData = {
    id: Number,
    requestDate: String,              // 요청일시
    memberId: String,
    memberName: String,
    memberType: 'personal' | 'business',
    paymentMethod: 'card' | 'transfer' | 'virtual' | 'dedicated',
    lastChargeDate: String,           // 최종 충전일
    lastChargeAmount: Number,         // 최종 충전액
    balance: Number,                  // 잔여 포인트
    usedAmount: Number,               // 사용 금액
    requestAmount: Number,            // 환불 요청액
    sendingCount: Number,             // 발송 중 메시지 수
    scheduledCount: Number,           // 예약 대기 메시지 수
    status: 'pending' | 'processing' | 'completed' | 'rejected',
    reason: String                    // 환불 사유
};
```

#### 5.2.2 환불 가능 조건 검증
```javascript
/**
 * 환불 가능 여부 검증
 * @param {Object} refund - 환불 요청 데이터
 * @returns {Object} { isEligible, issues, refundType }
 */
function validateRefundEligibility(refund) {
    const issues = [];
    let isEligible = true;
    
    // 1. 잔여 포인트 1만원 이상
    if (refund.balance < 10000) {
        isEligible = false;
        issues.push('잔여 포인트가 1만원 미만입니다.');
    }
    
    // 2. 발송 중 메시지 없음
    if (refund.sendingCount > 0) {
        isEligible = false;
        issues.push('발송 중인 메시지가 있습니다.');
    }
    
    // 3. 예약 발송 대기 없음
    if (refund.scheduledCount > 0) {
        isEligible = false;
        issues.push('예약 발송 대기 중인 메시지가 있습니다.');
    }
    
    // 환불 유형 판단
    const refundType = determineRefundType(refund);
    
    return { isEligible, issues, refundType };
}

/**
 * 환불 유형 판단 (전액/수수료)
 * @param {Object} refund - 환불 요청 데이터
 * @returns {Object} { type, feeRate, reason }
 */
function determineRefundType(refund) {
    const chargeDate = new Date(refund.lastChargeDate);
    const today = new Date();
    const diffDays = Math.floor((today - chargeDate) / (1000 * 60 * 60 * 24));
    
    // 카드결제 + 7일 이내 + 미사용 = 전액 환불
    if (refund.paymentMethod === 'card' && diffDays <= 7 && refund.usedAmount === 0) {
        return {
            type: 'full',
            feeRate: 0,
            reason: '충전 후 7일 이내, 포인트 미사용'
        };
    }
    
    // 그 외 = 10% 수수료
    return {
        type: 'partial',
        feeRate: 0.1,
        reason: '충전 후 7일 경과 또는 포인트 사용'
    };
}

/**
 * 환불 금액 계산
 * @param {number} requestAmount - 요청 금액
 * @param {number} feeRate - 수수료율
 * @returns {Object} { fee, finalAmount }
 */
function calculateRefundAmount(requestAmount, feeRate) {
    const fee = Math.floor(requestAmount * feeRate);
    const finalAmount = requestAmount - fee;
    return { fee, finalAmount };
}
```

### 5.3 세금계산서 발급 (tax-invoice.html)

#### 5.3.1 데이터 구조
```javascript
const invoiceData = {
    id: Number,
    requestDate: String,              // 신청일시
    memberId: String,
    memberName: String,
    
    // 공급받는자 정보
    companyName: String,              // 상호
    businessNo: String,               // 사업자등록번호
    ceoName: String,                  // 대표자명
    businessType: String,             // 업태
    businessItem: String,             // 종목
    address: String,                  // 사업장 주소
    email: String,                    // 이메일
    
    // 담당자 정보
    contactName: String,
    contactPhone: String,
    contactEmail: String,
    
    // 거래 정보
    period: String,                   // 대상 월 (YYYY-MM)
    periodStart: String,              // 시작일
    periodEnd: String,                // 종료일
    transactions: [
        {
            date: String,             // 거래일
            method: String,           // 결제수단
            item: String,             // 품목
            supply: Number,           // 공급가액
            tax: Number,              // 세액
            total: Number             // 합계
        }
    ],
    
    // 합계
    supplyAmount: Number,             // 공급가액 합계
    taxAmount: Number,                // 세액 합계
    totalAmount: Number,              // 총 합계
    
    status: 'pending' | 'processing' | 'issued' | 'rejected'
};
```

#### 5.3.2 발급 검증
```javascript
/**
 * 세금계산서 발급 전 체크리스트 검증
 * @returns {Object} { isValid, uncheckedItems }
 */
function validateInvoiceChecklist() {
    const checkItems = [
        'check-business-info',    // 사업자 정보
        'check-address',          // 사업장 주소
        'check-business-type',    // 업태/종목
        'check-amount',           // 거래 내역/금액
        'check-email'             // 수신 이메일
    ];
    
    const uncheckedItems = checkItems.filter(id => {
        const checkbox = document.getElementById(id);
        return checkbox && !checkbox.checked;
    });
    
    return {
        isValid: uncheckedItems.length === 0,
        uncheckedItems
    };
}

/**
 * 작성일자 계산 (전월 말일)
 * @param {string} period - 대상 월 (YYYY-MM)
 * @returns {string} 작성일자 (YYYY-MM-DD)
 */
function calculateIssueDate(period) {
    const [year, month] = period.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
}

/**
 * 발급 예정일 계산 (신청일 + 3일)
 * @param {string} requestDate - 신청일시
 * @returns {string} 발급 예정일 (YYYY-MM-DD)
 */
function calculateExpectedDate(requestDate) {
    const date = new Date(requestDate);
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
}
```

### 5.4 프로모션 관리 (promotion-edit.html)

#### 5.4.1 데이터 구조
```javascript
const promotionData = {
    id: Number,
    title: String,                    // 제목
    description: String,              // 설명
    content: String,                  // HTML 내용
    startDate: String,                // 시작일
    endDate: String,                  // 종료일
    status: 'active' | 'pending' | 'ended',
    
    // 이미지 (3곳)
    images: {
        main: {
            url: String,              // 메인 (로그인 후)
            recommendedSize: '1200x400px'
        },
        front: {
            url: String,              // 프론트 (비로그인)
            recommendedSize: '1200x400px'
        },
        event: {
            url: String,              // 고객센터 이벤트
            recommendedSize: '400x300px'
        }
    },
    
    registerDate: String
};
```

#### 5.4.2 이미지 처리
```javascript
/**
 * 위치별 이미지 미리보기
 * @param {string} location - 위치 (main, front, event)
 * @param {HTMLInputElement} input - 파일 입력 요소
 */
function previewImageByLocation(location, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(`preview-img-${location}`).src = e.target.result;
            document.getElementById(`preview-${location}`).style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * 위치별 이미지 삭제
 * @param {string} location - 위치 (main, front, event)
 */
function removeImageByLocation(location) {
    document.getElementById(`image-${location}`).value = '';
    document.getElementById(`preview-${location}`).style.display = 'none';
    document.getElementById(`preview-img-${location}`).src = '';
}
```

---

## 6. API 연동 설계 (향후 구현)

### 6.1 API 엔드포인트 설계
```
Base URL: https://api.tokbell.com/admin/v1

## 회원 관리
GET    /members                    # 회원 목록
GET    /members/:id                # 회원 상세
PUT    /members/:id                # 회원 수정
DELETE /members/:id                # 회원 삭제
GET    /members/approvals          # 가입 승인 대기 목록
POST   /members/approvals/:id      # 가입 승인/반려

## 발송 관리
GET    /sends                      # 발송 목록
GET    /sends/:id                  # 발송 상세
GET    /sends/statistics           # 발송 통계

## 결제 관리
GET    /payments                   # 결제 목록
GET    /payments/:id               # 결제 상세
GET    /refunds                    # 환불 목록
POST   /refunds/:id                # 환불 처리
GET    /invoices                   # 세금계산서 목록
POST   /invoices/:id               # 세금계산서 발급

## 고객지원
GET    /inquiries                  # 문의 목록
POST   /inquiries/:id/answer       # 문의 답변
GET    /notices                    # 공지사항 목록
POST   /notices                    # 공지사항 등록
PUT    /notices/:id                # 공지사항 수정
```

### 6.2 API 호출 래퍼
```javascript
/**
 * API 호출 래퍼
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} 응답 데이터
 */
async function apiCall(endpoint, options = {}) {
    const baseUrl = 'https://api.tokbell.com/admin/v1';
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    };
    
    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Call Failed:', error);
        showToast('서버 오류가 발생했습니다.', 'error');
        throw error;
    }
}
```

---

## 7. 테스트 가이드

### 7.1 기능 테스트 체크리스트

#### 7.1.1 공통 기능
- [ ] 사이드바 메뉴 네비게이션
- [ ] 페이지 제목 표시
- [ ] 모달 열기/닫기
- [ ] 토스트 메시지 표시
- [ ] 페이지네이션 동작

#### 7.1.2 회원 가입 승인
- [ ] 신청 목록 조회
- [ ] 검색/필터 동작
- [ ] 서류 미리보기
- [ ] 서류 다운로드
- [ ] 발급일자 3개월 경고
- [ ] 승인/반려/보완요청 처리

#### 7.1.3 환불 관리
- [ ] 환불 요청 목록 조회
- [ ] 환불 가능 조건 검증
- [ ] 환불 유형 자동 판단
- [ ] 환불 금액 계산
- [ ] 환불 계좌 정보 입력
- [ ] 승인/반려 처리

#### 7.1.4 세금계산서 발급
- [ ] 발급 신청 목록 조회
- [ ] 상세 정보 확인
- [ ] 거래 내역 표시
- [ ] 체크리스트 검증
- [ ] 발급/반려 처리

### 7.2 브라우저 호환성 테스트
| 테스트 항목 | Chrome | Firefox | Safari | Edge |
|------------|--------|---------|--------|------|
| 레이아웃 | ✅ | ✅ | ✅ | ✅ |
| 스타일 | ✅ | ✅ | ✅ | ✅ |
| JavaScript | ✅ | ✅ | ✅ | ✅ |
| 모달 | ✅ | ✅ | ✅ | ✅ |
| 테이블 | ✅ | ✅ | ✅ | ✅ |

### 7.3 반응형 테스트
| 뷰포트 | 너비 | 테스트 항목 |
|--------|------|------------|
| Desktop | 1920px+ | 전체 레이아웃 |
| Laptop | 1200px | 통계 카드 그리드 |
| Tablet | 768px | 사이드바 숨김 |
| Mobile | 375px | 단일 컬럼 레이아웃 |

---

## 8. 배포 가이드

### 8.1 Vercel 배포
```bash
# 1. Git 커밋
git add -A
git commit -m "feat: 기능 설명"

# 2. Push (자동 배포)
git push origin main

# 3. Vercel 대시보드에서 배포 확인
# https://vercel.com/dashboard
```

### 8.2 배포 전 체크리스트
- [ ] 모든 HTML 파일 문법 검사
- [ ] CSS 문법 오류 확인
- [ ] JavaScript 콘솔 에러 없음
- [ ] 모든 링크 정상 동작
- [ ] 반응형 레이아웃 확인

---

## 9. 문서 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-01-05 | - | 최초 작성 |
