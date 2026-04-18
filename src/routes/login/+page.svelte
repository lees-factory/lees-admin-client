<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let id = $state((form as { id?: string } | null)?.id ?? '');
	let password = $state('');
	let submitting = $state(false);

	let expiredNotice = $derived(data?.reason === 'expired');
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
		<h1 class="mb-6 text-center text-2xl font-bold text-slate-900">LEES Admin</h1>

		{#if expiredNotice && !form?.error}
			<div class="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
				세션이 만료되었습니다. 다시 로그인해주세요.
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-600">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="id" class="block text-xs font-medium text-slate-500">관리자 ID</label>
				<input
					id="id"
					name="id"
					type="text"
					autocomplete="username"
					bind:value={id}
					required
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-medium text-slate-500">비밀번호</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					required
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
			>
				{submitting ? '로그인 중…' : '로그인'}
			</button>
		</form>

	</div>
</div>
