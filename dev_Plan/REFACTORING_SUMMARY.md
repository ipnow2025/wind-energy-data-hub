# 폴더 리팩토링 및 최적화 요약

## 완료된 작업

### 1. CSS 파일 통합 ✅
- `styles/globals.css`의 내용을 `app/globals.css`에 통합
- 중복 제거 및 더 나은 색상 스키마 적용
- `styles/globals.css` 삭제

### 2. 상수 파일 생성 ✅
- `lib/constants.ts` 생성
  - `ALL_BOARDS` - 모든 게시판 목록
  - `MAX_FILE_SIZE` - 최대 파일 크기 (4.5MB)
  - `DEFAULT_ADMIN_EMAIL` - 기본 관리자 이메일
  - `EMAILJS_CONFIG` - EmailJS 설정

### 3. 공유 유틸리티 생성 ✅
- `lib/utils/auth.ts` - 인증 관련 유틸리티
  - `getAuthFromStorage()` - localStorage에서 인증 정보 가져오기
  - `getAuthHeaders()` - API 요청용 인증 헤더 생성

- `lib/utils/file-upload.ts` - 파일 업로드 유틸리티
  - `uploadFile()` - 단일 파일 업로드
  - `uploadFiles()` - 다중 파일 업로드
  - `UploadedFile` 타입 정의

- `lib/utils/email.ts` - 이메일 유틸리티
  - `sendCollaborationPostNotification()` - 협업 게시글 알림 전송
  - `getBoardEmail()` - 게시판별 이메일 가져오기

### 4. Hooks 통합 ✅
- `components/ui/use-mobile.tsx` 삭제 (중복)
- `hooks/use-mobile.ts` 유지 (표준 위치)
- `hooks/use-toast.ts`와 `components/ui/use-toast.ts`는 동일하므로 유지

### 5. SQL 스크립트 정리 ✅
- `scripts/migrations/` - 데이터베이스 마이그레이션 스크립트
- `scripts/setup/` - 초기 설정 스크립트
- `scripts/samples/` - 샘플 데이터 스크립트
- `scripts/README.md` - 스크립트 구조 문서화

### 6. 코드 중복 제거 ✅
- `app/collaboration/new/page.tsx` 리팩토링
  - 상수 및 유틸리티 사용
  - 파일 업로드 로직 간소화
  - 이메일 전송 로직 간소화

- `app/admin/collaboration/new/page.tsx` 리팩토링
  - 동일한 개선사항 적용

- `app/admin/collaboration/page.tsx` 업데이트
  - 상수 사용

## 개선 효과

1. **코드 재사용성 향상**: 공통 로직을 유틸리티로 추출하여 중복 제거
2. **유지보수성 향상**: 상수와 설정을 중앙에서 관리
3. **가독성 향상**: 복잡한 로직을 간단한 함수 호출로 대체
4. **구조 개선**: 관련 파일들을 논리적으로 그룹화
5. **문서화**: 스크립트 폴더 구조 문서화

## 다음 단계 제안

1. 다른 페이지들도 동일한 패턴으로 리팩토링
2. 타입 정의를 `lib/types/` 폴더로 분리
3. API 라우트 중복 확인 및 통합
4. 테스트 파일 구조 정리

