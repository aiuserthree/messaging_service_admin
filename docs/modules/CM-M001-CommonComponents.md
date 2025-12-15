# CM-M001: CommonComponents 모듈 상세 개발 설계서

## 1. 모듈 개요

### 1.1 모듈 식별 정보
- **모듈 ID**: CM-M001
- **모듈명**: CommonComponents (공통 컴포넌트)
- **담당 개발자**: Frontend Developer
- **예상 개발 기간**: 4일
- **우선순위**: P0 (최우선)

### 1.2 모듈 목적 및 범위
- **핵심 기능**:
  1. 공통 CSS 스타일 제공 (레이아웃, 버튼, 카드, 테이블 등)
  2. 공통 JavaScript 유틸리티 함수 제공
  3. 모달, 토스트, 페이지네이션 등 재사용 가능한 UI 컴포넌트
  4. 사이드바 메뉴 및 헤더 컴포넌트
  5. 폼 요소 및 배지 스타일

- **비즈니스 가치**: 일관된 UI/UX 제공 및 개발 생산성 향상, 코드 재사용을 통한 유지보수 효율화

- **제외 범위**:
  - 페이지별 비즈니스 로직
  - 외부 라이브러리 (Chart.js, jsPDF 등)

### 1.3 목표 사용자
- **주 사용자 그룹**: 모든 어드민 페이지 개발자
- **사용 시나리오**:
  - 새로운 관리 페이지 개발 시 공통 스타일 적용
  - 모달, 토스트 등 공통 UI 컴포넌트 활용
  - 유틸리티 함수를 통한 데이터 포맷팅

---

## 2. 기술 아키텍처

### 2.1 모듈 구조
```
CM-M001-CommonComponents/
├── css/
│   └── admin-common.css       # 공통 CSS 스타일
├── js/
│   └── admin-common.js        # 공통 JavaScript 함수
├── components/
│   ├── layout/
│   │   ├── sidebar.html       # 사이드바 템플릿
│   │   └── header.html        # 헤더 템플릿
│   ├── ui/
│   │   ├── modal.css          # 모달 스타일
│   │   ├── toast.css          # 토스트 스타일
│   │   ├── pagination.css     # 페이지네이션 스타일
│   │   └── badge.css          # 배지 스타일
│   └── form/
│       └── form-controls.css  # 폼 요소 스타일
└── tests/
    └── common.test.js         # 유틸리티 함수 테스트
```

### 2.2 기술 스택
- **CSS**: CSS3 (CSS Variables, Flexbox, Grid)
- **JavaScript**: Vanilla JavaScript (ES6+)
- **브라우저 지원**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 3. 인터페이스 정의

### 3.1 CSS Variables (디자인 토큰)
```css
:root {
    /* 색상 */
    --admin-primary: #1e40af;
    --admin-primary-hover: #1e3a8a;
    --admin-secondary: #64748b;
    --admin-success: #10b981;
    --admin-danger: #ef4444;
    --admin-warning: #f59e0b;
    
    /* 배경 */
    --admin-bg: #f1f5f9;
    --admin-surface: #ffffff;
    --admin-border: #e2e8f0;
    
    /* 텍스트 */
    --admin-text-primary: #0f172a;
    --admin-text-secondary: #475569;
    --admin-text-muted: #94a3b8;
    
    /* 사이드바 */
    --admin-sidebar-bg: #1e293b;
    --admin-sidebar-hover: #334155;
    --admin-sidebar-active: #3b82f6;
    
    /* 그림자 */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    /* 둥글기 */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
}
```

### 3.2 제공 인터페이스
```javascript
// admin-common.js에서 제공하는 함수들
const CommonComponents = {
    // 모달
    openModal: (modalId: string) => void,
    closeModal: (modalId: string) => void,
    
    // 확인/알림
    confirmAction: (message: string, callback: Function) => void,
    showToast: (message: string, type: 'success' | 'error' | 'info') => void,
    
    // 데이터 포맷팅
    formatDate: (dateString: string) => string,
    formatNumber: (num: number) => string,
    maskPhoneNumber: (phone: string) => string,
    maskEmail: (email: string) => string,
    
    // UI 컴포넌트
    createPagination: (currentPage: number, totalPages: number, containerId: string) => void,
    sortTable: (tableId: string, columnIndex: number, ascending: boolean) => void,
    
    // 유틸리티
    showLoading: (elementId: string) => void,
    goToPage: (page: number) => void  // 각 페이지에서 오버라이드
};
```

---

## 4. CSS 컴포넌트 명세

### 4.1 레이아웃
```css
/* 어드민 컨테이너 */
.admin-container {
    display: flex;
    min-height: 100vh;
}

/* 사이드바 */
.admin-sidebar {
    width: 260px;
    background-color: var(--admin-sidebar-bg);
    color: white;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    z-index: 1000;
    transition: transform 0.3s;
}

/* 메인 영역 */
.admin-main {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* 헤더 */
.admin-header {
    background-color: var(--admin-surface);
    border-bottom: 1px solid var(--admin-border);
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
}

/* 컨텐츠 영역 */
.admin-content {
    flex: 1;
    padding: 24px;
}
```

### 4.2 버튼
```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    gap: 8px;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 버튼 변형 */
.btn-primary { background-color: var(--admin-primary); color: white; }
.btn-secondary { background-color: var(--admin-secondary); color: white; }
.btn-success { background-color: var(--admin-success); color: white; }
.btn-danger { background-color: var(--admin-danger); color: white; }
.btn-warning { background-color: var(--admin-warning); color: white; }
.btn-outline { 
    background-color: transparent; 
    border: 1px solid var(--admin-border); 
    color: var(--admin-text-primary); 
}

/* 버튼 크기 */
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn-lg { padding: 14px 28px; font-size: 16px; }
```

### 4.3 카드
```css
.card {
    background-color: var(--admin-surface);
    border: 1px solid var(--admin-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.card-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--admin-border);
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--admin-text-primary);
    margin: 0;
}

.card-description {
    font-size: 14px;
    color: var(--admin-text-secondary);
    margin-top: 4px;
}
```

### 4.4 통계 카드
```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 24px;
}

.stat-card {
    background-color: var(--admin-surface);
    border: 1px solid var(--admin-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.stat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.stat-card-title {
    font-size: 14px;
    color: var(--admin-text-secondary);
    font-weight: 500;
}

.stat-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.stat-card-icon svg {
    width: 22px;
    height: 22px;
}

/* 아이콘 색상 테마 */
.icon-send { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.icon-success { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; }
.icon-fail { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); color: white; }
.icon-pending { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; }
.icon-processing { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; }
.icon-user { background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); color: white; }
.icon-money { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; }
.icon-inquiry { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; }
.icon-chart { background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%); color: white; }
.icon-notice { background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: white; }

.stat-card-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--admin-text-primary);
    margin-bottom: 8px;
}

.stat-card-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.stat-card-change.positive { color: var(--admin-success); }
.stat-card-change.negative { color: var(--admin-danger); }

/* 반응형 */
@media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr; }
}
```

### 4.5 테이블
```css
.table-container {
    overflow-x: auto;
    border: 1px solid var(--admin-border);
    border-radius: var(--radius-md);
    background-color: var(--admin-surface);
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: var(--admin-bg);
}

th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: var(--admin-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--admin-border);
}

td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--admin-border);
    font-size: 14px;
    color: var(--admin-text-primary);
}

tbody tr:hover {
    background-color: var(--admin-bg);
}

tbody tr:last-child td {
    border-bottom: none;
}
```

### 4.6 배지
```css
.badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success { background-color: #d1fae5; color: #065f46; }
.badge-warning { background-color: #fef3c7; color: #92400e; }
.badge-danger { background-color: #fee2e2; color: #991b1b; }
.badge-info { background-color: #dbeafe; color: #1e40af; }
.badge-secondary { background-color: #e2e8f0; color: #475569; }
.badge-primary { background-color: #dbeafe; color: #1e40af; }

/* 원형 배지 (순위용) */
.badge-circle {
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
}
```

### 4.7 모달
```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.modal.show {
    display: flex;
}

.modal-content {
    background-color: var(--admin-surface);
    border-radius: var(--radius-lg);
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--admin-border);
}

.modal-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--admin-text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--admin-text-secondary);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all 0.2s;
}

.modal-close:hover {
    background-color: var(--admin-bg);
    color: var(--admin-text-primary);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--admin-border);
}
```

### 4.8 폼 요소
```css
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--admin-text-primary);
    font-size: 14px;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--admin-border);
    border-radius: var(--radius-md);
    font-size: 14px;
    transition: all 0.2s;
    background-color: var(--admin-surface);
    color: var(--admin-text-primary);
}

.form-control:focus {
    outline: none;
    border-color: var(--admin-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-control:disabled {
    background-color: var(--admin-bg);
    cursor: not-allowed;
}

select.form-control {
    cursor: pointer;
}
```

### 4.9 탭
```css
.tabs {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid var(--admin-border);
    margin-bottom: 24px;
}

.tab {
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--admin-text-secondary);
    transition: all 0.2s;
}

.tab:hover {
    color: var(--admin-text-primary);
}

.tab.active {
    color: var(--admin-primary);
    border-bottom-color: var(--admin-primary);
}
```

### 4.10 페이지네이션
```css
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
}

.pagination-btn {
    padding: 8px 12px;
    border: 1px solid var(--admin-border);
    background-color: var(--admin-surface);
    color: var(--admin-text-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: var(--admin-bg);
}

.pagination-btn.active {
    background-color: var(--admin-primary);
    color: white;
    border-color: var(--admin-primary);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

---

## 5. JavaScript 유틸리티 명세

### 5.1 모달 관리
```javascript
/**
 * 모달 열기
 * @param {string} modalId - 모달 요소의 ID
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
 * @param {string} modalId - 모달 요소의 ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
});
```

### 5.2 확인 대화상자
```javascript
/**
 * 확인 팝업 표시
 * @param {string} message - 확인 메시지
 * @param {Function} callback - 확인 시 실행할 콜백 함수
 */
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}
```

### 5.3 토스트 메시지
```javascript
/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 ('success' | 'error' | 'info')
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
```

### 5.4 데이터 포맷팅
```javascript
/**
 * 날짜 포맷팅
 * @param {string} dateString - ISO 형식 날짜 문자열
 * @returns {string} 포맷팅된 날짜 ('YYYY. MM. DD. HH:mm')
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 숫자 포맷팅 (천단위 콤마)
 * @param {number} num - 숫자
 * @returns {string} 포맷팅된 숫자 문자열
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('ko-KR');
}

/**
 * 전화번호 마스킹
 * @param {string} phone - 전화번호
 * @returns {string} 마스킹된 전화번호 (010-****-5678)
 */
function maskPhoneNumber(phone) {
    if (!phone) return '-';
    if (phone.length === 11) {
        return phone.substring(0, 3) + '-****-' + phone.substring(7);
    }
    return phone;
}

/**
 * 이메일 마스킹
 * @param {string} email - 이메일 주소
 * @returns {string} 마스킹된 이메일 (ab***@domain.com)
 */
function maskEmail(email) {
    if (!email) return '-';
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
        return email;
    }
    const masked = local.substring(0, 2) + '***';
    return masked + '@' + domain;
}
```

### 5.5 페이지네이션
```javascript
/**
 * 페이지네이션 생성
 * @param {number} currentPage - 현재 페이지 (1-based)
 * @param {number} totalPages - 전체 페이지 수
 * @param {string} containerId - 페이지네이션을 삽입할 컨테이너 ID
 */
function createPagination(currentPage, totalPages, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    container.appendChild(prevBtn);
    
    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => goToPage(1);
        container.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px';
            container.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        container.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px';
            container.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => goToPage(totalPages);
        container.appendChild(lastBtn);
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    container.appendChild(nextBtn);
}

/**
 * 페이지 이동 (각 페이지에서 오버라이드)
 * @param {number} page - 이동할 페이지 번호
 */
function goToPage(page) {
    console.log('Go to page:', page);
    // 각 페이지에서 구현
}
```

### 5.6 테이블 정렬
```javascript
/**
 * 테이블 정렬
 * @param {string} tableId - 테이블 요소의 ID
 * @param {number} columnIndex - 정렬할 컬럼 인덱스 (0-based)
 * @param {boolean} ascending - 오름차순 여부
 */
function sortTable(tableId, columnIndex, ascending = true) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        
        // 숫자 비교
        const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
        const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return ascending ? aNum - bNum : bNum - aNum;
        }
        
        // 문자열 비교
        return ascending 
            ? aText.localeCompare(bText, 'ko')
            : bText.localeCompare(aText, 'ko');
    });
    
    rows.forEach(row => tbody.appendChild(row));
}
```

### 5.7 사이드바 관리
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 스크롤 위치 저장 및 복원
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebar) {
        sidebar.addEventListener('scroll', function() {
            sessionStorage.setItem('sidebarScrollPosition', sidebar.scrollTop.toString());
        });
        
        const savedScroll = sessionStorage.getItem('sidebarScrollPosition');
        if (savedScroll) {
            sidebar.scrollTop = parseInt(savedScroll, 10);
        }
    }
    
    // 메뉴 링크 클릭 시 스크롤 위치 저장
    const menuLinks = document.querySelectorAll('.sidebar-menu a.menu-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && sidebar) {
                sessionStorage.setItem('sidebarScrollPosition', sidebar.scrollTop.toString());
            }
        });
    });
    
    // 서브메뉴 토글
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.submenu-item')) {
                return;
            }
            e.preventDefault();
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                const isOpen = submenu.classList.contains('open');
                document.querySelectorAll('.submenu').forEach(sub => sub.classList.remove('open'));
                document.querySelectorAll('.menu-item.has-submenu').forEach(menu => menu.classList.remove('open'));
                if (!isOpen) {
                    submenu.classList.add('open');
                    this.classList.add('open');
                }
            }
        });
    });
    
    // 모바일 사이드바 토글
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.admin-sidebar').classList.toggle('open');
        });
    }
});
```

---

## 6. 테스트 전략

### 6.1 단위 테스트
```javascript
describe('CommonComponents', () => {
    describe('formatDate', () => {
        it('should format ISO date correctly', () => {
            const result = formatDate('2024-12-15T10:30:00');
            expect(result).toContain('2024');
            expect(result).toContain('12');
            expect(result).toContain('15');
        });
        
        it('should return dash for empty input', () => {
            expect(formatDate(null)).toBe('-');
            expect(formatDate('')).toBe('-');
        });
    });
    
    describe('formatNumber', () => {
        it('should add comma separators', () => {
            expect(formatNumber(1234567)).toBe('1,234,567');
        });
        
        it('should return dash for null/undefined', () => {
            expect(formatNumber(null)).toBe('-');
            expect(formatNumber(undefined)).toBe('-');
        });
    });
    
    describe('maskPhoneNumber', () => {
        it('should mask middle 4 digits', () => {
            expect(maskPhoneNumber('01012345678')).toBe('010-****-5678');
        });
    });
    
    describe('maskEmail', () => {
        it('should mask local part', () => {
            expect(maskEmail('example@domain.com')).toBe('ex***@domain.com');
        });
    });
});
```

### 6.2 통합 테스트
```javascript
describe('UI Components Integration', () => {
    it('should open and close modal', () => {
        // 모달 열기
        openModal('testModal');
        expect(document.getElementById('testModal').classList.contains('show')).toBe(true);
        
        // 모달 닫기
        closeModal('testModal');
        expect(document.getElementById('testModal').classList.contains('show')).toBe(false);
    });
    
    it('should create pagination correctly', () => {
        createPagination(5, 10, 'testPagination');
        
        const container = document.getElementById('testPagination');
        expect(container.querySelectorAll('.pagination-btn').length).toBeGreaterThan(0);
        expect(container.querySelector('.pagination-btn.active').textContent).toBe('5');
    });
});
```

---

## 7. 사용 가이드

### 7.1 새 페이지 생성 시 기본 구조
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지 제목 - 메시징 서비스</title>
    <link rel="stylesheet" href="css/admin-common.css">
</head>
<body>
    <div class="admin-container">
        <!-- 사이드바 (공통 구조 복사) -->
        <aside class="admin-sidebar">
            <!-- ... -->
        </aside>
        
        <!-- 메인 컨텐츠 -->
        <main class="admin-main">
            <!-- 헤더 -->
            <header class="admin-header">
                <div class="header-left">
                    <h2 class="page-title">페이지 제목</h2>
                </div>
                <div class="header-right">
                    <!-- 사용자 정보 -->
                </div>
            </header>
            
            <!-- 컨텐츠 -->
            <div class="admin-content">
                <!-- 페이지 내용 -->
            </div>
        </main>
    </div>
    
    <script src="js/admin-common.js"></script>
    <script>
        // 페이지별 스크립트
    </script>
</body>
</html>
```

### 7.2 모달 사용 예시
```html
<!-- 모달 HTML -->
<div class="modal" id="exampleModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">모달 제목</h3>
            <button class="modal-close" onclick="closeModal('exampleModal')">&times;</button>
        </div>
        <div class="modal-body">
            <!-- 모달 내용 -->
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('exampleModal')">취소</button>
            <button class="btn btn-primary" onclick="handleSubmit()">확인</button>
        </div>
    </div>
</div>

<script>
// 모달 열기
document.getElementById('openBtn').addEventListener('click', () => {
    openModal('exampleModal');
});
</script>
```

---

## 8. 버전 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2024-12-15 | 초기 문서 작성 | - |

