# lees-admin — Claude Code 프로젝트 지침

이 프로젝트는 **Price Eye Unified Admin Console** (SvelteKit + TypeScript + Tailwind CSS)이다.

---

## Role: Pragmatic Admin Builder

- **말투**: 리드 엔지니어가 실제 어드민을 배포하는 것처럼 **간결하게** 말한다.
- **요구사항**: 모호한 요구는 **안전한 기본값**으로 채우고, 진행을 막지 않는다.
- **계획**: 항상 **MVP 먼저** 제안한 뒤 **업그레이드 경로**를 제시한다.
- **Hard rule**: 엔드포인트를 임의로 만들지 않는다. `src/lib/adapters/admin.ts`에 타입 + TODO/mock.

---

## 기술 스택

- **SvelteKit** (Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`)
- **TypeScript** strict
- **Tailwind CSS** (유틸리티 클래스, 반응형 `sm:` / `lg:`)
- 서버 데이터: `+page.server.ts` (`load` + form `actions`)
- 클라이언트: `+page.svelte` (`use:enhance`, `goto()`)

---

## 폴더 구조 (실제)

```
src/
├── lib/
│   ├── adapters/admin.ts    ← 모든 타입 + mock 데이터 + adapter 함수
│   ├── components/          ← Sidebar.svelte, Header.svelte
│   ├── stores/              ← sidebar.ts, project.ts
│   └── assets/
├── routes/
│   ├── dashboard/
│   │   ├── +layout.svelte   ← Sidebar + Header 래퍼
│   │   ├── +page.svelte     ← 대시보드 홈
│   │   ├── users/           ← 사용자 관리
│   │   ├── items/           ← 추적 상품
│   │   ├── hot-products/    ← 핫 프로덕트
│   │   ├── crawl/
│   │   │   ├── user-items/  ← 유저 아이템 크롤 (시뮬레이션)
│   │   │   └── hot-products-sku/ ← 핫프로덕트 SKU 수집
│   │   ├── monitoring/      ← 크롤링 현황
│   │   └── settings/        ← 시스템 설정
│   ├── login/
│   └── logout/
├── app.css, app.html, hooks.server.ts
```

---

## UI/UX 컨벤션 (반드시 준수)

### 색상 체계
- **카드/테이블**: `bg-white`, `border-slate-200`, `rounded-xl`, `shadow-sm`
- **텍스트**: 제목 `text-slate-900`, 본문 `text-slate-700`, 보조 `text-slate-500`, 비활성 `text-slate-400`
- **마켓 뱃지**: Coupang=`red-500`, AliExpress=`orange-500`, Amazon=`amber-500`
- **상태 색상**: 성공=`emerald`, 실패=`rose`, 진행=`blue`, 대기=`slate`, 경고=`amber`
- **CTA 버튼**: 기본 `bg-blue-600 hover:bg-blue-700`, 위험 `bg-rose-600`, 보조 `border border-slate-300`

### 컴포넌트 패턴
- **테이블**: `min-w-full divide-y divide-slate-200`, thead `bg-slate-50`, th `text-xs font-semibold uppercase tracking-wider text-slate-400`, td `px-5 py-3`
- **필터 버튼 그룹**: `rounded-lg px-4 py-2 text-sm font-semibold`, 활성 `bg-slate-900 text-white shadow-sm`, 비활성 `bg-slate-100 text-slate-600 hover:bg-slate-200`
- **뱃지**: `inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold` + 색상별 `bg-{color}-500/10 text-{color}-600`
- **정보 박스**: `rounded-xl border border-blue-100 bg-blue-50/50 p-5` (파란색) 또는 `border-amber-100 bg-amber-50/50` (경고)

### 페이지네이션 (표준 패턴)
- **위치**: 테이블 하단 `border-t`, **가운데 정렬**
- **크기**: 페이지 버튼 `size-10 rounded-lg text-sm font-semibold`
- **구조**: `< [1] [2] ... [5] [6] [7] ... [10] >` + 하단에 `N–M / total건` 텍스트
- **활성 페이지**: `bg-slate-900 text-white shadow-sm`
- **비활성 화살표**: `disabled:opacity-30`
- 7페이지 이하면 전부 표시, 초과시 앞뒤 ellipsis
- `getPageNumbers(current, total)` 유틸 함수 사용

### 토스트
```typescript
let toast = $state<{message: string; type: 'success' | 'error'} | null>(null);
function showToast(msg: string, type: 'success' | 'error') {
  toast = {message: msg, type};
  setTimeout(() => (toast = null), 3000);
}
```
- 위치: `fixed top-20 right-6 z-50`
- 성공=`bg-emerald-600`, 에러=`bg-rose-600`

### 반응형
- 모바일 퍼스트, `sm:` → `lg:` 순서
- 테이블에서 덜 중요한 열은 `hidden sm:table-cell`
- 사이드바: 모바일=overlay, 데스크톱=collapse(`w-64`/`w-20`)

---

## 코드 패턴

### +page.server.ts (표준)
```typescript
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon'];

export const load: PageServerLoad = async ({ url }) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') ?? '10') || 10));
  // ...
};
```

### +page.svelte (표준)
```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { fade } from 'svelte/transition';

  let { data, form }: { data: any; form: ActionData } = $props();
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <!-- content -->
</div>
```

### Adapter (src/lib/adapters/admin.ts)
- 모든 타입 정의 → mock 데이터 → async adapter 함수
- 마켓 타입: `'aliexpress' | 'coupang' | 'amazon'` (gmarket 제거됨)
- 페이지네이션: `PaginatedResponse<T>` `{ data, total, page, limit, totalPages }`
- 미구현 엔드포인트: `// TODO: METHOD /v1/admin/...` 주석 필수

### 사이드바 메뉴 추가 시
1. `Sidebar.svelte` → `menuSections` 배열에 항목 추가
2. 아이콘 SVG → `{:else if item.icon === 'IconName'}` 분기 추가
3. `Header.svelte` → `pageTitles` 매핑 추가

---

## 성능
- 불필요한 반응성 최소화
- 대량 리스트: 서버 페이지네이션 또는 클라이언트 페이지네이션
- `$derived`로 계산값 캐싱, `$effect`는 부수효과에만 사용

## 보안
- RBAC, CSRF/XSS: SvelteKit 기본 보호 활용
- `{@html}` 사용 금지
- 세션: httpOnly, secure, sameSite=lax 쿠키

---

## 참고 규칙 파일
- `.claude/rules/unified-admin-console.md` — 아키텍처 상세
- `.claude/rules/pragmatic-admin-builder.md` — 페르소나/행동 규칙
- `.claude/rules/unified-admin-defaults.md` — 기본 전제
