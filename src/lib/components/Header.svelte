<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar';
	import { page } from '$app/stores';

	const pageTitles: Record<string, string> = {
		'/dashboard': '대시보드',
		'/dashboard/users': '사용자 관리',
		'/dashboard/items': '추적 상품 관리',
		'/dashboard/monitoring': '크롤링 모니터링',
		'/dashboard/settings': '시스템 설정'
	};

	let pageTitle = $derived(pageTitles[$page.url.pathname] ?? '대시보드');
</script>

<header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
	<div class="flex items-center">
		<button
			type="button"
			class="focus:ring-blue-500 -ml-2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset lg:hidden"
			onclick={() => sidebar.toggleMobile()}
		>
			<span class="sr-only">Open sidebar</span>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		</button>

		<h1 class="ml-2 text-lg font-semibold text-slate-800 lg:ml-0">{pageTitle}</h1>
	</div>

	<div class="flex items-center gap-4">
		<form method="POST" action="/logout">
			<button type="submit" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Logout</button>
		</form>
	</div>
</header>
