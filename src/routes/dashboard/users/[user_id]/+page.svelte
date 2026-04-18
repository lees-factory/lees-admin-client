<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { AdminUserLoginSession } from '$lib/types/api';

	let { data, form } = $props();

	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let pendingAction = $state<string | null>(null);

	function showToast(message: string, type: 'success' | 'error') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	$effect(() => {
		const f = form as
			| { success?: boolean; message?: string; error?: string }
			| null
			| undefined;
		if (f?.success) {
			showToast(f.message ?? '완료', 'success');
			invalidateAll();
		} else if (f?.error) {
			showToast(f.error, 'error');
		}
		pendingAction = null;
	});

	// ─── 필터 로컬 상태 ───────────────────────────────
	let status = $state<string>('all');
	let revoked = $state<string>('any');
	let reuseDetected = $state<string>('any');

	$effect(() => {
		status = data.filters.status;
		revoked = data.filters.revoked;
		reuseDetected = data.filters.reuse_detected;
	});

	function applyFilters() {
		const params = new URLSearchParams();
		if (status !== 'all') params.set('status', status);
		if (revoked !== 'any') params.set('revoked', revoked);
		if (reuseDetected !== 'any') params.set('reuse_detected', reuseDetected);
		const qs = params.toString();
		goto(`/dashboard/users/${encodeURIComponent(data.user_id)}${qs ? `?${qs}` : ''}`);
	}

	function resetFilters() {
		status = 'all';
		revoked = 'any';
		reuseDetected = 'any';
		goto(`/dashboard/users/${encodeURIComponent(data.user_id)}`);
	}

	// ─── family 그룹핑 ────────────────────────────────
	interface FamilyGroup {
		family_id: string;
		sessions: AdminUserLoginSession[];
		active_count: number;
		any_reuse: boolean;
	}

	let families = $derived.by<FamilyGroup[]>(() => {
		const map = new Map<string, FamilyGroup>();
		for (const s of data.sessions as AdminUserLoginSession[]) {
			const key = s.token_family_id || s.id;
			if (!map.has(key)) {
				map.set(key, { family_id: key, sessions: [], active_count: 0, any_reuse: false });
			}
			const g = map.get(key)!;
			g.sessions.push(s);
			if (!s.revoked_at && s.status_reason === 'ACTIVE') g.active_count += 1;
			if (s.reuse_detected_at || s.status_reason === 'REUSED') g.any_reuse = true;
		}
		// 각 그룹 내부: 생성 역순
		for (const g of map.values()) {
			g.sessions.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
		}
		// 그룹 순서: 재사용 감지된 그룹 먼저, 그다음 활성 많은 순, 최신 생성순
		return Array.from(map.values()).sort((a, b) => {
			if (a.any_reuse !== b.any_reuse) return a.any_reuse ? -1 : 1;
			if (a.active_count !== b.active_count) return b.active_count - a.active_count;
			const aLatest = Math.max(...a.sessions.map((s) => new Date(s.created_at).getTime()));
			const bLatest = Math.max(...b.sessions.map((s) => new Date(s.created_at).getTime()));
			return bLatest - aLatest;
		});
	});

	// ─── 포맷터 ───────────────────────────────────────
	function formatDateTime(dateStr: string | null | undefined) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleString('ko-KR', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function sessionStatus(session: AdminUserLoginSession) {
		const reason = session.status_reason;
		if (reason === 'REUSED' || session.reuse_detected_at)
			return { label: '재사용 감지', color: 'bg-rose-500/10 text-rose-600' };
		if (reason === 'REVOKED' || session.revoked_at)
			return { label: '폐기됨', color: 'bg-slate-500/10 text-slate-600' };
		if (reason === 'ROTATED')
			return { label: '로테이션됨', color: 'bg-blue-500/10 text-blue-600' };
		if (reason === 'EXPIRED' || new Date(session.expires_at) < new Date())
			return { label: '만료', color: 'bg-amber-500/10 text-amber-600' };
		return { label: '활성', color: 'bg-emerald-500/10 text-emerald-600' };
	}

	function canRevokeSession(session: AdminUserLoginSession) {
		if (session.revoked_at) return false;
		if (session.status === 'INACTIVE') return false;
		if (
			session.status_reason === 'REVOKED' ||
			session.status_reason === 'EXPIRED' ||
			session.status_reason === 'ROTATED'
		)
			return false;
		return true;
	}

	function canRevokeFamily(g: FamilyGroup) {
		return g.sessions.some(canRevokeSession);
	}

	function familyShortId(id: string) {
		if (id.length <= 10) return id;
		return `${id.slice(0, 6)}…${id.slice(-4)}`;
	}
</script>

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

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<a
				href="/dashboard/users"
				class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
			>
				<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
				사용자 목록
			</a>
			<h2 class="mt-1 text-2xl font-bold text-slate-900">세션 관리</h2>
			<p class="mt-1 text-sm text-slate-500">
				User ID <span class="font-mono text-xs">{data.user_id}</span> · 세션 {data.count}개 ·
				로그인 {families.length}개
			</p>
		</div>

		<form
			method="POST"
			action="?/revokeAll"
			use:enhance={({ cancel }) => {
				if (
					!confirm(
						'이 사용자의 모든 기기/브라우저 세션을 전부 강제 로그아웃합니다.\n\n계속할까요?'
					)
				) {
					cancel();
					return;
				}
				pendingAction = 'all';
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<button
				type="submit"
				disabled={pendingAction === 'all'}
				class="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
				title="모든 로그인 체인을 한 번에 종료"
			>
				{pendingAction === 'all' ? '처리 중…' : '모든 세션 로그아웃'}
			</button>
		</form>
	</div>

	<!-- Filters -->
	<div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				applyFilters();
			}}
			class="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap"
		>
			<div>
				<label for="f_status" class="block text-xs font-medium text-slate-500">상태</label>
				<select
					id="f_status"
					bind:value={status}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="all">전체</option>
					<option value="ACTIVE">활성</option>
					<option value="INACTIVE">비활성</option>
				</select>
			</div>
			<div>
				<label for="f_revoked" class="block text-xs font-medium text-slate-500">Revoke</label>
				<select
					id="f_revoked"
					bind:value={revoked}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="any">전체</option>
					<option value="true">revoke됨</option>
					<option value="false">정상</option>
				</select>
			</div>
			<div>
				<label for="f_reuse" class="block text-xs font-medium text-slate-500">재사용</label>
				<select
					id="f_reuse"
					bind:value={reuseDetected}
					class="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="any">전체</option>
					<option value="true">재사용 감지</option>
					<option value="false">정상</option>
				</select>
			</div>
			<div class="flex gap-2">
				<button
					type="submit"
					class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
				>
					적용
				</button>
				<button
					type="button"
					onclick={resetFilters}
					class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
				>
					초기화
				</button>
			</div>
		</form>
	</div>

	<!-- Info card -->
	<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-600">
		<p>
			<strong class="font-semibold text-slate-700">로그인(패밀리)</strong>은 한 번의 로그인으로
			시작된 refresh 체인입니다. 같은 브라우저에서 refresh로 이어진 세션들은 같은 로그인으로
			묶이고, <strong class="font-semibold text-slate-700">다른 기기/브라우저/시크릿창</strong>에서
			로그인하면 별개의 로그인이 됩니다.
		</p>
	</div>

	<!-- Family Cards -->
	{#if families.length === 0}
		<div class="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
			조건에 맞는 세션이 없습니다.
		</div>
	{:else}
		<div class="space-y-4">
			{#each families as group (group.family_id)}
				{@const canRev = canRevokeFamily(group)}
				<div
					class="overflow-hidden rounded-xl border bg-white shadow-sm {group.any_reuse
						? 'border-rose-200 ring-1 ring-rose-100'
						: 'border-slate-200'}"
				>
					<!-- Card Header -->
					<div
						class="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
					>
						<div class="flex items-center gap-3">
							<div>
								<p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
									로그인
									<span class="ml-1 font-mono text-[10px] text-slate-400"
										>{familyShortId(group.family_id)}</span
									>
								</p>
								<p class="mt-0.5 text-[11px] text-slate-500">
									세션 {group.sessions.length}개 · 활성 {group.active_count}개
									{#if group.any_reuse}
										<span class="ml-1 font-semibold text-rose-600">· ⚠ 재사용 감지</span>
									{/if}
								</p>
							</div>
						</div>
						{#if canRev}
							<form
								method="POST"
								action="?/revokeFamily"
								use:enhance={({ cancel }) => {
									if (
										!confirm(
											'이 로그인으로 시작된 refresh 체인(같은 브라우저의 rotation 세션들) 전체를 로그아웃합니다.\n\n계속할까요?'
										)
									) {
										cancel();
										return;
									}
									pendingAction = `family-${group.family_id}`;
									return async ({ update }) => {
										await update();
									};
								}}
							>
								<input type="hidden" name="token_family_id" value={group.family_id} />
								<button
									type="submit"
									disabled={pendingAction === `family-${group.family_id}`}
									class="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
									title="이 로그인 체인 전체 종료"
								>
									{pendingAction === `family-${group.family_id}`
										? '처리 중…'
										: '이 로그인 전체 종료'}
								</button>
							</form>
						{/if}
					</div>

					<!-- Sessions in this family -->
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-slate-200 text-xs">
							<thead class="bg-white">
								<tr>
									<th class="px-3 py-2 text-left font-medium text-slate-500">기기</th>
									<th class="px-3 py-2 text-left font-medium text-slate-500">IP</th>
									<th class="px-3 py-2 text-left font-medium text-slate-500">상태</th>
									<th class="px-3 py-2 text-left font-medium text-slate-500">마지막 활동</th>
									<th class="px-3 py-2 text-left font-medium text-slate-500">만료</th>
									<th class="px-3 py-2 text-left font-medium text-slate-500">생성</th>
									<th class="px-3 py-2 text-right font-medium text-slate-500">조치</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each group.sessions as session (session.id)}
									{@const s = sessionStatus(session)}
									{@const rev = canRevokeSession(session)}
									<tr class="hover:bg-slate-50/50">
										<td
											class="max-w-[220px] truncate px-3 py-2 text-slate-700"
											title={session.user_agent}
										>
											{session.device_name || session.user_agent}
										</td>
										<td class="px-3 py-2 font-mono text-slate-500">{session.client_ip}</td>
										<td class="px-3 py-2">
											<span
												class="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold {s.color}"
											>
												{s.label}
											</span>
										</td>
										<td class="px-3 py-2 text-slate-500">{formatDateTime(session.last_seen_at)}</td>
										<td class="px-3 py-2 text-slate-500">{formatDateTime(session.expires_at)}</td>
										<td class="px-3 py-2 text-slate-500">{formatDateTime(session.created_at)}</td>
										<td class="px-3 py-2 text-right">
											{#if rev}
												<form
													method="POST"
													action="?/revokeOne"
													use:enhance={({ cancel }) => {
														if (
															!confirm(
																'이 세션 1개만 로그아웃합니다.\n(같은 로그인 체인의 refresh가 살아 있으면 부활할 수 있습니다. 확실히 끊으려면 카드 상단의 "이 로그인 전체 종료"를 사용하세요.)\n\n계속할까요?'
															)
														) {
															cancel();
															return;
														}
														pendingAction = `one-${session.id}`;
														return async ({ update }) => {
															await update();
														};
													}}
												>
													<input type="hidden" name="session_id" value={session.id} />
													<button
														type="submit"
														disabled={pendingAction === `one-${session.id}`}
														class="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
														title="이 session row 1개만 종료 (refresh 살아있으면 부활 가능)"
													>
														이 세션만
													</button>
												</form>
											{:else}
												<span class="text-xs text-slate-300">-</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
