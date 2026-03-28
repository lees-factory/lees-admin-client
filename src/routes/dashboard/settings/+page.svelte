<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	let showSuccess = $state(false);

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			const timer = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-bold text-slate-900">시스템 설정</h2>
		<p class="mt-1 text-sm text-slate-500">Price Eye 시스템 설정 관리</p>
	</div>

	<!-- Success Toast -->
	{#if showSuccess}
		<div
			class="rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-200 ring-inset"
			in:fade={{ duration: 200 }}
		>
			<p class="text-sm font-medium text-emerald-800">설정이 저장되었습니다.</p>
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg bg-rose-50 p-4 ring-1 ring-rose-200 ring-inset">
			<p class="text-sm font-medium text-rose-800">{form.error}</p>
		</div>
	{/if}

	<form method="POST" action="?/save" use:enhance class="space-y-6">
		<!-- Crawl Settings -->
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
			<h3 class="text-base font-semibold text-slate-900">가격 수집 설정</h3>
			<p class="mt-1 text-sm text-slate-500">크롤링 주기를 설정합니다.</p>

			<div class="mt-4 max-w-sm">
				<label for="crawlIntervalMinutes" class="block text-sm font-medium text-slate-700"
					>수집 주기 (분)</label
				>
				<input
					id="crawlIntervalMinutes"
					name="crawlIntervalMinutes"
					type="number"
					min="30"
					max="1440"
					value={data.settings.crawlIntervalMinutes}
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
				<p class="mt-1 text-xs text-slate-400">
					현재: {Math.floor(data.settings.crawlIntervalMinutes / 60)}시간 {data.settings.crawlIntervalMinutes % 60}분마다 수집
				</p>
			</div>
		</div>

		<!-- Plan Settings -->
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
			<h3 class="text-base font-semibold text-slate-900">플랜 제한 설정</h3>
			<p class="mt-1 text-sm text-slate-500">Free / Pro 플랜별 제한 값을 조정합니다.</p>

			<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<!-- Free Plan -->
				<div class="rounded-lg border border-slate-200 p-4">
					<h4 class="text-sm font-semibold text-slate-800">Free 플랜</h4>
					<div class="mt-3 space-y-3">
						<div>
							<label for="freePlanMaxItems" class="block text-xs font-medium text-slate-500"
								>최대 추적 상품 수</label
							>
							<input
								id="freePlanMaxItems"
								name="freePlanMaxItems"
								type="number"
								min="1"
								max="100"
								value={data.settings.freePlanMaxItems}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="freePlanHistoryDays" class="block text-xs font-medium text-slate-500"
								>가격 히스토리 보관 (일)</label
							>
							<input
								id="freePlanHistoryDays"
								name="freePlanHistoryDays"
								type="number"
								min="1"
								max="365"
								value={data.settings.freePlanHistoryDays}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- Pro Plan -->
				<div class="rounded-lg border border-violet-200 bg-violet-50/30 p-4">
					<h4 class="text-sm font-semibold text-violet-800">Pro 플랜</h4>
					<div class="mt-3 space-y-3">
						<div>
							<label for="proPlanMaxItems" class="block text-xs font-medium text-slate-500"
								>최대 추적 상품 수</label
							>
							<input
								id="proPlanMaxItems"
								name="proPlanMaxItems"
								type="number"
								min="1"
								max="1000"
								value={data.settings.proPlanMaxItems}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="proPlanHistoryDays" class="block text-xs font-medium text-slate-500"
								>가격 히스토리 보관 (일, -1 = 무제한)</label
							>
							<input
								id="proPlanHistoryDays"
								name="proPlanHistoryDays"
								type="number"
								min="-1"
								max="3650"
								value={data.settings.proPlanHistoryDays}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Announcement -->
		<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
			<h3 class="text-base font-semibold text-slate-900">공지사항</h3>
			<p class="mt-1 text-sm text-slate-500">사용자에게 표시할 공지사항을 관리합니다.</p>

			<div class="mt-4 space-y-3">
				<div class="flex items-center gap-3">
					<input
						id="announcementActive"
						name="announcementActive"
						type="checkbox"
						checked={data.settings.announcementActive}
						class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
					/>
					<label for="announcementActive" class="text-sm font-medium text-slate-700"
						>공지사항 활성화</label
					>
				</div>
				<div>
					<label for="announcement" class="block text-xs font-medium text-slate-500"
						>공지 내용</label
					>
					<textarea
						id="announcement"
						name="announcement"
						rows="3"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="공지사항 내용을 입력하세요..."
					>{data.settings.announcement}</textarea>
				</div>
			</div>
		</div>

		<!-- Submit -->
		<div class="flex justify-end">
			<button
				type="submit"
				class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				설정 저장
			</button>
		</div>
	</form>
</div>
