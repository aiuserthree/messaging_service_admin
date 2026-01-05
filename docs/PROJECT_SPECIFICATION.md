# 톡벨 관리자 시스템 프로젝트 명세서

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
| 항목 | 내용 |
|------|------|
| **프로젝트명** | Tokbell Admin (톡벨 관리자 시스템) |
| **버전** | v1.0.0 |
| **배포 URL** | https://admin-weld-ten.vercel.app |
| **개발 환경** | HTML5, CSS3, JavaScript (Vanilla) |
| **호스팅** | Vercel |

### 1.2 프로젝트 목적
톡벨 메시징 서비스의 운영 관리를 위한 관리자 전용 웹 시스템으로, 회원 관리, 발송 모니터링, 결제/정산, 고객지원, 보안 감사 등 서비스 운영에 필요한 모든 백오피스 기능을 제공합니다.

### 1.3 주요 사용자
| 사용자 유형 | 역할 | 주요 업무 |
|------------|------|----------|
| **최고 관리자** | 시스템 전체 관리 | 모든 기능 접근, 관리자 계정 관리 |
| **운영 관리자** | 일반 운영 업무 | 회원 관리, 발송 모니터링, 고객지원 |
| **정산 관리자** | 결제/정산 업무 | 결제 관리, 환불 처리, 세금계산서 발급 |
| **고객지원 관리자** | CS 업무 | 문의 응대, 공지사항/FAQ 관리 |

---

## 2. 시스템 아키텍처

### 2.1 기술 스택
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Client)                     │
├─────────────────────────────────────────────────────────┤
│  HTML5          │  CSS3           │  JavaScript (ES6+)  │
│  - Semantic     │  - CSS Variables│  - Vanilla JS       │
│  - Accessible   │  - Flexbox/Grid │  - Mock Data        │
│                 │  - Responsive   │  - DOM Manipulation │
├─────────────────────────────────────────────────────────┤
│                    Deployment                            │
├─────────────────────────────────────────────────────────┤
│                     Vercel                               │
│            (Static Site Hosting + CDN)                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 파일 구조
```
admin/
├── index.html                    # 대시보드 (메인)
├── css/
│   └── admin-common.css          # 공통 스타일시트
├── js/
│   ├── admin-common.js           # 공통 JavaScript
│   └── sidebar.js                # 사이드바 메뉴 생성
├── img/
│   └── admin/                    # 관리자 이미지 리소스
├── docs/
│   ├── PROJECT_SPECIFICATION.md  # 프로젝트 명세서
│   ├── DEVELOPMENT_DESIGN.md     # 상세개발설계서
│   └── 운영정책서_*.md            # 운영 정책 문서
├── favicon.ico                   # 파비콘
├── favicon.svg                   # SVG 파비콘
├── vercel.json                   # Vercel 배포 설정
└── [기능별 HTML 파일들]
```

---

## 3. 메뉴 구조 및 기능 목록

### 3.1 메인
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 대시보드 | `index.html` | 주요 KPI 통계, 승인 대기 목록, 발송 현황 |

### 3.2 발송관리
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 전체 발송 내역 | `send-list.html` | 전체 메시지 발송 이력 조회 |
| 대량 발송 승인 | `send-bulk-approval.html` | 대량 발송 요청 승인/반려 처리 |
| 발송 정책 관리 | `send-policy.html` | 발송 제한, 야간 금지 등 정책 설정 |

### 3.3 회원 관리
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 회원 목록 | `member-list.html` | 전체 회원 목록 조회 및 관리 |
| 회원 가입 관리 | `member-approval.html` | 신규 회원가입 승인/반려 (서류 검토) |
| 회원 전환 관리 | `member-conversion.html` | 개인→사업자 전환 요청 처리 |
| 회원 등급 관리 | `member-grade.html` | 회원 등급 설정 및 관리 |
| 휴면 회원 관리 | `member-dormant.html` | 휴면 회원 조회 및 처리 |
| 회원 정보 관리 | `member-edit.html` | 회원 정보 수정 |
| 서류 목록 조회 | `member-document-list.html` | 제출 서류 전체 조회 |

### 3.4 발신번호 관리
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 발신번호 인증 | `caller-number-pending.html` | 발신번호 등록 요청 승인/반려 |
| 카카오톡 발신 프로필 | `kakao-profile-list.html` | 카카오 비즈니스 채널 관리 |

### 3.5 결제 및 정산
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 결제 관리 | `payment-list.html` | 결제 내역 조회 및 관리 |
| 정산 관리 | `settlement-monthly.html` | 월별 정산 처리 |
| 환불 관리 | `refund-list.html` | 환불 요청 처리 (조건 검증 포함) |
| 세금계산서 발급 | `tax-invoice.html` | 세금계산서 발급 신청 처리 |

### 3.6 고객 지원
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 견적 문의 | `consultation-list.html` | 견적 상담 요청 관리 |
| 문의 관리 | `inquiry-list.html` | 1:1 문의 답변 처리 |
| 공지사항 | `notice-list.html` | 공지사항 등록/수정 |
| FAQ 관리 | `faq-list.html` | FAQ 등록/수정 |

### 3.7 스팸·제재 관리
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 스팸 신고 내역 | `spam-list.html` | 스팸 신고 접수 및 처리 |
| 스팸 필터링 단어 | `spam-filter.html` | 금지어 등록/관리 |
| 계정 제재 관리 | `sanction-manage.html` | 위반 회원 제재 처리 |

### 3.8 시스템 설정
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 환경 설정 | `system-settings.html` | 시스템 환경 설정 |
| 프로모션 관리 | `promotion-manage.html` | 프로모션 목록 관리 |
| 프로모션 등록/수정 | `promotion-edit.html` | 프로모션 등록 (3곳 이미지) |
| 선거문자 관리 | `election-manage.html` | 선거 회원/발송 관리 |
| API 관리 | `api-key.html` | API 키 발급/관리 |
| 코드 관리 | `code-manage.html` | 시스템 코드 관리 |

### 3.9 보안 및 감사
| 메뉴 | 파일명 | 설명 |
|------|--------|------|
| 관리자 접근 로그 | `access-log-admin.html` | 관리자 로그인/작업 기록 |
| 회원 접근 로그 | `access-log-member.html` | 회원 접속 기록 |
| 작업 로그 | `work-log.html` | 시스템 작업 로그 |
| 보안 정책 | `security-policy.html` | IP 접근 제어, 보안 설정 |

---

## 4. 화면 구성

### 4.1 레이아웃 구조
```
┌─────────────────────────────────────────────────────────────┐
│                     admin-container                          │
├─────────────┬───────────────────────────────────────────────┤
│             │              admin-header                      │
│             ├───────────────────────────────────────────────┤
│   sidebar   │                                                │
│   (260px)   │              admin-content                     │
│             │                                                │
│             │                                                │
│             │                                                │
└─────────────┴───────────────────────────────────────────────┘
```

### 4.2 공통 UI 컴포넌트
| 컴포넌트 | 설명 | 사용 예시 |
|----------|------|----------|
| `.card` | 카드 컨테이너 | 콘텐츠 그룹화 |
| `.btn` | 버튼 | primary, secondary, danger, outline |
| `.badge` | 상태 배지 | success, warning, danger, info |
| `.table-container` | 테이블 | 목록 데이터 표시 |
| `.modal` | 모달 | 상세보기, 등록/수정 |
| `.form-control` | 입력 필드 | 텍스트, 셀렉트, 날짜 |
| `.stat-card` | 통계 카드 | 대시보드 KPI |
| `.tabs` | 탭 메뉴 | 콘텐츠 구분 |
| `.pagination` | 페이지네이션 | 목록 페이징 |

---

## 5. 주요 기능 상세

### 5.1 회원 가입 승인 (member-approval.html)
운영정책서 1.2 반영
- 회원 유형별 서류 검토 (개인/사업자)
- 서류 미리보기 및 다운로드
- 서류 발급일자 3개월 검증
- 승인/반려/보완요청 처리

### 5.2 발신번호 인증 (caller-number-pending.html)
운영정책서 2.1~2.3 반영
- 발신번호 소유권 검증
- 통신서비스이용증명원 확인
- 위임 관계 서류 검토 (타사 명의)
- 서류 미리보기/다운로드

### 5.3 환불 관리 (refund-list.html)
운영정책서 7.3 반영
- **환불 가능 조건 검증**
  - 잔여 포인트 1만원 이상
  - 발송 중 메시지 없음
  - 예약 발송 대기 없음
- **환불 유형 자동 판단**
  - 전액환불: 카드결제 + 7일 이내 + 미사용
  - 수수료차감: 7일 경과 또는 사용 시 10%
- 결제수단별 계좌 정보 입력

### 5.4 세금계산서 발급 (tax-invoice.html)
운영정책서 7.4.3 반영
- **상세 확인 정보**
  - 공급받는자 정보 (사업자등록번호, 상호, 대표자 등)
  - 담당자 정보
  - 거래 내역 (일자, 금액, 세액)
- **발급 전 체크리스트**
- 작성일자: 전월 말일
- 발급 기한: 신청일로부터 3일 이내

### 5.5 프로모션 관리 (promotion-manage.html, promotion-edit.html)
운영정책서 9.2 반영
- **노출 위치별 이미지 등록 (3곳)**
  - 메인 (로그인 후): 1200x400px
  - 프론트 (비로그인): 1200x400px
  - 고객센터 이벤트: 400x300px
- HTML 에디터 지원
- 진행/예정/종료 상태 관리

---

## 6. 데이터 구조 (Mock Data)

### 6.1 회원 데이터
```javascript
{
    id: Number,
    memberId: String,        // 아이디
    memberName: String,      // 회원명/상호명
    memberType: 'personal' | 'business',
    email: String,
    phone: String,
    status: 'active' | 'dormant' | 'suspended',
    grade: 'normal' | 'vip',
    registerDate: String,
    lastLoginDate: String
}
```

### 6.2 발송 데이터
```javascript
{
    id: Number,
    sendDate: String,
    memberId: String,
    messageType: 'SMS' | 'LMS' | 'MMS' | 'ALIMTALK' | 'BRANDMESSAGE',
    totalCount: Number,
    successCount: Number,
    failCount: Number,
    status: 'completed' | 'sending' | 'scheduled' | 'failed'
}
```

### 6.3 결제 데이터
```javascript
{
    id: Number,
    paymentDate: String,
    memberId: String,
    memberName: String,
    paymentMethod: 'card' | 'transfer' | 'virtual' | 'dedicated',
    amount: Number,
    status: 'completed' | 'pending' | 'cancelled'
}
```

---

## 7. 보안 및 권한

### 7.1 접근 권한 체계
| 권한 레벨 | 접근 가능 메뉴 |
|----------|---------------|
| 최고 관리자 | 전체 메뉴 접근 |
| 운영 관리자 | 회원/발송/고객지원 |
| 정산 관리자 | 결제/정산/환불/세금계산서 |
| CS 관리자 | 고객지원 메뉴만 |

### 7.2 보안 정책
- IP 접근 제어 (화이트리스트)
- 관리자 접근 로그 기록
- 작업 로그 기록 (데이터 변경 이력)

---

## 8. 배포 정보

### 8.1 Vercel 배포 설정
```json
// vercel.json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/$1" }
    ]
}
```

### 8.2 배포 URL
- **Production**: https://admin-weld-ten.vercel.app
- **Preview**: 자동 생성 (PR별)

---

## 9. 향후 개발 계획

### 9.1 Phase 2 예정 기능
- [ ] 실제 백엔드 API 연동
- [ ] 로그인/인증 시스템
- [ ] 실시간 대시보드 (WebSocket)
- [ ] 엑셀 내보내기 기능
- [ ] 다국어 지원

### 9.2 성능 최적화
- [ ] 이미지 최적화 (WebP 변환)
- [ ] CSS/JS 번들링 및 압축
- [ ] 레이지 로딩 적용

---

## 10. 문서 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-01-05 | - | 최초 작성 |
