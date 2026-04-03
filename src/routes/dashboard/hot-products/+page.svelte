<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);

	let marketInit = $derived(data.filters.market);
	let marketFilter = $state<string>('all');

	$effect(() => {
		marketFilter = marketInit;
	});

	$effect(() => {
		if (form?.success) {
			showToast('노출 상태가 변경되었습니다.', 'success');
		} else if (form?.error) {
			showToast(form.error as string, 'error');
		}
	});

	function showToast(message: string, type: 'success' | 'error') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	function applyMarketFilter(market: string) {
		const params = new URLSearchParams();
		if (market !== 'all') params.set('market', market);
		params.set('page', '1');
		goto(`/dashboard/hot-products?${params.toString()}`);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		goto(`/dashboard/hot-products?${params.toString()}`);
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

	let activeCount = $derived(data.hotProducts.data.filter((p: any) => p.active).length);

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
		coupang: { label: 'Coupang', color: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
		aliexpress: { label: 'AliExpress', color: 'bg-orange-500/10 text-orange-600', dot: 'bg-orange-500' },
		amazon: { label: 'Amazon', color: 'bg-amber-500/10 text-amber-700', dot: 'bg-amber-500' },
	};

	const crawlStatusConfig: Record<string, { label: string; color: string; icon: string }> = {
		success: {
			label: '성공',
			color: 'text-emerald-600 bg-emerald-500/10',
			icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		failed: {
			label: '실패',
			color: 'text-rose-600 bg-rose-500/10',
			icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		pending: {
			label: '대기',
			color: 'text-slate-500 bg-slate-500/10',
			icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	};
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- DEV Banner -->
	<div class="rounded-lg border-2 border-dashed border-rose-400 bg-rose-50 px-4 py-3">
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">DEV</span>
			<p class="text-xs font-medium text-rose-700">이 페이지는 Mock 데이터를 사용합니다. 실제 API 연동 전 개발용 화면입니다.</p>
		</div>
	</div>

	<!-- Toast -->
	{#if toast}
		<div
			class="fixed top-20 right-6 z-50 rounded-lg px-4 py-3 shadow-lg {toast.type === 'success'
				? 'bg-emerald-600 text-white'
				: 'bg-rose-600 text-white'}"
			in:fade={{ duration: 150 }}
			out:fade={{ duration: 150 }}
		>
			<p class="text-sm font-medium">{toast.message}</p>
		</div>
	{/if}

	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight text-slate-900">핫 프로덕트 관리</h2>
			<p class="mt-1 text-sm text-slate-500">
				크롤 데이터 정제 및 노출 관리 &middot;
				<span class="font-semibold text-emerald-600">{activeCount}</span>개 노출 /
				<span class="text-slate-700">{data.hotProducts.total}</span>개 전체
			</p>
		</div>
	</div>

	<!-- Filter -->
	<div class="flex gap-1.5">
		{#each [{ value: 'all', label: '전체' }, { value: 'coupang', label: 'Coupang' }, { value: 'aliexpress', label: 'AliExpress' }, { value: 'amazon', label: 'Amazon' }] as f}
			<button
				onclick={() => applyMarketFilter(f.value)}
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {marketFilter === f.value
					? 'bg-slate-900 text-white'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				{f.label}
			</button>
		{/each}
	</div>

	<!-- Products Table -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/80">
					<tr>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">상품명</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">마켓</th>
						<th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">현재가</th>
						<th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">수집 상태</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">마지막 수집</th>
						<th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">노출</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.hotProducts.data as product, index (product.id)}
						{@const market = marketConfig[product.market] ?? { label: product.market, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }}
						{@const crawl = crawlStatusConfig[product.crawlStatus] ?? crawlStatusConfig.pending}
						<tr class="transition-colors hover:bg-slate-50/50 {product.active ? '' : 'opacity-50'}">
							<td class="px-5 py-3.5 text-xs tabular-nums text-slate-400">
								{(data.hotProducts.page - 1) * data.hotProducts.limit + index + 1}
							</td>
							<td class="max-w-[280px] px-5 py-3.5">
								<a href={product.productUrl} target="_blank" rel="noopener noreferrer" class="group/link flex items-center gap-1 truncate text-sm font-medium text-slate-800 hover:text-blue-600 hover:underline">
								{product.productName}
								<svg class="size-3 shrink-0 text-slate-400 group-hover/link:text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
							</a>
							</td>
							<td class="px-5 py-3.5">
								<span class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold {market.color}">
									<span class="size-1.5 rounded-full {market.dot}"></span>
									{market.label}
								</span>
							</td>
							<td class="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-slate-800">
								{formatPrice(product.currentPrice, product.currency)}
							</td>
							<td class="px-5 py-3.5 text-center">
								<span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold {crawl.color}">
									<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" d={crawl.icon} />
									</svg>
									{crawl.label}
								</span>
							</td>
							<td class="px-5 py-3.5 text-xs tabular-nums text-slate-500">
								{formatDateTime(product.lastCrawledAt)}
							</td>
							<td class="px-5 py-3.5 text-center">
								<form method="POST" action="?/toggleActive" use:enhance={() => { return async ({ update }) => { await update({ reset: false }); }; }} class="inline">
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="active" value={product.active ? 'false' : 'true'} />
									<button
										type="submit"
										class="inline-flex items-center justify-center rounded-full transition-colors {product.active
											? 'text-emerald-500 hover:text-emerald-600'
											: 'text-slate-300 hover:text-slate-400'}"
										title={product.active ? '미노출로 변경' : '노출로 변경'}
										aria-label="{product.productName} {product.active ? '미노출로 변경' : '노출로 변경'}"
									>
										{#if product.active}
											<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
												<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
											</svg>
										{:else}
											<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
												<circle cx="12" cy="12" r="9.75" />
											</svg>
										{/if}
									</button>
								</form>
							</td>
						</tr>
					{/each}

					{#if data.hotProducts.data.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-16 text-center">
								<svg class="mx-auto size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
								</svg>
								<p class="mt-3 text-sm font-medium text-slate-500">
									{#if marketFilter !== 'all'}
										해당 마켓의 핫 프로덕트가 없습니다
									{:else}
										등록된 핫 프로덕트가 없습니다
									{/if}
								</p>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.hotProducts.totalPages > 1}
			<div class="flex flex-col items-center gap-2 border-t border-slate-200 px-4 py-3">
				<div class="flex items-center gap-1">
					<button
						onclick={() => goToPage(data.hotProducts.page - 1)}
						disabled={data.hotProducts.page <= 1}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					{#each getPageNumbers(data.hotProducts.page, data.hotProducts.totalPages) as p}
						{#if p === '...'}
							<span class="size-10 flex items-center justify-center text-sm text-slate-400">…</span>
						{:else}
							<button
								onclick={() => goToPage(p as number)}
								class="size-10 rounded-lg text-sm font-semibold transition-colors {p === data.hotProducts.page
									? 'bg-slate-900 text-white shadow-sm'
									: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
							>
								{p}
							</button>
						{/if}
					{/each}
					<button
						onclick={() => goToPage(data.hotProducts.page + 1)}
						disabled={data.hotProducts.page >= data.hotProducts.totalPages}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				</div>
				<p class="text-xs tabular-nums text-slate-500">
					<span class="font-medium text-slate-700">{(data.hotProducts.page - 1) * data.hotProducts.limit + 1}–{Math.min(data.hotProducts.page * data.hotProducts.limit, data.hotProducts.total)}</span>
					/ {data.hotProducts.total}건
				</p>
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
		<div class="flex gap-3">
			<svg class="mt-0.5 size-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
			</svg>
			<div class="text-sm text-blue-700">
				<p class="font-medium">관리 안내</p>
				<ul class="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-blue-600">
					<li><strong>노출</strong> 토글로 메인홈 노출 여부를 개별 제어할 수 있습니다.</li>
					<li>수집/크롤은 <strong>크롤 메뉴</strong>에서 실행합니다.</li>
				</ul>
			</div>
		</div>
	</div>
</div>
