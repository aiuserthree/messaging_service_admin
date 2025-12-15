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
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">사용자 관리</div>
                    <a href="user-list.html" class="menu-item ${activeMenu === 'user-list' ? 'active' : ''}">
                        <span>회원 관리</span>
                    </a>
                    <a href="user-permission.html" class="menu-item ${activeMenu === 'user-permission' ? 'active' : ''}">
                        <span>권한 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">발신번호 관리</div>
                    <a href="caller-number-pending.html" class="menu-item ${activeMenu === 'caller-number-pending' ? 'active' : ''}">
                        <span>승인 대기</span>
                    </a>
                    <a href="caller-number-approved.html" class="menu-item ${activeMenu === 'caller-number-approved' ? 'active' : ''}">
                        <span>승인 완료</span>
                    </a>
                    <a href="caller-number-list.html" class="menu-item ${activeMenu === 'caller-number-list' ? 'active' : ''}">
                        <span>발신번호 목록</span>
                    </a>
                    <a href="kakao-profile-list.html" class="menu-item ${activeMenu === 'kakao-profile-list' ? 'active' : ''}">
                        <span>발신프로필 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">템플릿 관리</div>
                    <a href="template-alimtalk-review.html" class="menu-item ${activeMenu === 'template-alimtalk-review' ? 'active' : ''}">
                        <span>알림톡 템플릿 검수</span>
                    </a>
                    <a href="../template-alimtalk.html" class="menu-item ${activeMenu === 'template-alimtalk' ? 'active' : ''}">
                        <span>알림톡 템플릿</span>
                    </a>
                    <a href="../template-brandtalk.html" class="menu-item ${activeMenu === 'template-brandtalk' ? 'active' : ''}">
                        <span>브랜드톡 템플릿</span>
                    </a>
                    <a href="../template-message.html" class="menu-item ${activeMenu === 'template-message' ? 'active' : ''}">
                        <span>일반문자 템플릿</span>
                    </a>
                    <a href="../template-message-ad.html" class="menu-item ${activeMenu === 'template-message-ad' ? 'active' : ''}">
                        <span>광고문자 템플릿</span>
                    </a>
                    <a href="../template-message-election.html" class="menu-item ${activeMenu === 'template-message-election' ? 'active' : ''}">
                        <span>공직선거문자 템플릿</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">발송 관리</div>
                    <a href="../message-send-general.html" class="menu-item ${activeMenu === 'message-send-general' ? 'active' : ''}">
                        <span>일반문자 발송</span>
                    </a>
                    <a href="../message-send-ad.html" class="menu-item ${activeMenu === 'message-send-ad' ? 'active' : ''}">
                        <span>광고문자 발송</span>
                    </a>
                    <a href="../message-send-election.html" class="menu-item has-submenu ${activeMenu === 'message-send-election' || activeMenu === 'election-addressbook' ? 'active' : ''}">
                        <span>선거문자</span>
                    </a>
                    <div class="submenu ${activeMenu === 'message-send-election' || activeMenu === 'election-addressbook' ? 'open' : ''}">
                        <a href="../message-send-election.html" class="submenu-item ${activeMenu === 'message-send-election' ? 'active' : ''}">
                            <span>선거문자 발송</span>
                        </a>
                        <a href="../election-addressbook.html" class="submenu-item ${activeMenu === 'election-addressbook' ? 'active' : ''}">
                            <span>선거문자 주소록</span>
                        </a>
                    </div>
                    <a href="../kakao-send-alimtalk.html" class="menu-item ${activeMenu === 'kakao-send-alimtalk' ? 'active' : ''}">
                        <span>알림톡 발송</span>
                    </a>
                    <a href="../kakao-send-brandtalk.html" class="menu-item ${activeMenu === 'kakao-send-brandtalk' ? 'active' : ''}">
                        <span>브랜드톡 발송</span>
                    </a>
                    <a href="send-history.html" class="menu-item ${activeMenu === 'send-history' ? 'active' : ''}">
                        <span>발송 내역 모니터링</span>
                    </a>
                    <a href="send-statistics.html" class="menu-item ${activeMenu === 'send-statistics' ? 'active' : ''}">
                        <span>발송 통계</span>
                    </a>
                    <a href="send-policy.html" class="menu-item ${activeMenu === 'send-policy' ? 'active' : ''}">
                        <span>발송 정책 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">주소록 관리</div>
                    <a href="../addressbook.html" class="menu-item ${activeMenu === 'addressbook' ? 'active' : ''}">
                        <span>주소록 관리</span>
                    </a>
                    <a href="../addressbook-reject.html" class="menu-item ${activeMenu === 'addressbook-reject' ? 'active' : ''}">
                        <span>수신거부 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">결제 관리</div>
                    <a href="payment-charge-list.html" class="menu-item ${activeMenu === 'payment-charge-list' ? 'active' : ''}">
                        <span>충전 내역</span>
                    </a>
                    <a href="payment-deposit.html" class="menu-item ${activeMenu === 'payment-deposit' ? 'active' : ''}">
                        <span>입금 확인</span>
                    </a>
                    <a href="payment-pricing.html" class="menu-item ${activeMenu === 'payment-pricing' ? 'active' : ''}">
                        <span>요금 설정</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">기타 관리</div>
                    <a href="inquiry-list.html" class="menu-item ${activeMenu === 'inquiry-list' ? 'active' : ''}">
                        <span>문의 관리</span>
                    </a>
                    <a href="notice-list.html" class="menu-item ${activeMenu === 'notice-list' ? 'active' : ''}">
                        <span>공지사항 관리</span>
                    </a>
                </div>
                
                <div class="menu-section">
                    <div class="menu-section-title">시스템</div>
                    <a href="system-settings.html" class="menu-item ${activeMenu === 'system-settings' ? 'active' : ''}">
                        <span>시스템 설정</span>
                    </a>
                    <a href="statistics-report.html" class="menu-item ${activeMenu === 'statistics-report' ? 'active' : ''}">
                        <span>통계 및 리포트</span>
                    </a>
                    <a href="security-audit.html" class="menu-item ${activeMenu === 'security-audit' ? 'active' : ''}">
                        <span>보안 및 감사</span>
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

