<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import type { AppType, TokenStatusEntry } from '$lib/types/api';

	let { data, form } = $props();

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let loading = $state<string | null>(null);
	let pendingAuthorize = $state<{
		appType: AppType;
		url: string;
		popupBlocked: boolean;
	} | null>(null);
	let refreshingStatus = $state(false);

	function showToast(msg: string, type: 'success' | 'error') {
		toast = { message: msg, type };
		setTimeout(() => (toast = null), 3000);
	}

	async function refreshStatus() {
		refreshingStatus = true;
		await invalidateAll();
		refreshingStatus = false;
		pendingAuthorize = null;
		showToast('토큰 상태를 새로고침했습니다.', 'success');
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return 'emerald';
			case 'EXPIRING_SOON':
				return 'amber';
			case 'EXPIRED':
				return 'rose';
			case 'NOT_FOUND':
				return 'slate';
			default:
				return 'slate';
		}
	}

	function statusLabel(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return '정상';
			case 'EXPIRING_SOON':
				return '곧 만료';
			case 'EXPIRED':
				return '만료됨';
			case 'NOT_FOUND':
				return '미등록';
			default:
				return status;
		}
	}

	function appTypeLabel(appType: string): string {
		return appType === 'AFFILIATE' ? 'Affiliate' : 'Dropshipping';
	}

	function formatDateTime(dateStr: string | null | undefined) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
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
		class="fixed top-20 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg {toast.type ===
		'success'
			? 'bg-emerald-600'
			: 'bg-rose-600'}"
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

	<!-- Authorization Progress -->
	{#if pendingAuthorize}
		<div
			class="rounded-xl border border-blue-100 bg-blue-50/50 p-5"
			in:fade={{ duration: 200 }}
		>
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<h3 class="text-sm font-semibold text-slate-900">
						{pendingAuthorize.appType === 'AFFILIATE' ? 'Affiliate' : 'Dropshipping'} OAuth 승인
						진행 중
					</h3>
					<p class="mt-1 text-sm text-slate-600">
						{#if pendingAuthorize.popupBlocked}
							팝업이 차단되어 새 탭이 열리지 않았습니다. 아래 링크를 눌러 AliExpress 승인 페이지로
							이동하세요.
						{:else}
							새 탭에서 AliExpress 판매자 승인을 완료하면 callback이 자동으로 토큰을 저장합니다.
						{/if}
					</p>
					<a
						href={pendingAuthorize.url}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
					>
						승인 페이지 열기
						<svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
								clip-rule="evenodd"
							/>
							<path
								fill-rule="evenodd"
								d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
								clip-rule="evenodd"
							/>
						</svg>
					</a>
				</div>
				<button
					type="button"
					onclick={refreshStatus}
					disabled={refreshingStatus}
					class="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
				>
					{refreshingStatus ? '확인 중...' : '상태 새로고침'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Token Cards -->
	<div class="grid gap-4 sm:grid-cols-2">
		{#each appTypes as appType (appType)}
			{@const token = getToken(appType)}
			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<!-- Card Header -->
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-slate-900">{appTypeLabel(appType)}</h3>
					{#if token}
						{@const color = statusColor(token.status)}
						<span
							class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold
							{color === 'emerald'
								? 'bg-emerald-500/10 text-emerald-600'
								: color === 'amber'
									? 'bg-amber-500/10 text-amber-600'
									: color === 'rose'
										? 'bg-rose-500/10 text-rose-600'
										: 'bg-slate-500/10 text-slate-600'}"
						>
							{#if token.status === 'ACTIVE'}
								<span class="size-1.5 rounded-full bg-emerald-500"></span>
							{:else if token.status === 'EXPIRING_SOON'}
								<span class="size-1.5 animate-pulse rounded-full bg-amber-500"></span>
							{:else if token.status === 'EXPIRED'}
								<span class="size-1.5 rounded-full bg-rose-500"></span>
							{/if}
							{statusLabel(token.status)}
						</span>
					{:else}
						<span
							class="inline-flex items-center rounded-md bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600"
						>
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
							<dd class="text-sm text-slate-700">
								{formatDateTime(token.access_token_expires_at)}
							</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-xs text-slate-500">Refresh Token 만료</dt>
							<dd class="text-sm text-slate-700">
								{formatDateTime(token.refresh_token_expires_at)}
							</dd>
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
						<form
							method="POST"
							action="?/refresh"
							class="flex-1"
							use:enhance={() => {
								loading = `refresh-${appType}`;
								return async ({ result }) => {
									loading = null;
									if (result.type === 'success' && result.data?.success) {
										showToast(
											(result.data.message as string) ?? '토큰이 갱신되었습니다.',
											'success'
										);
										await invalidateAll();
									} else if (result.type === 'failure') {
										const err = (result.data as { error?: string } | undefined)?.error;
										showToast(err ?? '토큰 갱신에 실패했습니다.', 'error');
									} else if (result.type === 'error') {
										showToast(result.error?.message ?? '요청 실패', 'error');
									}
								};
							}}
						>
							<input type="hidden" name="app_type" value={appType} />
							<button
								type="submit"
								disabled={loading === `refresh-${appType}`}
								class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
							>
								{loading === `refresh-${appType}` ? '갱신 중...' : '토큰 갱신'}
							</button>
						</form>
					{/if}
					<form
						method="POST"
						action="?/authorize"
						class="flex-1"
						use:enhance={() => {
							loading = `authorize-${appType}`;
							// user gesture가 살아있는 동안 빈 탭을 먼저 연다.
							// 이후 서버 응답이 오면 이 탭의 location을 authorization_url로 교체.
							const popup = window.open('about:blank', '_blank');
							return async ({ result }) => {
								loading = null;
								if (result.type === 'success' && result.data?.success) {
									const authData = result.data.data as
										| { authorization_url?: string }
										| undefined;
									const url = authData?.authorization_url;
									if (url) {
										if (popup && !popup.closed) {
											popup.location.href = url;
											pendingAuthorize = { appType, url, popupBlocked: false };
											showToast(
												'승인 창을 열었습니다. 완료 후 상태 새로고침을 눌러주세요.',
												'success'
											);
										} else {
											pendingAuthorize = { appType, url, popupBlocked: true };
											showToast('팝업이 차단되었습니다. 아래 링크를 클릭하세요.', 'error');
										}
									} else {
										popup?.close();
										showToast('authorization_url을 받지 못했습니다.', 'error');
									}
								} else if (result.type === 'failure') {
									popup?.close();
									const err = (result.data as { error?: string } | undefined)?.error;
									showToast(err ?? '인가 URL 생성에 실패했습니다.', 'error');
								} else if (result.type === 'error') {
									popup?.close();
									showToast(result.error?.message ?? '요청 실패', 'error');
								}
							};
						}}
					>
						<input type="hidden" name="app_type" value={appType} />
						<button
							type="submit"
							disabled={loading === `authorize-${appType}`}
							class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
						>
							{loading === `authorize-${appType}` ? '생성 중...' : 'OAuth 인증'}
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>
