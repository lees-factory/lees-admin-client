<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade, slide } from 'svelte/transition';

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
		goto(`/dashboard/items?${params.toString()}`);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		goto(`/dashboard/items?${params.toString()}`);
	}

	function formatPrice(price: number, currency: string) {
		if (currency === 'KRW') return price.toLocaleString('ko-KR') + '원';
		return '$' + price.toLocaleString();
	}

	function formatDateTime(dateStr: string | null) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const marketConfig: Record<string, { label: string; color: string; dot: string }> = {
		coupang: {
			label: 'Coupang',
			color: 'bg-red-500/10 text-red-600',
			dot: 'bg-red-500'
		},
		aliexpress: {
			label: 'AliExpress',
			color: 'bg-orange-500/10 text-orange-600',
			dot: 'bg-orange-500'
		},
		amazon: {
			label: 'Amazon',
			color: 'bg-amber-500/10 text-amber-700',
			dot: 'bg-amber-500'
		},
		gmarket: {
			label: 'G-Market',
			color: 'bg-emerald-500/10 text-emerald-600',
			dot: 'bg-emerald-500'
		}
	};

	const statusConfig: Record<string, { label: string; color: string; iconPath: string }> = {
		success: {
			label: '성공',
			color: 'text-emerald-600 bg-emerald-500/10',
			iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		failed: {
			label: '실패',
			color: 'text-rose-600 bg-rose-500/10',
			iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		pending: {
			label: '대기',
			color: 'text-slate-500 bg-slate-500/10',
			iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	};

	let expandedItem = $state<string | null>(null);

	function toggleExpand(id: string) {
		expandedItem = expandedItem === id ? null : id;
	}

	function getPriceChange(item: { priceHistory: { price: number }[] }) {
		if (item.priceHistory.length < 2) return null;
		const prev = item.priceHistory[item.priceHistory.length - 2].price;
		const curr = item.priceHistory[item.priceHistory.length - 1].price;
		if (prev === 0) return null;
		return ((curr - prev) / prev) * 100;
	}
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight text-slate-900">추적 상품 관리</h2>
			<p class="mt-1 text-sm text-slate-500">
				전체 <span class="font-semibold text-slate-700">{data.items.total}</span>개 상품 추적 중
			</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				applyFilters();
			}}
			class="flex flex-col gap-3 sm:flex-row sm:items-end"
		>
			<div class="flex-1 sm:max-w-[180px]">
				<label for="market" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">마켓</label>
				<select
					id="market"
					bind:value={marketFilter}
					class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
				>
					<option value="all">전체 마켓</option>
					<option value="coupang">Coupang</option>
					<option value="aliexpress">AliExpress</option>
					<option value="amazon">Amazon</option>
					<option value="gmarket">G-Market</option>
				</select>
			</div>
			<div class="flex-1 sm:max-w-[180px]">
				<label for="crawl-status" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">수집 상태</label>
				<select
					id="crawl-status"
					bind:value={statusFilter}
					class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
				>
					<option value="all">전체 상태</option>
					<option value="success">성공</option>
					<option value="failed">실패</option>
					<option value="pending">대기</option>
				</select>
			</div>
			<button
				type="submit"
				class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
			>
				<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
				</svg>
				필터 적용
			</button>
		</form>
	</div>

	<!-- Items List -->
	<div class="space-y-2">
		{#each data.items.data as item (item.id)}
			{@const market = marketConfig[item.market] ?? { label: item.market, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }}
			{@const status = statusConfig[item.crawlStatus] ?? statusConfig.pending}
			{@const priceChange = getPriceChange(item)}
			<div
				class="group overflow-hidden rounded-xl border transition-all duration-200 {expandedItem === item.id
					? 'border-blue-200 bg-white shadow-md shadow-blue-500/5'
					: 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}"
			>
				<!-- Item Row -->
				<button
					onclick={() => toggleExpand(item.id)}
					class="flex w-full items-center gap-4 px-5 py-3.5 text-left"
				>
					<!-- Market Badge -->
					<span
						class="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold {market.color}"
					>
						<span class="size-1.5 rounded-full {market.dot}"></span>
						{market.label}
					</span>

					<!-- Product Info -->
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-slate-800 group-hover:text-slate-900">{item.productName}</p>
						<p class="mt-0.5 text-xs text-slate-400">{item.userEmail}</p>
					</div>

					<!-- Price + Change -->
					<div class="hidden text-right sm:block">
						<p class="text-sm font-semibold tabular-nums text-slate-800">
							{formatPrice(item.currentPrice, item.currency)}
						</p>
						{#if priceChange !== null}
							<p class="mt-0.5 text-xs font-medium tabular-nums {priceChange > 0 ? 'text-rose-500' : priceChange < 0 ? 'text-emerald-500' : 'text-slate-400'}">
								{priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
							</p>
						{/if}
					</div>

					<!-- Crawl Status -->
					<span
						class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold {status.color}"
					>
						<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d={status.iconPath} />
						</svg>
						{status.label}
					</span>

					<!-- Expand Icon -->
					<svg
						class="size-4 shrink-0 text-slate-300 transition-transform duration-200 {expandedItem === item.id ? 'rotate-180 text-blue-500' : 'group-hover:text-slate-400'}"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2.5"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				<!-- Expanded Detail -->
				{#if expandedItem === item.id}
					<div transition:slide={{ duration: 200 }}>
						<div class="border-t border-slate-100 px-5 py-5">
							<!-- Stats Grid -->
							<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
								<div class="rounded-lg bg-slate-50 p-3">
									<p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">현재 가격</p>
									<p class="mt-1.5 text-xl font-bold tabular-nums text-slate-900">
										{formatPrice(item.currentPrice, item.currency)}
									</p>
								</div>
								<div class="rounded-lg bg-slate-50 p-3">
									<p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">마지막 수집</p>
									<p class="mt-1.5 text-sm font-medium text-slate-700">
										{formatDateTime(item.lastCrawledAt)}
									</p>
								</div>
								<div class="rounded-lg bg-slate-50 p-3">
									<p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">등록일</p>
									<p class="mt-1.5 text-sm font-medium text-slate-700">
										{formatDateTime(item.createdAt)}
									</p>
								</div>
							</div>

							<!-- Price History -->
							{#if item.priceHistory.length > 0}
								<div class="mt-5">
									<p class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">가격 변동</p>
									<div class="flex items-end gap-1.5">
										{#each item.priceHistory as point, i}
											{@const maxPrice = Math.max(...item.priceHistory.map((p) => p.price))}
											{@const minPrice = Math.min(...item.priceHistory.map((p) => p.price))}
											{@const range = maxPrice - minPrice || 1}
											{@const height = 24 + ((point.price - minPrice) / range) * 56}
											{@const isLatest = i === item.priceHistory.length - 1}
											{@const prevPrice = i > 0 ? item.priceHistory[i - 1].price : point.price}
											{@const isUp = point.price > prevPrice}
											{@const isDown = point.price < prevPrice}
											<div class="group/bar flex flex-1 flex-col items-center gap-1">
												<span class="text-[10px] font-medium tabular-nums {isLatest ? 'text-blue-600' : 'text-slate-400'}">
													{formatPrice(point.price, item.currency)}
												</span>
												<div
													class="w-full max-w-[40px] rounded-md transition-colors {isLatest
														? 'bg-blue-500 shadow-sm shadow-blue-500/30'
														: isUp
															? 'bg-rose-200'
															: isDown
																? 'bg-emerald-200'
																: 'bg-slate-200'}"
													style="height: {height}px"
												></div>
												<span class="text-[10px] tabular-nums text-slate-400">
													{point.date.slice(5)}
												</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Actions -->
							<div class="mt-5 flex gap-2">
								<button
									class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
								>
									<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
									</svg>
									수동 수집
								</button>
								<button
									class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
								>
									<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
									</svg>
									상품 페이지
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}

		{#if data.items.data.length === 0}
			<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center">
				<svg class="mx-auto size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
				</svg>
				<p class="mt-3 text-sm font-medium text-slate-500">해당 조건의 추적 상품이 없습니다</p>
				<p class="mt-1 text-xs text-slate-400">필터를 변경하거나 새 상품을 등록해 보세요</p>
			</div>
		{/if}
	</div>

	<!-- Pagination -->
	{#if data.items.totalPages > 1}
		<div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
			<p class="text-xs tabular-nums text-slate-500">
				<span class="font-medium text-slate-700">{(data.items.page - 1) * data.items.limit + 1}–{Math.min(data.items.page * data.items.limit, data.items.total)}</span>
				/ {data.items.total}건
			</p>
			<div class="flex items-center gap-0.5">
				<button
					onclick={() => goToPage(data.items.page - 1)}
					disabled={data.items.page <= 1}
					class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</button>
				{#each Array.from({ length: data.items.totalPages }, (_, i) => i + 1) as p}
					<button
						onclick={() => goToPage(p)}
						class="size-8 rounded-lg text-xs font-semibold transition-colors {p === data.items.page
							? 'bg-slate-900 text-white'
							: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
					>
						{p}
					</button>
				{/each}
				<button
					onclick={() => goToPage(data.items.page + 1)}
					disabled={data.items.page >= data.items.totalPages}
					class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
				>
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>
