<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
	<div class="rounded-xl border border-slate-200 bg-white px-8 py-12 shadow-sm">
		<p class="text-5xl font-bold text-slate-300">{$page.status}</p>
		<h2 class="mt-4 text-lg font-semibold text-slate-900">
			{#if $page.status === 404}
				페이지를 찾을 수 없습니다
			{:else if $page.status === 403}
				접근 권한이 없습니다
			{:else}
				오류가 발생했습니다
			{/if}
		</h2>
		<p class="mt-2 text-sm text-slate-500">{$page.error?.message ?? '잠시 후 다시 시도해주세요.'}</p>
		<a
			href="/dashboard"
			class="mt-6 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
		>
			대시보드로 돌아가기
		</a>
	</div>
</div>
