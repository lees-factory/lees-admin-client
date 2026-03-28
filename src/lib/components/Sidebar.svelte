<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar';
	import { page } from '$app/stores';

	const menuSections = [
		{
			title: '홈',
			items: [{ name: '대시보드', href: '/dashboard', icon: 'ChartPie' }]
		},
		{
			title: '관리',
			items: [
				{ name: '사용자 관리', href: '/dashboard/users', icon: 'Users' },
				{ name: '추적 상품', href: '/dashboard/items', icon: 'ShoppingBag' },
				{ name: '핫 프로덕트', href: '/dashboard/hot-products', icon: 'Fire' }
			]
		},
		{
			title: '크롤',
			items: [
				{ name: '핫프로덕트 수집', href: '/dashboard/crawl/hot-products-fetch', icon: 'Download' },
				{ name: '핫프로덕트 크롤', href: '/dashboard/crawl/hot-products-sku', icon: 'Bolt' },
				{ name: '유저 아이템 크롤', href: '/dashboard/crawl/user-items', icon: 'Play' }
			]
		},
		{
			title: '모니터링',
			items: [
				{ name: '크롤링 현황', href: '/dashboard/monitoring', icon: 'Server' },
				{ name: '시스템 설정', href: '/dashboard/settings', icon: 'Cog' }
			]
		}
	];

	function isCurrent(href: string) {
		if (href === '/dashboard') return $page.url.pathname === href;
		return $page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile Overlay -->
{#if $sidebar.isMobileOpen}
	<div
		class="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity lg:hidden"
		onclick={() => sidebar.closeMobile()}
		onkeydown={(e) => e.key === 'Escape' && sidebar.closeMobile()}
		role="presentation"
	></div>
{/if}

<!-- Sidebar Container -->
<aside
	class="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl transition-all duration-300 ease-in-out lg:shadow-none {$sidebar.isMobileOpen
		? 'translate-x-0'
		: '-translate-x-full'} lg:translate-x-0 {$sidebar.isOpen ? 'w-64' : 'w-20'}"
>
	<!-- Header: Logo & Toggle -->
	<div
		class="relative flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/30 px-4"
	>
		<div
			class="flex items-center overflow-hidden transition-all duration-300 {$sidebar.isOpen
				? 'w-auto opacity-100'
				: 'w-0 opacity-0 lg:w-auto lg:opacity-100'}"
		>
			{#if $sidebar.isOpen}
				<span class="text-lg font-bold tracking-tight whitespace-nowrap text-blue-400">Price Eye</span>
			{:else}
				<span class="mx-auto text-xl font-bold text-blue-500">P</span>
			{/if}
		</div>

		<button
			onclick={() => sidebar.toggle()}
			class="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-slate-600 focus:outline-none lg:flex"
			aria-label={$sidebar.isOpen ? '사이드바 접기' : '사이드바 펼치기'}
		>
			{#if $sidebar.isOpen}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			{/if}
		</button>

		<button
			onclick={() => sidebar.closeMobile()}
			class="p-2 text-slate-400 hover:text-white lg:hidden"
			aria-label="사이드바 닫기"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Scrollable Nav Area -->
	<nav class="flex flex-1 flex-col space-y-6 overflow-x-hidden overflow-y-auto px-3 py-4">
		{#each menuSections as section}
			<div class="space-y-1">
				{#if $sidebar.isOpen}
					<h3 class="mb-2 px-2 text-xs font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase">
						{section.title}
					</h3>
				{:else}
					<div class="mb-2 h-4"></div>
				{/if}

				{#each section.items as item}
					<a
						href={item.href}
						class="group relative flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        {isCurrent(item.href)
							? 'bg-blue-600/10 text-blue-400'
							: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                        {$sidebar.isOpen ? '' : 'justify-center'}"
						title={!$sidebar.isOpen ? item.name : ''}
					>
						<span class="shrink-0 transition-colors duration-200 {isCurrent(item.href) ? 'text-blue-400' : 'group-hover:text-white'}" aria-hidden="true">
							{#if item.icon === 'ChartPie'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
							{:else if item.icon === 'Users'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
							{:else if item.icon === 'ShoppingBag'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
							{:else if item.icon === 'Download'}
							<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
						{:else if item.icon === 'Play'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
							{:else if item.icon === 'Bolt'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
							{:else if item.icon === 'Server'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01" /></svg>
							{:else if item.icon === 'Fire'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
							{:else if item.icon === 'Cog'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
							{:else}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
							{/if}
						</span>

						<span
							class="ml-3 block whitespace-nowrap transition-all duration-300
                            {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'} truncate font-medium tracking-wide"
						>
							{item.name}
						</span>

						{#if isCurrent(item.href) && $sidebar.isOpen}
							<div class="absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-l-full bg-blue-500"></div>
						{/if}
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<!-- Footer: User Profile -->
	<div class="border-t border-slate-800 bg-slate-950/30 p-4">
		<div class="flex items-center {$sidebar.isOpen ? '' : 'justify-center'}">
			<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-bold text-slate-300 shadow-sm">
				SU
			</div>

			<div class="ml-3 overflow-hidden transition-all duration-300 {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}">
				<p class="truncate text-sm font-semibold text-white">Super User</p>
				<p class="truncate text-xs text-slate-500">super@admin.com</p>
			</div>

		</div>
	</div>
</aside>
