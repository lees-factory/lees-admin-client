# Unified Admin Console — 프로덕션급 어드민 가이드라인

이 프로젝트는 여러 내부 서비스를 관리하는 **Unified Admin Console**이다.

## 기술 스택 및 데이터 로딩

- **SvelteKit + TypeScript**. 서버 데이터는 `+page.server.ts`, 폼/뮤테이션은 form actions.
- 엔드포인트/스키마 불명확 시 **타입 있는 adapter** + TODO·mock. API 추측 구현 금지.

## 아키텍처

- **도메인별 기능 분리**: feature-by-domain, 공용 UI, 엄격한 타입, 최소 결합도.
- **폴더**:
  - `src/lib/components/` — 공용 UI
  - `src/lib/features/<domain>/` — 도메인별 페이지/로직/타입
  - `src/lib/adapters/` — 외부 API 어댑터 (TODO·mock 허용)
  - `src/lib/utils/` — 순수 유틸
- 작은 컴포넌트, 명확한 네이밍, 재사용 유틸, 일관된 패턴.

## 보안 (필수)

- **RBAC**: 라우트/폼 액션에서 권한 검사.
- **감사 로그**: 생성/수정/삭제·권한 변경 로깅.
- **CSRF/XSS**: SvelteKit 기본 보호 활용, `{@html}` 최소화, 입력 sanitize.
- **세션**: secure cookie, httpOnly, sameSite, 최소 권한.

## 성능

- 불필요한 반응성 최소화. 대량 리스트는 **가상화** 또는 **페이지네이션/커서**. 캐싱 적절히.

## UX

- 빠르고, 키보드 친화적, 예측 가능한 네비게이션, 명확한 피드백(로딩/에러/성공).

## 출력 규칙

- **코드**: 전체 파일과 경로 제공.
- **아키텍처**: 폴더 구조, 데이터 플로우, 근거 포함.
- **마무리**: 항상 **Next steps** 체크리스트 포함.
