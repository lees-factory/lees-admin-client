<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { HotProductsApiSource } from '$lib/adapters/admin';

	let { data }: { data: any } = $props();

	// ─── Simulation state ───────────────────────────────
	type ItemStatus = 'pending' | 'running' | 'success' | 'failed';

	interface SimItem {
		source: HotProductsApiSource;
		status: ItemStatus;
		fetchedCount: number;
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

	// API 호출은 건당 오래 걸림 (2~5초 시뮬레이션)
	const INTERVAL_MS = 3000;
	const FAIL_RATE = 0.1;

	const marketOptions = [
		{ value: 'all', label: '전체' },
		{ value: 'coupang', label: 'Coupang' },
		{ value: 'aliexpress', label: 'AliExpress' },
		{ value: 'amazon', label: 'Amazon' }
	];

	const marketConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
		coupang: { label: 'Coupang', color: 'bg-red-500/10 text-red-600', dot: 'bg-red-500', bg: 'border-red-200 bg-red-50/50' },
		aliexpress: { label: 'AliExpress', color: 'bg-orange-500/10 text-orange-600', dot: 'bg-orange-500', bg: 'border-orange-200 bg-orange-50/50' },
		amazon: { label: 'Amazon', color: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500', bg: 'border-amber-200 bg-amber-50/50' }
	};

	let totalCount = $derived(simItems.length);
	let successCount = $derived(simItems.filter((s) => s.status === 'success').length);
	let failCount = $derived(simItems.filter((s) => s.status === 'failed').length);
	let runningCount = $derived(simItems.filter((s) => s.status === 'running').length);
	let pendingCount = $derived(simItems.filter((s) => s.status === 'pending').length);
	let processedCount = $derived(successCount + failCount);
	let progressPct = $derived(totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0);
	let totalFetched = $derived(simItems.reduce((sum, s) => sum + s.fetchedCount, 0));

	function startFetch() {
		const sources: HotProductsApiSource[] = data.sources;
		if (sources.length === 0) return;

		simItems = sources.map((source: HotProductsApiSource) => ({
			source,
			status: 'pending' as ItemStatus,
			fetchedCount: 0,
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
			finishFetch();
			return;
		}
		if (isPaused) return;

		simItems[currentIndex].status = 'running';
		const idx = currentIndex;
		const fetchDuration = 1500 + Math.random() * 3500; // 1.5~5초

		crawlTimer = setTimeout(() => {
			const isFail = Math.random() < FAIL_RATE;
			simItems[idx].status = isFail ? 'failed' : 'success';
			simItems[idx].duration = Math.round(fetchDuration);
			if (isFail) {
				const errors = [
					'API 인증 토큰 만료',
					'Rate limit exceeded (429)',
					'Internal Server Error (500)',
					'Connection timeout'
				];
				simItems[idx].error = errors[Math.floor(Math.random() * errors.length)];
			} else {
				// 실제 수집 건수 시뮬레이션 (기존 lastFetchedCount 기반 ±20%)
				const base = simItems[idx].source.lastFetchedCount || 50;
				simItems[idx].fetchedCount = Math.max(1, Math.round(base * (0.8 + Math.random() * 0.4)));
			}

			currentIndex++;
			crawlTimer = setTimeout(processNext, INTERVAL_MS - fetchDuration > 0 ? INTERVAL_MS - fetchDuration : 200);
		}, fetchDuration);
	}

	function pauseFetch() {
		isPaused = true;
		if (crawlTimer) clearTimeout(crawlTimer);
	}

	function resumeFetch() {
		isPaused = false;
		processNext();
	}

	function stopFetch() {
		if (crawlTimer) clearTimeout(crawlTimer);
		if (elapsedTimer) clearInterval(elapsedTimer);
		isRunning = false;
		isPaused = false;
		simItems = simItems.map((s) =>
			s.status === 'running' ? { ...s, status: 'failed' as ItemStatus, error: 'Cancelled by user' } : s
		);
	}

	function finishFetch() {
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
		const params = new URLSearchParams();
		if (market !== 'all') params.set('market', market);
		goto(`/dashboard/crawl/hot-products-fetch?${params.toString()}`);
	}

	function formatMs(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	}

	function formatElapsed(ms: number): string {
		const s = Math.floor(ms / 1000);
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	function formatDateTime(dateStr: string | null) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight text-slate-900">핫프로덕트 수집</h2>
			<p class="mt-1 text-sm text-slate-500">
				각 마켓 공식 API를 호출하여 핫프로덕트 목록을 가져옵니다 &middot;
				<span class="font-semibold text-slate-700">{data.sources.length}</span>개 API 소스
			</p>
		</div>
	</div>

	<!-- Filter + Controls -->
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
					onclick={startFetch}
					disabled={data.sources.length === 0}
					class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.97] disabled:opacity-40"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
					</svg>
					수집 실행 ({data.sources.length}개 API)
				</button>
			{:else if isRunning && !isPaused}
				<button
					onclick={pauseFetch}
					class="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
					일시정지
				</button>
				<button
					onclick={stopFetch}
					class="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
				>
					<svg class="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
					중지
				</button>
			{:else if isRunning && isPaused}
				<button
					onclick={resumeFetch}
					class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
					</svg>
					재개
				</button>
				<button
					onclick={stopFetch}
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
					onclick={startFetch}
					class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
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
		<!-- Progress -->
		<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div class="px-6 py-5">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						{#if isRunning && !isPaused}
							<span class="relative flex size-3">
								<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
								<span class="relative inline-flex size-3 rounded-full bg-violet-500"></span>
							</span>
							<span class="text-base font-semibold text-violet-600">API 호출 진행중</span>
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

				<div class="h-4 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="flex h-full transition-all duration-500">
						<div class="bg-emerald-500 transition-all duration-500" style="width: {totalCount > 0 ? (successCount / totalCount) * 100 : 0}%"></div>
						<div class="bg-rose-500 transition-all duration-500" style="width: {totalCount > 0 ? (failCount / totalCount) * 100 : 0}%"></div>
						<div class="bg-violet-500 animate-pulse transition-all duration-500" style="width: {totalCount > 0 ? (runningCount / totalCount) * 100 : 0}%"></div>
					</div>
				</div>
				<div class="mt-2 flex items-center justify-between">
					<p class="text-sm tabular-nums text-slate-500">
						<span class="font-semibold text-slate-700">{processedCount}</span> / {totalCount} API
					</p>
					<p class="text-sm tabular-nums text-slate-500">
						수집: <span class="font-semibold text-slate-700">{totalFetched}</span>개 상품
					</p>
				</div>
			</div>

			<div class="grid grid-cols-4 gap-px border-t border-slate-200 bg-slate-200">
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-slate-400 mb-1">대기</p>
					<p class="text-2xl font-bold tabular-nums text-slate-400">{pendingCount}</p>
				</div>
				<div class="bg-white px-4 py-4 text-center">
					<p class="text-xs font-medium text-violet-500 mb-1">실행중</p>
					<p class="text-2xl font-bold tabular-nums text-violet-600">{runningCount}</p>
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

		<!-- API Source Cards -->
		<div class="space-y-3">
			{#each simItems as sim (sim.source.id)}
				{@const mc = marketConfig[sim.source.market]}
				<div class="overflow-hidden rounded-xl border shadow-sm transition-colors
					{sim.status === 'running' ? 'border-violet-300 bg-violet-50/30' : sim.status === 'failed' ? 'border-rose-200 bg-rose-50/30' : sim.status === 'success' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-white'}">
					<div class="px-5 py-4">
						<div class="flex items-start gap-4">
							<!-- Status -->
							<div class="shrink-0 pt-0.5">
								{#if sim.status === 'pending'}
									<span class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100">
										<span class="size-2 rounded-full bg-slate-300"></span>
									</span>
								{:else if sim.status === 'running'}
									<span class="inline-flex size-8 items-center justify-center">
										<svg class="size-7 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
										</svg>
									</span>
								{:else if sim.status === 'success'}
									<svg class="size-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="size-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
										<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>

							<!-- Info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h4 class="text-sm font-semibold text-slate-900">{sim.source.apiName}</h4>
									<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {mc.color}">
										<span class="size-1.5 rounded-full {mc.dot}"></span>
										{mc.label}
									</span>
								</div>
								<p class="text-xs text-slate-500 mb-1">{sim.source.description}</p>
								<p class="text-[11px] text-slate-400 font-mono truncate">{sim.source.endpoint}</p>
								{#if sim.status === 'failed' && sim.error}
									<p class="mt-2 rounded-md bg-rose-50 px-3 py-1.5 text-xs text-rose-600">{sim.error}</p>
								{/if}
							</div>

							<!-- Result -->
							<div class="shrink-0 text-right">
								{#if sim.status === 'success'}
									<p class="text-lg font-bold tabular-nums text-emerald-600">{sim.fetchedCount}</p>
									<p class="text-[10px] text-slate-400">상품 수집</p>
									<p class="text-[10px] tabular-nums text-slate-400">{formatMs(sim.duration ?? 0)}</p>
								{:else if sim.status === 'failed'}
									<p class="text-sm font-semibold text-rose-500">실패</p>
									{#if sim.duration}<p class="text-[10px] tabular-nums text-slate-400">{formatMs(sim.duration)}</p>{/if}
								{:else if sim.status === 'running'}
									<p class="text-sm text-violet-500">호출중...</p>
								{:else}
									<p class="text-xs text-slate-400">대기</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

	<!-- ═══ Preview Mode ═══ -->
	{:else}
		<div class="space-y-3">
			{#each data.sources as source (source.id)}
				{@const mc = marketConfig[source.market]}
				<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
					<div class="px-5 py-4">
						<div class="flex items-start gap-4">
							<div class="shrink-0 pt-0.5">
								<div class="flex size-8 items-center justify-center rounded-lg {mc.color}">
									<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
									</svg>
								</div>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h4 class="text-sm font-semibold text-slate-900">{source.apiName}</h4>
									<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold {mc.color}">
										<span class="size-1.5 rounded-full {mc.dot}"></span>
										{mc.label}
									</span>
								</div>
								<p class="text-xs text-slate-500 mb-1">{source.description}</p>
								<p class="text-[11px] text-slate-400 font-mono truncate">{source.endpoint}</p>
							</div>
							<div class="shrink-0 text-right">
								<p class="text-lg font-bold tabular-nums text-slate-700">{source.lastFetchedCount}</p>
								<p class="text-[10px] text-slate-400">마지막 수집</p>
								<p class="text-[10px] tabular-nums text-slate-400">{formatDateTime(source.lastFetchedAt)}</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
			{#if data.sources.length === 0}
				<div class="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
					해당 마켓의 API 소스가 없습니다
				</div>
			{/if}
		</div>
	{/if}

	<!-- Info -->
	<div class="rounded-xl border border-violet-100 bg-violet-50/50 p-5">
		<div class="flex gap-3">
			<svg class="mt-0.5 size-5 shrink-0 text-violet-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
			</svg>
			<div class="text-sm text-violet-700">
				<p class="font-semibold">핫프로덕트 수집 안내</p>
				<ul class="mt-2 list-inside list-disc space-y-1 text-xs text-violet-600">
					<li>각 마켓 공식 API를 호출하여 인기 상품 목록을 수집합니다.</li>
					<li>수집된 상품은 <strong>핫프로덕트 크롤</strong> 페이지에서 개별 크롤할 수 있습니다.</li>
					<li>API 호출 특성상 건당 수초가 소요될 수 있습니다.</li>
				</ul>
			</div>
		</div>
	</div>
</div>
