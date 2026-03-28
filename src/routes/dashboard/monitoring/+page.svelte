<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let marketInit = $derived(data.filters.market);
	let statusInit = $derived(data.filters.status);

	let marketFilter = $state<string>('all');
	let statusFilter = $state<string>('all');

	$effect(() => {
		marketFilter = marketInit;
		statusFilter = statusInit;
	});

	function applyFilters() {
		const params = new URLSearchParams();
		if (marketFilter !== 'all') params.set('market', marketFilter);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		params.set('page', '1');
		goto(`/dashboard/monitoring?${params.toString()}`);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		goto(`/dashboard/monitoring?${params.toString()}`);
	}

	function formatDateTime(dateStr: string) {
		return new Date(dateStr).toLocaleString('ko-KR', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDuration(ms: number) {
		if (ms < 1000) return ms + 'ms';
		return (ms / 1000).toFixed(1) + 's';
	}

	const statusColorMap: Record<string, string> = {
		healthy: 'bg-emerald-500',
		degraded: 'bg-amber-500',
		down: 'bg-rose-500'
	};

	const statusLabelMap: Record<string, string> = {
		healthy: '정상',
		degraded: '불안정',
		down: '장애'
	};
</script>

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900">크롤링 모니터링</h2>
		<p class="mt-1 text-sm text-slate-500">마켓별 수집 현황 및 로그</p>
	</div>

	<!-- Market Status Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.marketStatuses as market}
			<div
				class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md"
			>
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold text-slate-900">{market.displayName}</h3>
					<span class="flex items-center gap-1.5">
						<span class="relative flex h-2.5 w-2.5">
							{#if market.status === 'healthy'}
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
								></span>
							{/if}
							<span
								class="relative inline-flex h-2.5 w-2.5 rounded-full {statusColorMap[market.status]}"
							></span>
						</span>
						<span class="text-xs text-slate-500">{statusLabelMap[market.status]}</span>
					</span>
				</div>

				<div class="mt-4 grid grid-cols-2 gap-3">
					<div>
						<p class="text-xs text-slate-500">성공률</p>
						<p
							class="text-lg font-semibold {market.successRate >= 90
								? 'text-emerald-600'
								: market.successRate >= 75
									? 'text-amber-600'
									: 'text-rose-600'}"
						>
							{market.successRate}%
						</p>
					</div>
					<div>
						<p class="text-xs text-slate-500">평균 수집</p>
						<p class="text-lg font-semibold text-slate-900">
							{formatDuration(market.avgDuration)}
						</p>
					</div>
					<div>
						<p class="text-xs text-slate-500">24h 수집</p>
						<p class="text-sm font-medium text-slate-700">
							{market.totalCrawls24h.toLocaleString()}건
						</p>
					</div>
					<div>
						<p class="text-xs text-slate-500">마지막 확인</p>
						<p class="text-xs text-slate-500">
							{formatDateTime(market.lastCheckedAt)}
						</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Crawl Logs -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
		<div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
			<h3 class="text-base font-semibold text-slate-900">크롤링 로그</h3>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					applyFilters();
				}}
				class="flex gap-2"
			>
				<select
					bind:value={marketFilter}
					class="rounded-md border border-slate-300 px-2 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="all">전체 마켓</option>
					<option value="coupang">Coupang</option>
					<option value="aliexpress">AliExpress</option>
					<option value="amazon">Amazon</option>
					<option value="gmarket">G-Market</option>
				</select>
				<select
					bind:value={statusFilter}
					class="rounded-md border border-slate-300 px-2 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="all">전체 상태</option>
					<option value="success">성공</option>
					<option value="failed">실패</option>
				</select>
				<button
					type="submit"
					class="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
				>
					필터
				</button>
			</form>
		</div>

		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>시간</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>마켓</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>상품</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>상태</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>소요시간</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>에러</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each data.crawlLogs.data as log}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
								{formatDateTime(log.createdAt)}
							</td>
							<td class="px-6 py-3 whitespace-nowrap">
								<span
									class="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
								>
									{log.market}
								</span>
							</td>
							<td class="max-w-[200px] truncate px-6 py-3 text-sm text-slate-700">
								{log.productName}
							</td>
							<td class="px-6 py-3 whitespace-nowrap">
								{#if log.status === 'success'}
									<span
										class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
										>성공</span
									>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-600/10 ring-inset"
										>실패</span
									>
								{/if}
							</td>
							<td class="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
								{formatDuration(log.duration)}
							</td>
							<td class="max-w-[200px] truncate px-6 py-3 text-xs text-rose-600">
								{log.errorMessage ?? '-'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.crawlLogs.totalPages > 1}
			<div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
				<p class="text-sm text-slate-500">
					{data.crawlLogs.total}건 중 {(data.crawlLogs.page - 1) * data.crawlLogs.limit + 1}-{Math.min(
						data.crawlLogs.page * data.crawlLogs.limit,
						data.crawlLogs.total
					)}
				</p>
				<div class="flex gap-1">
					<button
						onclick={() => goToPage(data.crawlLogs.page - 1)}
						disabled={data.crawlLogs.page <= 1}
						class="rounded-md px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40"
					>
						이전
					</button>
					<button
						onclick={() => goToPage(data.crawlLogs.page + 1)}
						disabled={data.crawlLogs.page >= data.crawlLogs.totalPages}
						class="rounded-md px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40"
					>
						다음
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
