<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

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

	function getPageNumbers(current: number, total: number): (number | '...')[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [1];
		if (current > 3) pages.push('...');
		for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
			pages.push(i);
		}
		if (current < total - 2) pages.push('...');
		pages.push(total);
		return pages;
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
	<div class="space-y-3">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<h3 class="text-base font-semibold text-slate-900">크롤링 로그</h3>
			<div class="flex items-center gap-3">
				<!-- Status Filter Tabs -->
				<div class="flex gap-1">
					{#each [{ value: 'all', label: '전체' }, { value: 'success', label: '성공' }, { value: 'failed', label: '실패만' }] as f}
						<button
							onclick={() => { statusFilter = f.value; applyFilters(); }}
							class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {statusFilter === f.value
								? f.value === 'failed' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						>
							{f.label}
						</button>
					{/each}
				</div>
				<!-- Market Filter -->
				<select
					bind:value={marketFilter}
					onchange={() => applyFilters()}
					class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
				>
					<option value="all">전체 마켓</option>
					<option value="coupang">Coupang</option>
					<option value="aliexpress">AliExpress</option>
					<option value="amazon">Amazon</option>
				</select>
			</div>
		</div>

	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">

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
						<th class="px-6 py-3 text-center text-xs font-medium tracking-wider text-slate-500 uppercase"
						></th>
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
							<td class="max-w-[200px] px-6 py-3 text-sm">
								<a href={log.productUrl} target="_blank" rel="noopener noreferrer" class="group/link flex items-center gap-1 truncate text-slate-700 hover:text-blue-600 hover:underline">
									{log.productName}
									<svg class="size-3 shrink-0 text-slate-400 group-hover/link:text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
								</a>
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
							<td class="px-6 py-3 text-center whitespace-nowrap">
								{#if log.status === 'failed'}
									<form method="POST" action="?/retry" use:enhance={() => { return async ({ update }) => { await update({ reset: false }); }; }} class="inline">
										<input type="hidden" name="itemId" value={log.itemId} />
										<button
											type="submit"
											class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
										>
											<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
												<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
											</svg>
											재시도
										</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.crawlLogs.totalPages > 1}
			<div class="flex flex-col items-center gap-2 border-t border-slate-200 px-4 py-3">
				<div class="flex items-center gap-1">
					<button
						onclick={() => goToPage(data.crawlLogs.page - 1)}
						disabled={data.crawlLogs.page <= 1}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					{#each getPageNumbers(data.crawlLogs.page, data.crawlLogs.totalPages) as p}
						{#if p === '...'}
							<span class="size-10 flex items-center justify-center text-sm text-slate-400">…</span>
						{:else}
							<button
								onclick={() => goToPage(p as number)}
								class="size-10 rounded-lg text-sm font-semibold transition-colors {p === data.crawlLogs.page
									? 'bg-slate-900 text-white shadow-sm'
									: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
							>
								{p}
							</button>
						{/if}
					{/each}
					<button
						onclick={() => goToPage(data.crawlLogs.page + 1)}
						disabled={data.crawlLogs.page >= data.crawlLogs.totalPages}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				</div>
				<p class="text-xs tabular-nums text-slate-500">
					<span class="font-medium text-slate-700">{(data.crawlLogs.page - 1) * data.crawlLogs.limit + 1}–{Math.min(data.crawlLogs.page * data.crawlLogs.limit, data.crawlLogs.total)}</span>
					/ {data.crawlLogs.total}건
				</p>
			</div>
		{/if}
	</div>
	</div>
</div>
