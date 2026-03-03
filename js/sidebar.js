// 공통 사이드바 HTML 생성 함수
function getSidebarHTML(activeMenu) {
    return `
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h1>Tokbell Admin</h1>
                <div class="subtitle">관리자 시스템</div>
            </div>
            <nav class="sidebar-menu">
                <div class="menu-section">
                    <div class="menu-section-title">메인</div>
                    <a href="index.html" class="menu-item ${activeMenu === 'index' ? 'active' : ''}">
                        <span>대시보드</span>
                    </a>
                    <a href="banner-manage.html" class="menu-item ${activeMenu === 'banner-manage' ? 'active' : ''}">
                        <span>배너 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">발송관리</div>
                    <a href="send-list.html" class="menu-item ${activeMenu === 'send-list' ? 'active' : ''}">
                        <span>전체 발송 내역</span>
                    </a>
                    <a href="send-policy.html" class="menu-item ${activeMenu === 'send-policy' ? 'active' : ''}">
                        <span>발송 정책 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">회원 관리</div>
                    <a href="member-list.html" class="menu-item ${activeMenu === 'member-list' ? 'active' : ''}">
                        <span>회원 목록</span>
                    </a>
                    <a href="member-conversion.html" class="menu-item ${activeMenu === 'member-conversion' ? 'active' : ''}">
                        <span>회원 전환 관리</span>
                    </a>
                    <a href="member-grade.html" class="menu-item ${activeMenu === 'member-grade' ? 'active' : ''}">
                        <span>회원 등급 관리</span>
                    </a>
                    <a href="member-dormant.html" class="menu-item ${activeMenu === 'member-dormant' ? 'active' : ''}">
                        <span>휴면 회원 관리</span>
                    </a>
                    <a href="member-edit.html" class="menu-item ${activeMenu === 'member-edit' ? 'active' : ''}">
                        <span>회원 정보 관리</span>
                    </a>
                    <a href="member-document-list.html" class="menu-item ${activeMenu === 'member-document-list' ? 'active' : ''}">
                        <span>서류 목록 조회</span>
                    </a>
                    <a href="member-caller-number.html" class="menu-item ${activeMenu === 'member-caller-number' ? 'active' : ''}">
                        <span>회원 발신번호 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">발신번호 관리</div>
                    <a href="caller-number-pending.html" class="menu-item ${activeMenu === 'caller-number-pending' ? 'active' : ''}">
                        <span>발신번호 인증</span>
                    </a>
                    <a href="kakao-profile-list.html" class="menu-item ${activeMenu === 'kakao-profile-list' ? 'active' : ''}">
                        <span>카카오톡 발신 프로필</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">결제 및 정산</div>
                    <a href="payment-list.html" class="menu-item ${activeMenu === 'payment-list' ? 'active' : ''}">
                        <span>결제 관리</span>
                    </a>
                    <a href="settlement-monthly.html" class="menu-item ${activeMenu === 'settlement-monthly' ? 'active' : ''}">
                        <span>정산 관리(예시)</span>
                    </a>
                    <a href="refund-list.html" class="menu-item ${activeMenu === 'refund-list' ? 'active' : ''}">
                        <span>환불 신청 내역</span>
                    </a>
                    <a href="tax-invoice.html" class="menu-item ${activeMenu === 'tax-invoice' ? 'active' : ''}">
                        <span>세금계산서 자동발행 신청 내역</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">고객 지원</div>
                    <a href="consultation-list.html" class="menu-item ${activeMenu === 'consultation-list' ? 'active' : ''}">
                        <span>견적 문의</span>
                    </a>
                    <a href="inquiry-list.html" class="menu-item ${activeMenu === 'inquiry-list' ? 'active' : ''}">
                        <span>문의 관리</span>
                    </a>
                    <a href="notice-list.html" class="menu-item ${activeMenu === 'notice-list' ? 'active' : ''}">
                        <span>공지사항</span>
                    </a>
                    <a href="faq-list.html" class="menu-item ${activeMenu === 'faq-list' ? 'active' : ''}">
                        <span>FAQ 관리</span>
                    </a>
                    <a href="promotion-manage.html" class="menu-item ${activeMenu === 'promotion-manage' ? 'active' : ''}">
                        <span>프로모션 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">스팸·제재 관리</div>
                    <a href="spam-filter.html" class="menu-item ${activeMenu === 'spam-filter' ? 'active' : ''}">
                        <span>스팸 필터링 단어</span>
                    </a>
                    <a href="sanction-manage.html" class="menu-item ${activeMenu === 'sanction-manage' ? 'active' : ''}">
                        <span>계정 제재 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">시스템 설정</div>
                    <a href="system-settings.html" class="menu-item ${activeMenu === 'system-settings' ? 'active' : ''}">
                        <span>환경 설정</span>
                    </a>
                    <a href="code-manage.html" class="menu-item ${activeMenu === 'code-manage' ? 'active' : ''}">
                        <span>코드 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">관리자 계정</div>
                    <a href="user-list.html" class="menu-item ${activeMenu === 'user-list' ? 'active' : ''}">
                        <span>관리자 계정 관리</span>
                    </a>
                    <a href="permission-group.html" class="menu-item ${activeMenu === 'permission-group' ? 'active' : ''}">
                        <span>권한 그룹 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">보안 및 감사</div>
                    <a href="access-log-admin.html" class="menu-item ${activeMenu === 'access-log-admin' ? 'active' : ''}">
                        <span>관리자 접근 로그</span>
                    </a>
                    <a href="access-log-member.html" class="menu-item ${activeMenu === 'access-log-member' ? 'active' : ''}">
                        <span>회원 접근 로그</span>
                    </a>
                    <a href="work-log.html" class="menu-item ${activeMenu === 'work-log' ? 'active' : ''}">
                        <span>작업 로그</span>
                    </a>
                    <a href="security-policy.html" class="menu-item ${activeMenu === 'security-policy' ? 'active' : ''}">
                        <span>보안 정책</span>
                    </a>
                </div>
            </nav>
        </aside>
    `;
}

// 공통 헤더 HTML 생성 함수
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

