<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { fade } from 'svelte/transition';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { ProductLanguage } from '$lib/types/api';

	let { data } = $props();

	let filtersLanguage = $derived(data.filters.language as ProductLanguage);
	let filtersCollectionSource = $derived(data.filters.collection_source as string);

	let language = $state<ProductLanguage>('KO');
	let collectionSource = $state('');

	$effect(() => {
		language = filtersLanguage;
		collectionSource = filtersCollectionSource;
	});

	function applyFilters() {
		const params = new SvelteURLSearchParams();
		if (language) params.set('language', language);
		if (collectionSource) params.set('collection_source', collectionSource);
		goto(resolve(`/dashboard/products?${params.toString()}`));
	}

	function formatPrice(price: string, currency: string) {
		if (!price) return '-';
		const num = parseFloat(price);
		if (isNaN(num)) return price;
		if (currency === 'KRW') return `₩${num.toLocaleString('ko-KR')}`;
		return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
	}

	function marketBadgeClass(market: string) {
		switch (market) {
			case 'ALIEXPRESS':
				return 'bg-orange-500/10 text-orange-600';
			case 'COUPANG':
				return 'bg-red-500/10 text-red-600';
			default:
				return 'bg-slate-500/10 text-slate-600';
		}
	}

	function marketLabel(market: string) {
		switch (market) {
			case 'ALIEXPRESS':
				return 'AliExpress';
			case 'COUPANG':
				return 'Coupang';
			default:
				return market;
		}
	}
</script>

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900">상품 관리</h2>
			<p class="mt-1 text-sm text-slate-500">
				전체 {data.products.items.length}건 · {data.products.language === 'KO'
					? '한국어 (KRW)'
					: 'English (USD)'}
			</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				applyFilters();
			}}
			class="flex flex-col gap-3 sm:flex-row sm:items-end"
		>
			<div>
				<label for="language" class="block text-xs font-medium text-slate-500">언어/통화</label>
				<select
					id="language"
					bind:value={language}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="KO">한국어 (KRW)</option>
					<option value="EN">English (USD)</option>
				</select>
			</div>
			<div class="flex-1">
				<label for="collection_source" class="block text-xs font-medium text-slate-500"
					>수집 경로</label
				>
				<input
					id="collection_source"
					type="text"
					bind:value={collectionSource}
					placeholder="e.g. HOT_PRODUCT_QUERY (선택)"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			<button
				type="submit"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				조회
			</button>
		</form>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/50">
					<tr>
						<th
							class="px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase"
							>상품</th
						>
						<th
							class="px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase"
							>마켓</th
						>
						<th
							class="hidden px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase sm:table-cell"
							>외부 ID</th
						>
						<th
							class="px-5 py-3 text-right text-xs font-semibold tracking-wider text-slate-400 uppercase"
							>가격</th
						>
						<th
							class="hidden px-5 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase sm:table-cell"
							>수집 경로</th
						>
						<th
							class="px-5 py-3 text-center text-xs font-semibold tracking-wider text-slate-400 uppercase"
							>링크</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each data.products.items as product (product.id)}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-5 py-3">
								<div class="flex items-center gap-3">
									{#if product.main_image_url}
										<img
											src={product.main_image_url}
											alt=""
											class="size-10 shrink-0 rounded-lg border border-slate-200 object-cover"
											loading="lazy"
										/>
									{:else}
										<div
											class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
										>
											<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
												/>
											</svg>
										</div>
									{/if}
									<p
										class="max-w-xs truncate text-sm font-medium text-slate-900"
										title={product.title}
									>
										{product.title}
									</p>
								</div>
							</td>
							<td class="px-5 py-3 whitespace-nowrap">
								<span
									class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold {marketBadgeClass(
										product.market
									)}"
								>
									{marketLabel(product.market)}
								</span>
							</td>
							<td class="hidden px-5 py-3 text-sm whitespace-nowrap text-slate-500 sm:table-cell">
								<span class="font-mono text-xs">{product.external_product_id}</span>
							</td>
							<td
								class="px-5 py-3 text-right text-sm font-semibold whitespace-nowrap text-slate-900"
							>
								{formatPrice(product.current_price, product.currency)}
							</td>
							<td class="hidden px-5 py-3 text-sm whitespace-nowrap text-slate-500 sm:table-cell">
								{product.collection_source}
							</td>
							<td class="px-5 py-3 text-center whitespace-nowrap">
								<a
									aria-label="상품 링크"
									href={resolve(product.product_url || product.original_url)}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
								>
									<svg
										class="size-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
										/>
									</svg>
								</a>
							</td>
						</tr>
					{/each}

					{#if data.products.items.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-sm text-slate-500">
								상품이 없습니다.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
