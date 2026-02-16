<script lang="ts">
	import { currentProject } from '$lib/stores/project';
</script>

<div class="space-y-6">
	<h2 class="text-2xl font-bold text-slate-900">구름 타입 관리</h2>
	<p class="text-slate-500">
		서비스: <span class="font-medium text-slate-700">{$currentProject.name}</span>
	</p>
	<div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
		<p class="text-sm text-slate-500">구름 타입 목록 및 관리 기능이 이곳에 표시됩니다.</p>
	</div>
</div>
