# Price Eye 어드민 페이지 계획

## 현재 프로젝트 상태

- **프레임워크**: SvelteKit 2 + Svelte 5 + Tailwind CSS v4 + Paraglide i18n
- **인증**: JWT 쿠키 기반 (access_token, refresh_token, user_id)
- **API 패턴**: BFF 프록시 (브라우저 → SvelteKit → 백엔드 :8080)
- **백엔드**: Go 기반 별도 서비스 (gugu-api), Supabase/PostgreSQL
- **플랜**: Free (5개 추적, 14일) / Pro (50개, 무제한)

## 어드민에 필요한 기능

### 1. 대시보드 (메인)

- 전체 사용자 수 / 오늘 가입자 수
- 전체 추적 상품 수 / 활성 추적 수
- Free vs Pro 사용자 비율
- 가격 수집 성공/실패율 (최근 24h)

### 2. 사용자 관리

- 사용자 목록 (검색, 필터, 페이지네이션)
- 사용자 상세: 이메일, 가입일, 플랜, 추적 상품 수
- 플랜 변경 (Free ↔ Pro)
- 계정 비활성화 / 삭제
- 이메일 인증 상태 확인

### 3. 추적 상품 관리

- 전체 추적 상품 목록 (마켓별 필터)
- 상품별 가격 히스토리 조회
- 수동 가격 갱신 트리거
- 문제 상품 (수집 실패) 목록

### 4. 마켓 / 크롤링 모니터링

- 마켓별 상태 (AliExpress, Coupang 등)
- 크롤링 성공/실패 로그
- 평균 수집 시간

### 5. 시스템 설정

- 가격 수집 주기 설정
- Free/Pro 플랜 제한 값 조정
- 공지사항 관리

## 필요한 백엔드 API (아직 없는 것)

```
GET    /v1/admin/dashboard          -- 대시보드 통계
GET    /v1/admin/users              -- 사용자 목록 (페이지네이션)
GET    /v1/admin/users/:id          -- 사용자 상세
PATCH  /v1/admin/users/:id          -- 사용자 수정 (플랜, 상태)
DELETE /v1/admin/users/:id          -- 사용자 삭제
GET    /v1/admin/tracked-items      -- 전체 추적 상품 목록
GET    /v1/admin/crawl-logs         -- 크롤링 로그
POST   /v1/admin/crawl/trigger      -- 수동 크롤링 트리거
GET    /v1/admin/settings           -- 시스템 설정 조회
PATCH  /v1/admin/settings           -- 시스템 설정 변경
```

## 프론트엔드 라우트 구조 (제안)

```
src/routes/
├── admin/
│   ├── +layout.svelte              -- 어드민 레이아웃 (사이드바, 권한 체크)
│   ├── +layout.server.ts           -- 어드민 권한 검증 (role 확인)
│   ├── +page.svelte                -- 대시보드
│   ├── users/
│   │   ├── +page.svelte            -- 사용자 목록
│   │   └── [id]/+page.svelte       -- 사용자 상세
│   ├── items/
│   │   └── +page.svelte            -- 추적 상품 목록
│   ├── monitoring/
│   │   └── +page.svelte            -- 크롤링 모니터링
│   └── settings/
│       └── +page.svelte            -- 시스템 설정
```

## 결정해야 할 사항

1. **어드민 인증**: 별도 로그인? 기존 사용자에 role 추가? (추천: user 테이블에 `role: 'admin' | 'user'` 추가)
2. **같은 SvelteKit 앱에 포함 vs 별도 프로젝트**: 같은 앱 내 `/admin` 라우트 추천 (BFF 인프라 재활용)
3. **어드민 API 인증**: 기존 JWT + role 체크 미들웨어
4. **차트 라이브러리**: 기존 PriceChart에서 쓰는 라이브러리 재활용 가능

## 기존 코드 재활용 가능한 부분

- `src/lib/api/client.ts` — fetch 래퍼 (apiGet, apiPost 등)
- `src/lib/api/config.ts` — API_BASE, COOKIE_OPTS
- `src/hooks.server.ts` — 토큰 갱신 로직
- `src/lib/components/PriceChart.svelte` — 가격 차트
- `src/lib/stores/auth.svelte.ts` — 인증 상태 (role 확장 필요)
- Tailwind CSS 테마 토큰, 기존 UI 패턴 (rounded-3xl 카드, 배지 pill 등)
