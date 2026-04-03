<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { TokenStatusEntry } from '$lib/types/api';

	let { data, form } = $props();

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let loading = $state<string | null>(null);

	function showToast(msg: string, type: 'success' | 'error') {
		toast = { message: msg, type };
		setTimeout(() => (toast = null), 3000);
	}

	$effect(() => {
		if (form?.success) {
			showToast(form.message ?? '작업이 완료되었습니다.', 'success');
			invalidateAll();
		} else if (form?.error) {
			showToast(form.error as string, 'error');
		}
		loading = null;
	});

	function statusColor(status: string): string {
		switch (status) {
			case 'ACTIVE': return 'emerald';
			case 'EXPIRING_SOON': return 'amber';
			case 'EXPIRED': return 'rose';
			case 'NOT_FOUND': return 'slate';
			default: return 'slate';
		}
	}

	function statusLabel(status: string): string {
		switch (status) {
			case 'ACTIVE': return '정상';
			case 'EXPIRING_SOON': return '곧 만료';
			case 'EXPIRED': return '만료됨';
			case 'NOT_FOUND': return '미등록';
			default: return status;
		}
	}

	function appTypeLabel(appType: string): string {
		return appType === 'AFFILIATE' ? 'Affiliate' : 'Dropshipping';
	}

	function formatDateTime(dateStr: string | null | undefined) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit'
		});
	}

	function getToken(appType: string): TokenStatusEntry | undefined {
		return data.tokens.find((t: TokenStatusEntry) => t.app_type === appType);
	}

	const appTypes = ['AFFILIATE', 'DROPSHIPPING'] as const;
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
		<h2 class="text-2xl font-bold text-slate-900">토큰 관리</h2>
		<p class="mt-1 text-sm text-slate-500">AliExpress OAuth 토큰 상태를 확인하고 갱신합니다.</p>
	</div>

	<!-- Token Cards -->
	<div class="grid gap-4 sm:grid-cols-2">
		{#each appTypes as appType}
			{@const token = getToken(appType)}
			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<!-- Card Header -->
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-slate-900">{appTypeLabel(appType)}</h3>
					{#if token}
						{@const color = statusColor(token.status)}
						<span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold
							{color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
							 color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
							 color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
							 'bg-slate-500/10 text-slate-600'}">
							{#if token.status === 'ACTIVE'}
								<span class="size-1.5 rounded-full bg-emerald-500"></span>
							{:else if token.status === 'EXPIRING_SOON'}
								<span class="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
							{:else if token.status === 'EXPIRED'}
								<span class="size-1.5 rounded-full bg-rose-500"></span>
							{/if}
							{statusLabel(token.status)}
						</span>
					{:else}
						<span class="inline-flex items-center rounded-md bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600">
							미등록
						</span>
					{/if}
				</div>

				<!-- Token Details -->
				{#if token && token.status !== 'NOT_FOUND'}
					<dl class="mt-4 space-y-3">
						{#if token.seller_id}
							<div class="flex justify-between">
								<dt class="text-xs text-slate-500">Seller ID</dt>
								<dd class="text-sm font-medium text-slate-900">{token.seller_id}</dd>
							</div>
						{/if}
						{#if token.user_nick}
							<div class="flex justify-between">
								<dt class="text-xs text-slate-500">닉네임</dt>
								<dd class="text-sm font-medium text-slate-900">{token.user_nick}</dd>
							</div>
						{/if}
						<div class="flex justify-between">
							<dt class="text-xs text-slate-500">Access Token 만료</dt>
							<dd class="text-sm text-slate-700">{formatDateTime(token.access_token_expires_at)}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-xs text-slate-500">Refresh Token 만료</dt>
							<dd class="text-sm text-slate-700">{formatDateTime(token.refresh_token_expires_at)}</dd>
						</div>
						{#if token.last_refreshed_at}
							<div class="flex justify-between">
								<dt class="text-xs text-slate-500">마지막 갱신</dt>
								<dd class="text-sm text-slate-700">{formatDateTime(token.last_refreshed_at)}</dd>
							</div>
						{/if}
					</dl>
				{:else}
					<div class="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
						<p class="text-sm text-slate-500">등록된 토큰이 없습니다.</p>
						<p class="mt-1 text-xs text-slate-400">OAuth 인증을 진행해주세요.</p>
					</div>
				{/if}

				<!-- Actions -->
				<div class="mt-5 flex gap-2">
					{#if token && token.status !== 'NOT_FOUND'}
						<form method="POST" action="?/refresh" class="flex-1"
							use:enhance={() => { loading = `refresh-${appType}`; return async ({ update }) => { await update(); }; }}>
							<input type="hidden" name="app_type" value={appType} />
							<button type="submit" disabled={loading === `refresh-${appType}`}
								class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
								{loading === `refresh-${appType}` ? '갱신 중...' : '토큰 갱신'}
							</button>
						</form>
					{/if}
					<form method="POST" action="?/authorize" class="flex-1"
						use:enhance={() => { loading = `authorize-${appType}`; return async ({ update }) => { await update(); }; }}>
						<input type="hidden" name="app_type" value={appType} />
						<button type="submit" disabled={loading === `authorize-${appType}`}
							class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
							{loading === `authorize-${appType}` ? '생성 중...' : 'OAuth 인증'}
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>
