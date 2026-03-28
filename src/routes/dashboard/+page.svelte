<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { MarketStatus } from '$lib/adapters/admin';

	let { data } = $props();

	const marketColors: Record<string, { bg: string; text: string; ring: string }> = {
		coupang: { bg: 'bg-red-500/10', text: 'text-red-600', ring: 'ring-red-500/20' },
		aliexpress: { bg: 'bg-orange-500/10', text: 'text-orange-600', ring: 'ring-orange-500/20' },
		amazon: { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500/20' }
	};

	const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
		healthy: { label: '정상', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-700' },
		degraded: { label: '불안정', dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-700' },
		down: { label: '장애', dot: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-700' }
	};

	function formatDuration(ms: number) {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	}

	function timeAgo(dateStr: string) {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return '방금 전';
		if (mins < 60) return `${mins}분 전`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}시간 전`;
		return `${Math.floor(hours / 24)}일 전`;
	}

	function marketLabel(m: string) {
		return { coupang: 'Coupang', aliexpress: 'AliExpress', amazon: 'Amazon' }[m] ?? m;
	}

	const quickLinks = [
		{ href: '/dashboard/items', label: '추적 상품', desc: '전체 상품 조회·관리', icon: 'items' },
		{ href: '/dashboard/monitoring', label: '크롤 모니터링', desc: '수집 로그·상태 확인', icon: 'monitoring' },
		{ href: '/dashboard/crawl/user-items', label: '유저 크롤', desc: '크롤 실행·시뮬레이션', icon: 'crawl' },
		{ href: '/dashboard/settings', label: '시스템 설정', desc: '요금제·수집 주기 설정', icon: 'settings' }
	];

	let overallHealth: 'good' | 'warn' | 'critical' = $derived.by(() => {
		const statuses = data.marketStatuses.map((m: MarketStatus) => m.status);
		if (statuses.includes('down')) return 'critical';
		if (statuses.includes('degraded')) return 'warn';
		return 'good';
	});
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Page Header -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900 sm:text-3xl sm:tracking-tight">Dashboard</h2>
		<p class="mt-1 text-sm text-slate-500">Price Eye 운영 현황 요약</p>
	</div>

	<!-- ─── Section 1: Key Metrics ─── -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<!-- Users -->
		<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-blue-500/10 p-2">
					<svg class="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 7.5a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm-9-3.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">전체 사용자</p>
					<p class="text-xl font-bold text-slate-900">{data.stats.totalUsers.toLocaleString()}</p>
				</div>
			</div>
			<div class="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
				<span class="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">
					+{data.stats.todaySignups}
				</span>
				<span class="text-xs text-slate-400">오늘 가입</span>
			</div>
		</div>

		<!-- Tracked Items -->
		<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-violet-500/10 p-2">
					<svg class="size-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">추적 상품</p>
					<p class="text-xl font-bold text-slate-900">{data.stats.totalTrackedItems.toLocaleString()}</p>
				</div>
			</div>
			<div class="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
				<span class="text-xs text-slate-500">{data.stats.activeTrackings.toLocaleString()}개 활성 추적 중</span>
			</div>
		</div>

		<!-- Crawl Success Rate -->
		<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
			<div class="flex items-center gap-3">
				<div class="rounded-lg {data.stats.crawlSuccessRate >= 90 ? 'bg-emerald-500/10' : data.stats.crawlSuccessRate >= 70 ? 'bg-amber-500/10' : 'bg-rose-500/10'} p-2">
					<svg class="size-5 {data.stats.crawlSuccessRate >= 90 ? 'text-emerald-600' : data.stats.crawlSuccessRate >= 70 ? 'text-amber-600' : 'text-rose-600'}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">24h 수집 성공률</p>
					<p class="text-xl font-bold {data.stats.crawlSuccessRate >= 90 ? 'text-emerald-600' : data.stats.crawlSuccessRate >= 70 ? 'text-amber-600' : 'text-rose-600'}">{data.stats.crawlSuccessRate}%</p>
				</div>
			</div>
			<div class="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
				<span class="text-xs text-slate-500">실패율 {data.stats.crawlFailureRate}%</span>
			</div>
		</div>

		<!-- Plan Conversion -->
		<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-cyan-500/10 p-2">
					<svg class="size-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
				</div>
				<div>
					<p class="text-xs font-medium text-slate-500">Pro 전환율</p>
					<p class="text-xl font-bold text-slate-900">{((data.stats.proUsers / data.stats.totalUsers) * 100).toFixed(1)}%</p>
				</div>
			</div>
			<div class="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
				<span class="text-xs text-slate-500">Free {data.stats.freeUsers.toLocaleString()} / Pro {data.stats.proUsers.toLocaleString()}</span>
			</div>
		</div>
	</div>

	<!-- ─── Section 2: Market Health ─── -->
	<div>
		<h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">마켓별 크롤 상태</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each data.marketStatuses as market}
				{@const sc = statusConfig[market.status]}
				{@const mc = marketColors[market.market]}
				<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
					<!-- Header -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {mc.bg} {mc.text}">
								{market.displayName}
							</span>
						</div>
						<span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold {sc.bg} {sc.text}">
							<span class="size-1.5 rounded-full {sc.dot}"></span>
							{sc.label}
						</span>
					</div>

					<!-- Metrics -->
					<div class="mt-4 grid grid-cols-3 gap-3">
						<div>
							<p class="text-xs text-slate-400">성공률</p>
							<p class="text-lg font-bold {market.successRate >= 90 ? 'text-slate-900' : market.successRate >= 70 ? 'text-amber-600' : 'text-rose-600'}">{market.successRate}%</p>
						</div>
						<div>
							<p class="text-xs text-slate-400">평균 응답</p>
							<p class="text-lg font-bold text-slate-900">{formatDuration(market.avgDuration)}</p>
						</div>
						<div>
							<p class="text-xs text-slate-400">24h 수집</p>
							<p class="text-lg font-bold text-slate-900">{market.totalCrawls24h.toLocaleString()}</p>
						</div>
					</div>

					<!-- Success Rate Bar -->
					<div class="mt-3">
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
							<div
								class="h-full rounded-full transition-all {market.successRate >= 90 ? 'bg-emerald-500' : market.successRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'}"
								style="width: {market.successRate}%"
							></div>
						</div>
					</div>

					<p class="mt-2 text-xs text-slate-400">최종 확인 {timeAgo(market.lastCheckedAt)}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- ─── Section 3: Two Column Layout ─── -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Left: Recent Failures -->
		<div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
			<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="size-2 rounded-full bg-rose-500"></div>
					<h3 class="text-sm font-semibold text-slate-900">최근 수집 실패</h3>
				</div>
				<a href="/dashboard/monitoring?status=failed" class="text-xs font-semibold text-blue-600 hover:text-blue-500">전체 보기 &rarr;</a>
			</div>
			{#if data.recentFailures.length === 0}
				<div class="flex flex-col items-center justify-center px-5 py-10 text-center">
					<div class="rounded-full bg-emerald-500/10 p-3">
						<svg class="size-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					</div>
					<p class="mt-2 text-sm font-medium text-slate-600">최근 실패 없음</p>
					<p class="text-xs text-slate-400">모든 크롤이 정상 작동 중입니다</p>
				</div>
			{:else}
				<ul class="divide-y divide-slate-100">
					{#each data.recentFailures as log}
						{@const mc = marketColors[log.market]}
						<li class="flex items-start gap-3 px-5 py-3">
							<div class="mt-0.5 shrink-0">
								<span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold {mc.bg} {mc.text}">
									{marketLabel(log.market)}
								</span>
							</div>
							<div class="min-w-0 flex-1">
								<a href={log.productUrl} target="_blank" rel="noopener noreferrer" class="group/link flex items-center gap-1 truncate text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline">{log.productName}<svg class="size-3 shrink-0 text-slate-400 group-hover/link:text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>
								<p class="mt-0.5 truncate text-xs text-rose-500">{log.errorMessage ?? '알 수 없는 오류'}</p>
							</div>
							<span class="shrink-0 text-xs text-slate-400">{timeAgo(log.createdAt)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Right: Crawler Status + Hot Products Summary -->
		<div class="space-y-4">
			<!-- Crawler Schedule -->
			<div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
				<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<h3 class="text-sm font-semibold text-slate-900">크롤러 스케줄</h3>
					<a href="/dashboard/crawl/user-items" class="text-xs font-semibold text-blue-600 hover:text-blue-500">관리 &rarr;</a>
				</div>
				<div class="divide-y divide-slate-100">
					<!-- User Items Crawler -->
					<div class="flex items-center justify-between px-5 py-3">
						<div class="flex items-center gap-3">
							<span class="inline-flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
								<svg class="size-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
							</span>
							<div>
								<p class="text-sm font-medium text-slate-700">유저 아이템 크롤</p>
								<p class="text-xs text-slate-400">
									{#if data.crawlRunner.userItems.lastJob}
										마지막: {data.crawlRunner.userItems.lastJob.successCount}/{data.crawlRunner.userItems.lastJob.totalItems} 성공
									{:else}
										실행 기록 없음
									{/if}
								</p>
							</div>
						</div>
						<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {data.crawlRunner.userItems.schedule.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}">
							{data.crawlRunner.userItems.schedule.enabled ? '활성' : '수동'}
						</span>
					</div>

					<!-- Hot Products SKU Crawler -->
					<div class="flex items-center justify-between px-5 py-3">
						<div class="flex items-center gap-3">
							<span class="inline-flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
								<svg class="size-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
							</span>
							<div>
								<p class="text-sm font-medium text-slate-700">핫프로덕트 SKU 크롤</p>
								<p class="text-xs text-slate-400">
									{#if data.crawlRunner.hotProductsSku.schedule.nextRunAt}
										다음 실행: {new Date(data.crawlRunner.hotProductsSku.schedule.nextRunAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
									{:else}
										스케줄 없음
									{/if}
								</p>
							</div>
						</div>
						<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {data.crawlRunner.hotProductsSku.schedule.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}">
							{data.crawlRunner.hotProductsSku.schedule.enabled ? `${data.crawlRunner.hotProductsSku.schedule.intervalMinutes / 60}h 주기` : '수동'}
						</span>
					</div>
				</div>
			</div>

			<!-- Hot Products Summary -->
			<div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
				<div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
					<h3 class="text-sm font-semibold text-slate-900">핫프로덕트 현황</h3>
					<a href="/dashboard/hot-products" class="text-xs font-semibold text-blue-600 hover:text-blue-500">관리 &rarr;</a>
				</div>
				<div class="px-5 py-4">
					<!-- Total -->
					<div class="mb-3 flex items-baseline justify-between">
						<span class="text-xs text-slate-400">전체</span>
						<span class="text-sm font-semibold text-slate-900">{data.hotProductSummary.active}<span class="font-normal text-slate-400">/{data.hotProductSummary.total} 노출 중</span></span>
					</div>
					<!-- Per Market -->
					<div class="space-y-2">
						{#each data.hotProductSummary.byMarket as m}
							{@const mc = marketColors[m.market]}
							{@const pct = m.total > 0 ? (m.active / m.total) * 100 : 0}
							<div>
								<div class="flex items-center justify-between text-xs">
									<span class="font-medium {mc.text}">{marketLabel(m.market)}</span>
									<span class="tabular-nums text-slate-500">{m.active}/{m.total}</span>
								</div>
								<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										class="h-full rounded-full {m.market === 'coupang' ? 'bg-red-400' : m.market === 'aliexpress' ? 'bg-orange-400' : 'bg-amber-400'}"
										style="width: {pct}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- ─── Section 4: Quick Nav ─── -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		{#each quickLinks as link}
			<a
				href={link.href}
				class="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
			>
				<div class="mb-2 rounded-lg bg-slate-100 p-2 w-fit transition-colors group-hover:bg-blue-500/10">
					{#if link.icon === 'items'}
						<svg class="size-4 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
					{:else if link.icon === 'monitoring'}
						<svg class="size-4 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
					{:else if link.icon === 'crawl'}
						<svg class="size-4 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
					{:else}
						<svg class="size-4 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
					{/if}
				</div>
				<p class="text-sm font-semibold text-slate-700">{link.label}</p>
				<p class="mt-0.5 text-xs text-slate-400">{link.desc}</p>
			</a>
		{/each}
	</div>
</div>
