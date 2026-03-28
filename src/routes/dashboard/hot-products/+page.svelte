<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			toast = { message: `활성 상품 ${(form as any).count ?? ''}건 수집을 시작했습니다.`, type: 'success' };
		} else if (form?.error) {
			toast = { message: form.error as string, type: 'error' };
		}

		if (toast) {
			const timer = setTimeout(() => (toast = null), 3000);
			return () => clearTimeout(timer);
		}
	});

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
		gmarket: { label: 'G-Market', color: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' }
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
			<h2 class="text-2xl font-bold tracking-tight text-slate-900">핫 프로덕트 갱신</h2>
			<p class="mt-1 text-sm text-slate-500">
				메인홈 노출 상품 가격 수동 수집 &middot;
				<span class="font-semibold text-slate-700">{data.hotProducts.length}</span>개 상품
			</p>
		</div>
		<form
			method="POST"
			action="?/crawlAll"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
		>
			<button
				type="submit"
				disabled={isSubmitting || data.hotProducts.length === 0}
				class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
			>
				{#if isSubmitting}
					<svg class="size-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
					</svg>
					수집 중…
				{:else}
					<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
					</svg>
					전체 수동 수집
				{/if}
			</button>
		</form>
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
						<th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">상태</th>
						<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">마지막 수집</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.hotProducts as product, index (product.id)}
						{@const market = marketConfig[product.market] ?? { label: product.market, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }}
						{@const crawl = crawlStatusConfig[product.crawlStatus] ?? crawlStatusConfig.pending}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-5 py-3.5 text-xs tabular-nums text-slate-400">{index + 1}</td>
							<td class="max-w-[280px] px-5 py-3.5">
								<p class="truncate text-sm font-medium text-slate-800">{product.productName}</p>
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
						</tr>
					{/each}

					{#if data.hotProducts.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-16 text-center">
								<svg class="mx-auto size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
								</svg>
								<p class="mt-3 text-sm font-medium text-slate-500">등록된 핫 프로덕트가 없습니다</p>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Info -->
	<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
		<div class="flex gap-3">
			<svg class="mt-0.5 size-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
			</svg>
			<div class="text-sm text-blue-700">
				<p class="font-medium">수동 수집 안내</p>
				<ul class="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-blue-600">
					<li><strong>전체 수동 수집</strong> 클릭 시 활성 상품의 가격을 즉시 갱신합니다.</li>
					<li>수집 결과는 메인홈에 실시간 반영됩니다.</li>
				</ul>
			</div>
		</div>
	</div>
</div>
