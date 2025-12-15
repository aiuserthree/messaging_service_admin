// 어드민 사이트 공통 JavaScript

// 사이드바 메뉴 토글
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 스크롤 위치 저장 및 복원
    const sidebar = document.querySelector('.admin-sidebar');
    let sidebarScrollPosition = 0;
    
    // 사이드바 스크롤 위치 저장
    if (sidebar) {
        sidebar.addEventListener('scroll', function() {
            sidebarScrollPosition = sidebar.scrollTop;
        });
        
        // 페이지 로드 시 저장된 스크롤 위치 복원
        const savedScroll = sessionStorage.getItem('sidebarScrollPosition');
        if (savedScroll) {
            sidebar.scrollTop = parseInt(savedScroll, 10);
        }
    }
    
    // 메뉴 링크 클릭 시 스크롤 위치 저장
    const menuLinks = document.querySelectorAll('.sidebar-menu a.menu-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 현재 페이지와 같은 링크인 경우에만 스크롤 위치 저장
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#')) {
                // 사이드바 스크롤 위치 저장
                if (sidebar) {
                    sessionStorage.setItem('sidebarScrollPosition', sidebar.scrollTop.toString());
                }
            }
        });
    });
    
    // 서브메뉴 토글
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                const isOpen = submenu.classList.contains('open');
                // 다른 서브메뉴 닫기
                document.querySelectorAll('.submenu').forEach(sub => {
                    sub.classList.remove('open');
                });
                document.querySelectorAll('.menu-item.has-submenu').forEach(menu => {
                    menu.classList.remove('open');
                });
                // 현재 서브메뉴 토글
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

// 모달 열기/닫기
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

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

// 확인 팝업
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 날짜 포맷팅
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

// 숫자 포맷팅
function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('ko-KR');
}

// 전화번호 마스킹
function maskPhoneNumber(phone) {
    if (!phone) return '-';
    if (phone.length === 11) {
        return phone.substring(0, 3) + '-****-' + phone.substring(7);
    }
    return phone;
}

// 이메일 마스킹
function maskEmail(email) {
    if (!email) return '-';
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
        return email;
    }
    const masked = local.substring(0, 2) + '***';
    return masked + '@' + domain;
}

// 페이지네이션 생성
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

function goToPage(page) {
    // 페이지 이동 로직 (각 페이지에서 구현)
    console.log('Go to page:', page);
}

// 테이블 정렬
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

// 로딩 표시
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div style="text-align: center; padding: 40px;">로딩 중...</div>';
    }
}

// 토스트 메시지
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
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

