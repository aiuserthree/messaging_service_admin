# 어드민 사이트

메시징 서비스 플랫폼의 관리자 사이트입니다.

## 구조

```
admin/
├── css/
│   └── admin-common.css      # 공통 스타일
├── js/
│   └── admin-common.js       # 공통 JavaScript
├── index.html                 # 대시보드
├── user-list.html            # 회원 관리
├── caller-number-pending.html # 발신번호 승인 대기
├── template-alimtalk-review.html # 알림톡 템플릿 검수
├── send-history.html         # 발송 내역 모니터링
├── payment-charge-list.html  # 충전 내역
├── inquiry-list.html         # 문의 관리
└── README.md                 # 이 파일
```

## 주요 기능

### 1. 대시보드 (index.html)
- 주요 지표 카드 (발송 건수, 충전 금액, 신규 가입자 등)
- 최근 발송 내역
- 승인 대기 목록

### 2. 사용자 관리
- **회원 관리 (user-list.html)**: 전체 회원 목록 조회 및 관리
  - 회원 검색 및 필터링
  - 회원 상세 정보 조회 (기본 정보, 기업 정보, 계정 정보, 활동 정보, 메모)
  - 계정 상태 관리 (정지/해제, 삭제)
  - 잔액 조정
  - 비밀번호 초기화

### 3. 발신번호 관리
- **승인 대기 (caller-number-pending.html)**: 발신번호 등록 신청 검토
  - 신청 정보 확인
  - 서류 검토
  - 승인/반려/보완 요청 처리
  - 일괄 처리 기능

### 4. 템플릿 관리
- **알림톡 템플릿 검수 (template-alimtalk-review.html)**: 알림톡 템플릿 검수 처리
  - 검수 대기/검수 중/승인 완료/반려 탭
  - 템플릿 상세 정보 확인
  - 카카오 검수 요청
  - 승인/반려 처리

### 5. 발송 관리
- **발송 내역 모니터링 (send-history.html)**: 전체 발송 내역 조회 및 모니터링
  - 실시간 발송 현황
  - 발송 상세 내역 조회
  - 발송 취소 (진행 중인 경우)
  - 재발송 처리
  - 엑셀 다운로드

### 6. 결제 관리
- **충전 내역 (payment-charge-list.html)**: 전체 회원의 충전 내역 조회
  - 충전 내역 검색 및 필터링
  - 입금 확인 처리 (무통장입금)
  - 결제 취소 처리
  - 충전 상세 정보 조회

### 7. 문의 관리
- **문의 관리 (inquiry-list.html)**: 사용자 문의 처리
  - 문의 목록 조회
  - 문의 상세 및 답변 작성
  - 담당자 배정
  - 처리 완료 처리

## 디자인 특징

- **다크 사이드바**: 관리자 사이트에 적합한 다크 테마 사이드바
- **반응형 디자인**: 모바일 환경 지원
- **모달 기반 상세 보기**: 주요 정보는 모달로 표시
- **탭 구조**: 관련 정보를 탭으로 구분하여 표시
- **통계 카드**: 주요 지표를 카드 형태로 시각화
- **상태 배지**: 다양한 상태를 색상 배지로 표시

## 사용 기술

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript (React 없이 순수 JavaScript 사용)

## 브라우저 지원

- Chrome (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)
- Firefox (최신 2개 버전)

## 주요 컴포넌트

### 공통 컴포넌트
- 사이드바 메뉴
- 헤더 (페이지 제목, 사용자 정보)
- 검색 및 필터 바
- 테이블
- 모달
- 페이지네이션
- 통계 카드
- 탭

### 공통 함수 (admin-common.js)
- `openModal(modalId)`: 모달 열기
- `closeModal(modalId)`: 모달 닫기
- `confirmAction(message, callback)`: 확인 팝업
- `formatDate(dateString)`: 날짜 포맷팅
- `formatNumber(num)`: 숫자 포맷팅
- `maskPhoneNumber(phone)`: 전화번호 마스킹
- `maskEmail(email)`: 이메일 마스킹
- `createPagination(currentPage, totalPages, containerId)`: 페이지네이션 생성
- `showToast(message, type)`: 토스트 메시지 표시

## 최근 업데이트 (2024-12-19)

- **선거문자 발송 기능 변경사항**:
  - 수신번호 영역에서 변수 1, 2, 3 제거 (이름, 전화번호만 입력)
  - 수신번호 입력 필드에 숫자만 입력 가능하도록 제한
  - 선거운동정보 입력 필드 추가 (선택사항, 최대 20자/40바이트)
  - 선거문자 주소록: 이름과 전화번호 마스킹 처리
- **일반문자/광고문자 발송**:
  - 수신번호 테이블의 전화번호 입력 필드에 숫자만 입력 가능하도록 제한

## 향후 개발 예정

- 발송 통계 대시보드
- 발송 정책 관리
- 요금 설정
- 입금 확인 요청 처리
- 수신거부 관리
- 공지사항 관리
- 시스템 설정
- 통계 및 리포트
- 보안 및 감사

## 참고 문서

- [어드민 사이트 정책서](../docs/어드민_사이트_정책서_초안.md)
- [프로젝트 명세서](../docs/project-specification.md)
- [기능 정의서](../specs/)

