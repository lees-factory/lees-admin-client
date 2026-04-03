<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { BatchJobStatus } from '$lib/types/api';

	let { data, form } = $props();

	const tabs = [
		{ id: 'hot-products', label: '인기상품 적재', icon: 'fire' },
		{ id: 'sku', label: 'SKU 보강', icon: 'cube' },
		{ id: 'price', label: '가격 갱신', icon: 'currency' }
	] as const;

	type TabId = (typeof tabs)[number]['id'];
	let activeTab = $state<TabId>('hot-products');

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let loading = $state<string | null>(null);
	let skuTarget = $state<'hot-products' | 'all'>('hot-products');

	function showToast(msg: string, type: 'success' | 'error') {
		toast = { message: msg, type };
		setTimeout(() => (toast = null), 3000);
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message ?? '작업이 시작되었습니다.', 'success');
			invalidateAll();
		} else if (form?.error) {
			showToast(form.error as string, 'error');
		}
		loading = null;
	});

	function statusColor(status: string) {
		switch (status) {
			case 'COMPLETED': return 'emerald';
			case 'RUNNING': return 'blue';
			case 'QUEUED': return 'slate';
			case 'FAILED': return 'rose';
			default: return 'slate';
		}
	}

	function statusLabel(status: string) {
		switch (status) {
			case 'COMPLETED': return '완료';
			case 'RUNNING': return '실행 중';
			case 'QUEUED': return '대기';
			case 'FAILED': return '실패';
			default: return status;
		}
	}

	function formatDateTime(dateStr: string | null | undefined) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', second: '2-digit'
		});
	}

	let job = $derived(data.batchStatus as BatchJobStatus | null);
	let progressPercent = $derived(
		job && job.total_count > 0
			? Math.round(((job.success_count + job.fail_count + job.skipped_count) / job.total_count) * 100)
			: 0
	);
</script>

<!-- Toast -->
{#if toast}
	<div
		class="fixed top-20 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg {toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		{toast.message}
	</div>
{/if}

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900">배치 관리</h2>
		<p class="mt-1 text-sm text-slate-500">배치 작업을 실행하고 상태를 확인합니다.</p>
	</div>

	<!-- Tabs + Content -->
	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<!-- Tab Bar -->
		<div class="flex border-b border-slate-200">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.id)}
					class="relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors
						{activeTab === tab.id
							? 'text-blue-600'
							: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}"
				>
					{#if tab.icon === 'fire'}
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>
					{:else if tab.icon === 'cube'}
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
					{:else}
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					{/if}
					{tab.label}
					{#if activeTab === tab.id}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		<div class="p-6">
			<!-- 인기상품 적재 -->
			{#if activeTab === 'hot-products'}
				<div class="space-y-6">
					<div>
						<h3 class="text-base font-semibold text-slate-900">인기 상품 적재</h3>
						<p class="mt-1 text-xs text-slate-500">AliExpress 인기 상품을 조회하여 hot_product, product 테이블에 적재합니다.</p>
					</div>

					<form method="POST" action="?/loadHotProducts" use:enhance={() => { loading = 'loadHotProducts'; return async ({ update }) => { await update(); }; }}>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label for="keywords" class="block text-xs font-medium text-slate-500">키워드</label>
								<input id="keywords" name="keywords" type="text" placeholder="검색 키워드 (선택)"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
							<div>
								<label for="category_ids" class="block text-xs font-medium text-slate-500">카테고리 ID</label>
								<input id="category_ids" name="category_ids" type="text" placeholder="쉼표 구분 (선택)"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
							<div>
								<label for="sort" class="block text-xs font-medium text-slate-500">정렬</label>
								<input id="sort" name="sort" type="text" placeholder="정렬 기준 (선택)"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
							<div class="grid grid-cols-2 gap-2">
								<div>
									<label for="min_sale_price" class="block text-xs font-medium text-slate-500">최소 가격</label>
									<input id="min_sale_price" name="min_sale_price" type="text" placeholder="USD"
										class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
								</div>
								<div>
									<label for="max_sale_price" class="block text-xs font-medium text-slate-500">최대 가격</label>
									<input id="max_sale_price" name="max_sale_price" type="text" placeholder="USD"
										class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
								</div>
							</div>
						</div>
						<div class="mt-5 flex justify-end">
							<button type="submit" disabled={loading === 'loadHotProducts'}
								class="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
								{loading === 'loadHotProducts' ? '실행 중...' : '적재 실행'}
							</button>
						</div>
					</form>
				</div>

			<!-- SKU 보강 -->
			{:else if activeTab === 'sku'}
				<div class="space-y-6">
					<div>
						<h3 class="text-base font-semibold text-slate-900">SKU 보강</h3>
						<p class="mt-1 text-xs text-slate-500">Dropshipping API로 SKU를 적재합니다.</p>
					</div>

					<!-- 대상 선택 -->
					<div class="space-y-3">
						<p class="text-xs font-medium text-slate-500">대상 선택</p>
						<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {skuTarget === 'hot-products' ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}">
							<input type="radio" bind:group={skuTarget} value="hot-products" class="mt-0.5 size-4 text-blue-600 focus:ring-blue-500" />
							<div>
								<p class="text-sm font-semibold text-slate-900">인기 상품만</p>
								<p class="text-xs text-slate-500">SKU가 없는 인기 상품만 대상으로 합니다.</p>
							</div>
						</label>
						<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {skuTarget === 'all' ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}">
							<input type="radio" bind:group={skuTarget} value="all" class="mt-0.5 size-4 text-blue-600 focus:ring-blue-500" />
							<div>
								<p class="text-sm font-semibold text-slate-900">전체 상품</p>
								<p class="text-xs text-slate-500">모든 상품을 대상으로 합니다. 시간이 오래 걸릴 수 있습니다.</p>
							</div>
						</label>
					</div>

					{#if skuTarget === 'all'}
						<div class="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
							<p class="text-xs text-amber-700">전체 상품을 대상으로 하므로 시간이 오래 걸릴 수 있습니다.</p>
						</div>
					{/if}

					<div class="flex justify-end">
						{#if skuTarget === 'hot-products'}
							<form method="POST" action="?/enrichHotProductSkus" use:enhance={() => { loading = 'enrichHotProductSkus'; return async ({ update }) => { await update(); }; }}>
								<button type="submit" disabled={loading === 'enrichHotProductSkus'}
									class="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
									{loading === 'enrichHotProductSkus' ? '실행 중...' : 'SKU 보강 실행'}
								</button>
							</form>
						{:else}
							<form method="POST" action="?/enrichAllSkus" use:enhance={() => { loading = 'enrichAllSkus'; return async ({ update }) => { await update(); }; }}>
								<button type="submit" disabled={loading === 'enrichAllSkus'}
									class="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
									{loading === 'enrichAllSkus' ? '실행 중...' : '전체 SKU 보강 실행'}
								</button>
							</form>
						{/if}
					</div>
				</div>

			<!-- 가격 갱신 -->
			{:else if activeTab === 'price'}
				<div class="space-y-6">
					<div>
						<h3 class="text-base font-semibold text-slate-900">가격 갱신</h3>
						<p class="mt-1 text-xs text-slate-500">대상 상품의 가격을 AliExpress API에서 다시 조회하여 갱신합니다.</p>
					</div>

					<form method="POST" action="?/updatePrices" use:enhance={() => { loading = 'updatePrices'; return async ({ update }) => { await update(); }; }}>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label for="collection_source" class="block text-xs font-medium text-slate-500">수집 경로</label>
								<input id="collection_source" name="collection_source" type="text" placeholder="e.g. HOT_PRODUCT_QUERY (선택)"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
							<div>
								<label for="market" class="block text-xs font-medium text-slate-500">마켓</label>
								<select id="market" name="market"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
									<option value="">전체</option>
									<option value="ALIEXPRESS">AliExpress</option>
									<option value="COUPANG">Coupang</option>
								</select>
							</div>
							<div>
								<label for="product_ids" class="block text-xs font-medium text-slate-500">상품 ID</label>
								<input id="product_ids" name="product_ids" type="text" placeholder="쉼표 구분 (선택)"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
							<div>
								<label for="collected_before" class="block text-xs font-medium text-slate-500">수집 시각 이전</label>
								<input id="collected_before" name="collected_before" type="datetime-local"
									class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none" />
							</div>
						</div>
						<div class="mt-4 flex items-center gap-2">
							<input id="force" name="force" type="checkbox" class="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
							<label for="force" class="text-xs font-medium text-slate-500">강제 갱신 (최근 갱신된 상품 포함)</label>
						</div>
						<input type="hidden" name="requested_by" value="admin" />
						<div class="mt-5 flex justify-end">
							<button type="submit" disabled={loading === 'updatePrices'}
								class="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
								{loading === 'updatePrices' ? '실행 중...' : '가격 갱신 실행'}
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>

	<!-- 최근 배치 상태 -->
	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-400">최근 실행 결과</h3>

		{#if job && job.status}
			{@const color = statusColor(job.status)}
			<div class="mt-4 space-y-4">
				<div class="flex flex-wrap items-center gap-3">
					<span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold
						{color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
						 color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
						 color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
						 'bg-slate-500/10 text-slate-600'}">
						{#if job.status === 'RUNNING'}
							<span class="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
						{/if}
						{statusLabel(job.status)}
					</span>
					<span class="text-xs text-slate-500">
						{job.trigger_type === 'MANUAL' ? '수동 실행' : '스케줄'} · 요청 {formatDateTime(job.requested_at)}
					</span>
				</div>

				<!-- Progress -->
				{#if job.total_count > 0}
					<div>
						<div class="mb-1 flex items-center justify-between text-xs text-slate-500">
							<span>진행률</span>
							<span class="font-semibold text-slate-700">{progressPercent}%</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
							<div class="flex h-full">
								{#if job.success_count > 0}
									<div class="bg-emerald-500 transition-all" style="width: {(job.success_count / job.total_count) * 100}%"></div>
								{/if}
								{#if job.fail_count > 0}
									<div class="bg-rose-500 transition-all" style="width: {(job.fail_count / job.total_count) * 100}%"></div>
								{/if}
								{#if job.skipped_count > 0}
									<div class="bg-slate-300 transition-all" style="width: {(job.skipped_count / job.total_count) * 100}%"></div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Stats -->
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div class="rounded-lg bg-slate-50 p-3 text-center">
							<p class="text-xs text-slate-500">전체</p>
							<p class="text-lg font-bold text-slate-900">{job.total_count}</p>
						</div>
						<div class="rounded-lg bg-emerald-50 p-3 text-center">
							<p class="text-xs text-emerald-600">성공</p>
							<p class="text-lg font-bold text-emerald-700">{job.success_count}</p>
						</div>
						<div class="rounded-lg bg-rose-50 p-3 text-center">
							<p class="text-xs text-rose-600">실패</p>
							<p class="text-lg font-bold text-rose-700">{job.fail_count}</p>
						</div>
						<div class="rounded-lg bg-slate-50 p-3 text-center">
							<p class="text-xs text-slate-500">스킵</p>
							<p class="text-lg font-bold text-slate-600">{job.skipped_count}</p>
						</div>
					</div>
				{/if}

				<!-- Timestamps -->
				<div class="flex flex-wrap gap-4 text-xs text-slate-500">
					{#if job.started_at}
						<span>시작: {formatDateTime(job.started_at)}</span>
					{/if}
					{#if job.finished_at}
						<span>완료: {formatDateTime(job.finished_at)}</span>
					{/if}
				</div>

				<!-- Error -->
				{#if job.last_error}
					<div class="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
						<p class="text-xs font-medium text-rose-700">마지막 에러</p>
						<p class="mt-1 text-sm text-rose-600">{job.last_error}</p>
					</div>
				{/if}
			</div>
		{:else}
			<p class="mt-3 text-sm text-slate-400">실행된 배치 작업이 없습니다.</p>
		{/if}
	</div>
</div>
