<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { CrawlTargetItem } from '$lib/adapters/admin';

	let { data }: { data: any } = $props();

	// ─── Simulation state ───────────────────────────────
	type ItemStatus = 'pending' | 'running' | 'success' | 'failed';

	interface SimItem {
		item: CrawlTargetItem;
		status: ItemStatus;
		duration: number | null;
		error: string | null;
	}

	let simItems = $state<SimItem[]>([]);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let simStartedAt = $state<number | null>(null);
	let simElapsed = $state(0);
	let elapsedTimer = $state<ReturnType<typeof setInterval> | null>(null);
	let crawlTimer = $state<ReturnType<typeof setTimeout> | null>(null);
	let currentIndex = $state(0);

	let marketFilter = $state<string>(data.filters.market);
	let isRefreshing = $state(false);

	async function refreshItems() {
		isRefreshing = true;
		await invalidateAll();
		previewPage = 1;
		isRefreshing = false;
	}

	// Preview pagination
	const PER_PAGE = 20;
	let previewPage = $state(1);
	let previewTotal = $derived(data.items.length);
	let previewTotalPages = $derived(Math.ceil(previewTotal / PER_PAGE));
	let previewItems = $derived(
		data.items.slice((previewPage - 1) * PER_PAGE, previewPage * PER_PAGE)
	);
	let previewStart = $derived((previewPage - 1) * PER_PAGE + 1);
	let previewEnd = $derived(Math.min(previewPage * PER_PAGE, previewTotal));

	const RATE_PER_MIN = 100;
	const INTERVAL_MS = 60000 / RATE_PER_MIN;
	const FAIL_RATE = 0.08;

	const marketOptions = [
		{ value: 'all', label: '전체' },
		{ value: 'coupang', label: 'Coupang' },
		{ value: 'aliexpress', label: 'AliExpress' },
		{ value: 'amazon', label: 'Amazon' }
	];

	const marketConfig: Record<string, { label: string; color: string; dot: string }> = {
		coupang: { label: 'Coupang', color: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
		aliexpress: { label: 'AliExpress', color: 'bg-orange-500/10 text-orange-600', dot: 'bg-orange-500' },
		amazon: { label: 'Amazon', color: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500' }
	};

	// ─── Derived stats ──────────────────────────────────
	let totalCount = $derived(simItems.length);
	let successCount = $derived(simItems.filter((s) => s.status === 'success').length);
	let failCount = $derived(simItems.filter((s) => s.status === 'failed').length);
	let runningCount = $derived(simItems.filter((s) => s.status === 'running').length);
	let pendingCount = $derived(simItems.filter((s) => s.status === 'pending').length);
	let processedCount = $derived(successCount + failCount);
	let progressPct = $derived(totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0);

	// ─── Actions ────────────────────────────────────────
	function startCrawl() {
		const items: CrawlTargetItem[] = data.items;
		if (items.length === 0) return;

		simItems = items.map((item: CrawlTargetItem) => ({
			item,
			status: 'pending' as ItemStatus,
			duration: null,
			error: null
		}));
		currentIndex = 0;
		isRunning = true;
		isPaused = false;
		simStartedAt = Date.now();
		simElapsed = 0;

		elapsedTimer = setInterval(() => {
			if (simStartedAt) simElapsed = Date.now() - simStartedAt;
		}, 200);

		processNext();
	}

	function processNext() {
		if (currentIndex >= simItems.length) {
			finishCrawl();
			return;
		}
		if (isPaused) return;

		simItems[currentIndex].status = 'running';

		const idx = currentIndex;
		const crawlDuration = 200 + Math.random() * 400;

		crawlTimer = setTimeout(() => {
			const isFail = Math.random() < FAIL_RATE;
			simItems[idx].status = isFail ? 'failed' : 'success';
			simItems[idx].duration = Math.round(crawlDuration);
			if (isFail) {
				const errors = [
					'Timeout: page load exceeded 15s',
					'Selector not found: .prod-price',
					'HTTP 403 Forbidden',
					'Connection reset by peer',
					'Rate limit exceeded'
				];
				simItems[idx].error = errors[Math.floor(Math.random() * errors.length)];
			}

			currentIndex++;
			crawlTimer = setTimeout(processNext, INTERVAL_MS - crawlDuration);
		}, crawlDuration);
	}

	function pauseCrawl() {
		isPaused = true;
		if (crawlTimer) clearTimeout(crawlTimer);
	}

	function resumeCrawl() {
		isPaused = false;
		processNext();
	}

	function stopCrawl() {
		if (crawlTimer) clearTimeout(crawlTimer);
		if (elapsedTimer) clearInterval(elapsedTimer);
		isRunning = false;
		isPaused = false;
		simItems = simItems.map((s) =>
			s.status === 'running' ? { ...s, status: 'failed' as ItemStatus, error: 'Cancelled by user' } : s
		);
	}

	function finishCrawl() {
		if (elapsedTimer) clearInterval(elapsedTimer);
		isRunning = false;
		isPaused = false;
		if (simStartedAt) simElapsed = Date.now() - simStartedAt;
	}

	function resetSim() {
		simItems = [];
		isRunning = false;
		isPaused = false;
		currentIndex = 0;
		simElapsed = 0;
		simStartedAt = null;
	}

	function applyMarketFilter(market: string) {
		if (isRunning) return;
		marketFilter = market;
		previewPage = 1;
		const params = new URLSearchParams();
		if (market !== 'all') params.set('market', market);
		goto(`/dashboard/crawl/user-items?${params.toString()}`);
	}

	function formatMs(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		const s = Math.floor(ms / 1000);
		const m = Math.floor(s / 60);
		const sec = s % 60;
		if (m > 0) return `${m}m ${sec}s`;
		return `${sec}s`;
	}

	function formatElapsed(ms: number): string {
		const s = Math.floor(ms / 1000);
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	function getPageNumbers(current: number, total: number): (number | '...')[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const pages: (number | '...')[] = [];
		pages.push(1);
		if (current > 3) pages.push('...');
		for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
			pages.push(i);
		}
		if (current < total - 2) pages.push('...');
		pages.push(total);
		return pages;
	}

	// ─── Individual crawl state ────────────────────────
	let singleCrawlStatus = $state<Record<string, { status: ItemStatus; duration: number | null; error: string | null }>>({});

	function crawlSingle(item: CrawlTargetItem) {
		if (isRunning) return;
		if (singleCrawlStatus[item.id]?.status === 'running') return;

		singleCrawlStatus[item.id] = { status: 'running', duration: null, error: null };

		const crawlDuration = 500 + Math.random() * 2000;
		setTimeout(() => {
			const isFail = Math.random() < FAIL_RATE;
			singleCrawlStatus[item.id] = {
				status: isFail ? 'failed' : 'success',
				duration: Math.round(crawlDuration),
				error: isFail
					? ['Timeout: page load exceeded 15s', 'Selector not found: .prod-price', 'HTTP 403 Forbidden', 'Connection reset by peer', 'Rate limit exceeded'][Math.floor(Math.random() * 5)]
					: null
			};
		}, crawlDuration);
	}

	function retrySingle(item: CrawlTargetItem) {
		delete singleCrawlStatus[item.id];
		singleCrawlStatus = { ...singleCrawlStatus };
		crawlSingle(item);
	}

	let listContainer: HTMLDivElement | undefined = $state();
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight text-slate-900">유저 아이템 크롤</h2>
			<p class="mt-1 text-sm text-slate-500">
				유저가 추가한 상품 링크 크롤 &middot;
				<span class="font-semibold text-slate-700">{data.items.length}</span>개 대상
				<span class="text-slate-400 ml-1">(100개/분 rate limit)</span>
			</p>
		</div>
		<button
			onclick={refreshItems}
			disabled={isRunning || isRefreshing}
			class="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
		>
			<svg class="size-4 {isRefreshing ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
			</svg>
			{isRefreshing ? '갱신중...' : '목록 새로고침'}
		</button>
	</div>

	<!-- Market Filter + Controls -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex gap-2">
			{#each marketOptions as opt}
				<button
					onclick={() => applyMarketFilter(opt.value)}
					disabled={isRunning}
					class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40
						{marketFilter === opt.value
							? 'bg-slate-900 text-white shadow-sm'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					{opt.label}
				</button>
			{/each}
		</div>

		<div class="flex gap-2">
			{#if !isRunning && simItems.length === 0}
				<button
					onclick={startCrawl}
					disabled={data.items.length === 0}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.97] disabled:opacity-40"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
					</svg>
					크롤 실행 ({data.items.length}개)
				</button>
			{:else if isRunning && !isPaused}
				<button
					onclick={pauseCrawl}
					class="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
					일시정지
				</button>
				<button
					onclick={stopCrawl}
					class="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
					중지
				</button>
			{:else if isRunning && isPaused}
				<button
					onclick={resumeCrawl}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
					</svg>
					재개
				</button>
				<button
					onclick={stopCrawl}
					class="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
					중지
				</button>
			{:else}
				<button
					onclick={resetSim}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
				>
					초기화
				</button>
				<button
					onclick={startCrawl}
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
					</svg>
					다시 실행
				</button>
			{/if}
		</div>
	</div>

	<!-- ═══ Simulation Mode ═══ -->
	{#if simItems.length > 0}
		<!-- Progress Dashboard -->
		<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div class="px-6 py-5">
				<!-- Status + Timer -->
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						{#if isRunning && !isPaused}
							<span class="relative flex size-3">
								<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
								<span class="relative inline-flex size-3 rounded-full bg-blue-500"></span>
							</span>
							<span class="text-base font-semibold text-blue-600">크롤 진행중</span>
						{:else if isPaused}
							<span class="size-3 rounded-full bg-amber-500"></span>
							<span class="text-base font-semibold text-amber-600">일시정지</span>
						{:else}
							<span class="size-3 rounded-full bg-emerald-500"></span>
							<span class="text-base font-semibold text-slate-700">완료</span>
						{/if}
					</div>
					<span class="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-lg font-bold tabular-nums text-slate-700">{formatElapsed(simElapsed)}</span>
				</div>

				<!-- Progress Bar -->
				<div class="h-4 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="flex h-full transition-all duration-300">
						<div class="bg-emerald-500 transition-all duration-300" style="width: {totalCount > 0 ? (successCount / totalCount) * 100 : 0}%"></div>
						<div class="bg-rose-500 transition-all duration-300" style="width: {totalCount > 0 ? (failCount / totalCount) * 100 : 0}%"></div>
						<div class="bg-blue-500 animate-pulse transition-all duration-300" style="width: {totalCount > 0 ? (runningCount / totalCount) * 100 : 0}%"></div>
					</div>
				</div>
				<div class="mt-2 flex items-center justify-between">
					<p class="text-sm tabular-nums text-slate-500">
						<span class="font-semibold text-slate-700">{processedCount}</span> / {totalCount}
					</p>
					<p class="text-sm font-semibold tabular-nums text-slate-700">{progressPct}%</p>
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-5 gap-px border-t border-slate-200 bg-slate-200">
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-slate-400 mb-1">전체</p>
					<p class="text-2xl font-bold tabular-nums text-slate-800">{totalCount}</p>
				</div>
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-slate-400 mb-1">대기</p>
					<p class="text-2xl font-bold tabular-nums text-slate-400">{pendingCount}</p>
				</div>
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-blue-500 mb-1">실행중</p>
					<p class="text-2xl font-bold tabular-nums text-blue-600">{runningCount}</p>
				</div>
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-emerald-500 mb-1">성공</p>
					<p class="text-2xl font-bold tabular-nums text-emerald-600">{successCount}</p>
				</div>
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-rose-500 mb-1">실패</p>
					<p class="text-2xl font-bold tabular-nums text-rose-600">{failCount}</p>
				</div>
			</div>
		</div>

		<!-- Items List (scroll) -->
		<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div class="max-h-[520px] overflow-y-auto" bind:this={listContainer}>
				<table class="min-w-full divide-y divide-slate-200">
					<thead class="bg-slate-50 sticky top-0 z-10">
						<tr>
							<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-14">#</th>
							<th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 w-16">상태</th>
							<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">상품명</th>
							<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-28">마켓</th>
							<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-40 hidden sm:table-cell">유저</th>
							<th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 w-20">소요</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each simItems as sim, idx (sim.item.id)}
							{@const mc = marketConfig[sim.item.market]}
							<tr
								data-idx={idx}
								class="transition-colors {sim.status === 'running' ? 'bg-blue-50/60' : sim.status === 'failed' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}"
							>
								<td class="px-5 py-2.5 text-sm tabular-nums text-slate-400">{idx + 1}</td>
								<td class="px-5 py-2.5 text-center">
									{#if sim.status === 'pending'}
										<span class="inline-flex size-5 items-center justify-center rounded-full bg-slate-100">
											<span class="size-1.5 rounded-full bg-slate-300"></span>
										</span>
									{:else if sim.status === 'running'}
										<svg class="mx-auto size-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
										</svg>
									{:else if sim.status === 'success'}
										<svg class="mx-auto size-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
											<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
										</svg>
									{:else}
										<span class="group relative">
											<svg class="mx-auto size-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
												<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
											</svg>
											{#if sim.error}
												<span class="pointer-events-none absolute left-7 -top-1 z-20 hidden w-52 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-xl group-hover:block">
													{sim.error}
												</span>
											{/if}
										</span>
									{/if}
								</td>
								<td class="px-5 py-2.5">
									<a href={sim.item.url} target="_blank" rel="noopener noreferrer" class="group/link flex items-center gap-1 truncate text-sm font-medium text-slate-800 max-w-[280px] hover:text-blue-600 hover:underline">{sim.item.productName}<svg class="size-3 shrink-0 text-slate-400 group-hover/link:text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>
								</td>
								<td class="px-5 py-2.5">
									<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {mc.color}">
										<span class="size-1.5 rounded-full {mc.dot}"></span>
										{mc.label}
									</span>
								</td>
								<td class="px-5 py-2.5 hidden sm:table-cell">
									<span class="text-sm text-slate-500">{sim.item.userEmail}</span>
								</td>
								<td class="px-5 py-2.5 text-right text-sm tabular-nums text-slate-500">
									{sim.duration !== null ? formatMs(sim.duration) : '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	<!-- ═══ Preview Mode (no sim) ═══ -->
	{:else}
		<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-14">#</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">상품명</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-28">마켓</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">유저</th>
						<th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 w-28">크롤</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each previewItems as item, idx (item.id)}
						{@const mc = marketConfig[item.market]}
						{@const sc = singleCrawlStatus[item.id]}
						<tr class="transition-colors {sc?.status === 'running' ? 'bg-blue-50/40' : sc?.status === 'failed' ? 'bg-rose-50/30' : sc?.status === 'success' ? 'bg-emerald-50/30' : 'hover:bg-slate-50/60'}">
							<td class="px-5 py-3 text-sm tabular-nums text-slate-400">{previewStart + idx}</td>
							<td class="px-5 py-3">
								<a href={item.url} target="_blank" rel="noopener noreferrer" class="group/link flex items-center gap-1 truncate text-sm font-medium text-slate-800 max-w-[280px] hover:text-blue-600 hover:underline">{item.productName}<svg class="size-3 shrink-0 text-slate-400 group-hover/link:text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>
								{#if sc?.status === 'failed' && sc.error}
									<p class="mt-0.5 truncate text-xs text-rose-500">{sc.error}</p>
								{:else if sc?.status === 'success' && sc.duration}
									<p class="mt-0.5 text-xs text-emerald-500">{formatMs(sc.duration)}에 완료</p>
								{/if}
							</td>
							<td class="px-5 py-3">
								<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {mc.color}">
									<span class="size-1.5 rounded-full {mc.dot}"></span>
									{mc.label}
								</span>
							</td>
							<td class="px-5 py-3 hidden sm:table-cell">
								<span class="text-sm text-slate-500">{item.userEmail}</span>
							</td>
							<td class="px-5 py-3 text-center">
								{#if sc?.status === 'running'}
									<svg class="mx-auto size-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
									</svg>
								{:else if sc?.status === 'success'}
									<svg class="mx-auto size-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
									</svg>
								{:else if sc?.status === 'failed'}
									<button
										onclick={() => retrySingle(item)}
										class="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20"
										title="재시도"
									>
										<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
										재시도
									</button>
								{:else}
									<button
										onclick={() => crawlSingle(item)}
										class="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20"
									>
										<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
										크롤
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- Pagination -->
			{#if previewTotalPages > 1}
				<div class="border-t border-slate-200 px-6 py-5">
					<div class="flex flex-col items-center gap-3">
						<!-- Page buttons -->
						<div class="flex items-center gap-1.5">
							<button
								onclick={() => { previewPage = Math.max(1, previewPage - 1); }}
								disabled={previewPage <= 1}
								class="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
							>
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
							</button>

							{#each getPageNumbers(previewPage, previewTotalPages) as p}
								{#if p === '...'}
									<span class="inline-flex size-10 items-center justify-center text-sm text-slate-400">...</span>
								{:else}
									<button
										onclick={() => { previewPage = p as number; }}
										class="inline-flex size-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors
											{p === previewPage
												? 'bg-slate-900 text-white shadow-sm'
												: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}"
									>
										{p}
									</button>
								{/if}
							{/each}

							<button
								onclick={() => { previewPage = Math.min(previewTotalPages, previewPage + 1); }}
								disabled={previewPage >= previewTotalPages}
								class="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
							>
								<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
							</button>
						</div>

						<!-- Range info -->
						<p class="text-sm tabular-nums text-slate-500">
							<span class="font-semibold text-slate-700">{previewStart}–{previewEnd}</span>
							/ {previewTotal}건
						</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Info -->
	<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
		<div class="flex gap-3">
			<svg class="mt-0.5 size-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
			</svg>
			<div class="text-sm text-blue-700">
				<p class="font-semibold">Rate Limit</p>
				<ul class="mt-2 list-inside list-disc space-y-1 text-xs text-blue-600">
					<li>분당 <strong>100개</strong> — 약 <strong>0.6초</strong> 간격으로 균일 분배 요청</li>
					<li>{data.items.length}개 기준 예상 소요: <strong>약 {Math.ceil(data.items.length / RATE_PER_MIN)}분</strong></li>
					<li>실행 중 일시정지/중지 가능</li>
				</ul>
			</div>
		</div>
	</div>
</div>
