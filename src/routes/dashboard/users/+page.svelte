<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let searchInit = $derived(data.filters.search);
	let planInit = $derived(data.filters.plan);
	let statusInit = $derived(data.filters.status);

	let search = $state('');
	let planFilter = $state<string>('all');
	let statusFilter = $state<string>('all');

	$effect(() => {
		search = searchInit;
		planFilter = planInit;
		statusFilter = statusInit;
	});

	let totalPages = $derived(Math.ceil(data.users.total_count / data.users.page_size));

	function applyFilters() {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (planFilter !== 'all') params.set('plan', planFilter);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		params.set('page', '1');
		goto(`/dashboard/users?${params.toString()}`);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		goto(`/dashboard/users?${params.toString()}`);
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

	function formatDate(dateStr: string | null | undefined) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}
</script>

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl font-bold text-slate-900">사용자 관리</h2>
			<p class="mt-1 text-sm text-slate-500">
				전체 {data.users.total_count}명의 사용자
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
			<div class="flex-1">
				<label for="search" class="block text-xs font-medium text-slate-500">검색</label>
				<input
					id="search"
					type="text"
					bind:value={search}
					placeholder="이메일 또는 이름"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
			<div>
				<label for="plan" class="block text-xs font-medium text-slate-500">플랜</label>
				<select
					id="plan"
					bind:value={planFilter}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="all">전체</option>
					<option value="FREE">Free</option>
				</select>
			</div>
			<div>
				<label for="status" class="block text-xs font-medium text-slate-500">상태</label>
				<select
					id="status"
					bind:value={statusFilter}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="all">전체</option>
					<option value="ACTIVE">활성</option>
					<option value="INACTIVE">비활성</option>
				</select>
			</div>
			<button
				type="submit"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				검색
			</button>
		</form>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>사용자</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>플랜</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>상태</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>이메일 인증</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>추적 상품</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>가입일</th
						>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>최근 로그인</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each data.users.items as user}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									<div
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600"
									>
										{(user.display_name || user.email || '?').charAt(0)}
									</div>
									<div class="ml-3">
										<p class="text-sm font-medium text-slate-900">{user.display_name || '-'}</p>
										<p class="text-xs text-slate-500">{user.email}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset"
									>Free</span
								>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if user.status === 'ACTIVE'}
									<span
										class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
										>활성</span
									>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset"
										>비활성</span
									>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if user.email_verified}
									<svg class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								{:else}
									<svg class="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
								{user.tracked_item_count}
							</td>
							<td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
								{formatDate(user.created_at)}
							</td>
							<td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
								{formatDate(user.last_login_at)}
							</td>
						</tr>
					{/each}

					{#if data.users.items.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center text-sm text-slate-500">
								검색 결과가 없습니다.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex flex-col items-center gap-2 border-t border-slate-200 px-4 py-3">
				<div class="flex items-center gap-1">
					<button
						onclick={() => goToPage(data.users.page - 1)}
						disabled={data.users.page <= 1}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					{#each getPageNumbers(data.users.page, totalPages) as p}
						{#if p === '...'}
							<span class="size-10 flex items-center justify-center text-sm text-slate-400">…</span>
						{:else}
							<button
								onclick={() => goToPage(p as number)}
								class="size-10 rounded-lg text-sm font-semibold transition-colors {p === data.users.page
									? 'bg-slate-900 text-white shadow-sm'
									: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
							>
								{p}
							</button>
						{/if}
					{/each}
					<button
						onclick={() => goToPage(data.users.page + 1)}
						disabled={data.users.page >= totalPages}
						class="size-10 rounded-lg flex items-center justify-center text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-30"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				</div>
				<p class="text-xs tabular-nums text-slate-500">
					<span class="font-medium text-slate-700">{(data.users.page - 1) * data.users.page_size + 1}–{Math.min(data.users.page * data.users.page_size, data.users.total_count)}</span>
					/ {data.users.total_count}건
				</p>
			</div>
		{/if}
	</div>
</div>
