<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar';
	import { currentProject, projects } from '$lib/stores/project';
	import { page } from '$app/stores';

	// 프로젝트별 사이드 메뉴 (project id 기준)
	const menuConfigs: Record<string, { title: string; items: { name: string; href: string; icon: string }[] }[]> = {
		boom: [
			{
				title: '홈',
				items: [{ name: '대시보드', href: '/dashboard', icon: 'ChartPie' }]
			},
			{
				title: '멤버',
				items: [
					{ name: '회원관리', href: '/dashboard/members', icon: 'Users' },
					{ name: '크루관리', href: '/dashboard/crew', icon: 'Users' }
				]
			},
			{
				title: '컨텐츠 관리',
				items: []
			}
		],
		'cloud-between-us': [
			{
				title: '홈',
				items: [{ name: '대시보드', href: '/dashboard', icon: 'ChartPie' }]
			},
			{
				title: '멤버',
				items: [{ name: '회원 관리', href: '/dashboard/members', icon: 'Users' }]
			},
			{
				title: '컨텐츠 관리',
				items: [
					{ name: '질문 관리', href: '/dashboard/questions', icon: 'DocumentText' },
					{ name: '구름 타입 관리', href: '/dashboard/cloud-types', icon: 'Cube' },
					{ name: '결과 관리', href: '/dashboard/results', icon: 'ChartBar' }
				]
			}
		]
	};

	let isProjectMenuOpen = $state(false);

	// 선택된 프로젝트에 따라 메뉴 표시
	let currentMenus = $derived(menuConfigs[$currentProject.id] ?? menuConfigs['boom']);

	function toggleProjectMenu() {
		if (!$sidebar.isOpen) {
			sidebar.setOpen(true);
			setTimeout(() => (isProjectMenuOpen = !isProjectMenuOpen), 200);
		} else {
			isProjectMenuOpen = !isProjectMenuOpen;
		}
	}

	function selectProject(project: (typeof projects)[0]) {
		currentProject.set(project);
		isProjectMenuOpen = false;
	}

	function isCurrent(href: string) {
		return $page.url.pathname === href;
	}
</script>

<!-- Mobile Overlay -->
{#if $sidebar.isMobileOpen}
	<div
		class="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity lg:hidden"
		onclick={() => sidebar.closeMobile()}
		onkeydown={(e) => e.key === 'Escape' && sidebar.closeMobile()}
		role="button"
		tabindex="0"
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
		<!-- Logo -->
		<div
			class="flex items-center overflow-hidden transition-all duration-300 {$sidebar.isOpen
				? 'w-auto opacity-100'
				: 'w-0 opacity-0 lg:w-auto lg:opacity-100'}"
		>
			{#if $sidebar.isOpen}
				<span class="text-lg font-bold tracking-tight whitespace-nowrap text-blue-400">LEES</span>
			{:else}
				<!-- Collapsed Logo (Centered) -->
				<span class="mx-auto text-xl font-bold text-blue-500">L</span>
			{/if}
		</div>

		<!-- Toggle Button (Desktop: Top Right inside Sidebar) -->
		<button
			onclick={() => sidebar.toggle()}
			class="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-slate-600 focus:outline-none lg:flex"
			title="Toggle Sidebar"
		>
			{#if $sidebar.isOpen}
				<!-- Chevron Left -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="size-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			{:else}
				<!-- Chevron Right -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="size-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			{/if}
		</button>

		<!-- Mobile Close Button -->
		<button
			onclick={() => sidebar.closeMobile()}
			class="p-2 text-slate-400 hover:text-white lg:hidden"
			aria-label="Close sidebar"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Project Switcher -->
	<div class="border-b border-slate-800/50 px-3 py-3">
		<div class="relative">
			<button
				onclick={toggleProjectMenu}
				class="flex w-full items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 p-2 text-left transition-colors outline-none hover:bg-slate-800 focus:ring-2 focus:ring-blue-500/50"
				aria-expanded={isProjectMenuOpen}
				aria-haspopup="true"
			>
				<!-- Project Icon -->
				<div
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm"
				>
					{$currentProject.name.charAt(0).toUpperCase()}
				</div>

				<!-- Project Name (Hidden when collapsed) -->
				<div
					class="flex-1 overflow-hidden transition-all duration-300 {$sidebar.isOpen
						? 'w-auto opacity-100'
						: 'w-0 opacity-0 lg:hidden'}"
				>
					<span class="block truncate text-sm font-medium text-slate-200"
						>{$currentProject.name}</span
					>
				</div>

				<!-- Chevron -->
				{#if $sidebar.isOpen}
					<svg
						class="size-4 text-slate-500 transition-transform duration-200 {isProjectMenuOpen
							? 'rotate-180'
							: ''}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				{/if}
			</button>

			<!-- Dropdown Menu -->
			{#if isProjectMenuOpen && $sidebar.isOpen}
				<div
					class="animate-in fade-in zoom-in-95 absolute top-full right-0 left-0 z-50 mt-1 origin-top rounded-md border border-slate-700 bg-slate-800 p-1 shadow-lg ring-1 ring-black/5 duration-100 focus:outline-none"
				>
					{#each projects as project}
						<button
							onclick={() => selectProject(project)}
							class="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-slate-300 outline-none hover:bg-slate-700/50 hover:text-white focus:bg-slate-700"
						>
							<div
								class="flex h-5 w-5 shrink-0 items-center justify-center rounded {$currentProject.id ===
								project.id
									? 'bg-blue-500 text-white'
									: 'bg-slate-700 text-slate-400'} text-[10px] font-bold"
							>
								{project.name.charAt(0).toUpperCase()}
							</div>
							<span class="flex-1 truncate text-left">{project.name}</span>
							{#if $currentProject.id === project.id}
								<svg
									class="size-4 text-blue-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</button>
					{/each}
					<div class="my-1 h-px bg-slate-700/50"></div>
					<button
						class="flex w-full items-center gap-2 rounded px-2 py-2 text-xs text-slate-400 hover:bg-slate-700/50 hover:text-white"
					>
						<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Create Project
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Scrollable Nav Area -->
	<nav class="flex flex-1 flex-col space-y-6 overflow-x-hidden overflow-y-auto px-3 py-4">
		{#each currentMenus as section}
			<div class="space-y-1">
				<!-- Section Title (Hidden if collapsed) -->
				{#if $sidebar.isOpen}
					<h3
						class="mb-2 px-2 text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase opacity-100 transition-opacity duration-300"
					>
						{section.title}
					</h3>
				{:else}
					<div class="mb-2 h-4"></div>
					<!-- Spacer for alignment -->
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
						<!-- Icon -->
						<span
							class="shrink-0 transition-colors duration-200 {isCurrent(item.href)
								? 'text-blue-400'
								: 'group-hover:text-white'}"
						>
							<!-- Simple icon mapping for dummy -->
							{#if item.icon === 'ChartPie'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
									/><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
									/></svg
								>
							{:else if item.icon === 'DocumentText'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/></svg
								>
							{:else if item.icon === 'Users'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/></svg
								>
							{:else if item.icon === 'Cog'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/></svg
								>
							{:else if item.icon === 'Server'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01"
									/></svg
								>
							{:else if item.icon === 'Database'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
									/></svg
								>
							{:else if item.icon === 'Wifi'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
									/></svg
								>
							{:else if item.icon === 'Bell'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
									/></svg
								>
							{:else if item.icon === 'Key'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
									/></svg
								>
							{:else if item.icon === 'ChartBar'}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/></svg
								>
							{:else}
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 12h16M4 18h16"
									/></svg
								>
							{/if}
						</span>

						<!-- Text -->
						<span
							class="ml-3 block whitespace-nowrap transition-all duration-300
                            {$sidebar.isOpen
								? 'w-auto opacity-100'
								: 'w-0 opacity-0 lg:hidden'} truncate font-medium tracking-wide"
						>
							{item.name}
						</span>

						<!-- Active Indicator (Right Border) -->
						{#if isCurrent(item.href) && $sidebar.isOpen}
							<div
								class="absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-l-full bg-blue-500"
							></div>
						{/if}
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<!-- Footer: User Profile -->
	<div class="border-t border-slate-800 bg-slate-950/30 p-4">
		<div class="flex items-center {$sidebar.isOpen ? '' : 'justify-center'}">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-bold text-slate-300 shadow-sm"
			>
				SU
			</div>

			<div
				class="ml-3 overflow-hidden transition-all duration-300
                {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}"
			>
				<p class="truncate text-sm font-semibold text-white">Super User</p>
				<p class="truncate text-xs text-slate-500">super@admin.com</p>
			</div>

			<!-- Settings Icon (Only visible when expanded) -->
			{#if $sidebar.isOpen}
				<button
					class="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white"
					aria-label="Settings"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/></svg
					>
				</button>
			{/if}
		</div>
	</div>
</aside>
