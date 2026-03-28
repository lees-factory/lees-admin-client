<script lang="ts">
	import { fade } from 'svelte/transition';

	let { data } = $props();
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-2xl leading-7 font-bold text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
				Price Eye Dashboard
			</h2>
			<p class="mt-1 text-sm text-slate-500">Environment: Production</p>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.stats as stat}
			<div
				class="relative overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md sm:px-6 sm:py-6"
			>
				<dt>
					<div class="absolute rounded-md bg-blue-500 p-3 shadow-sm">
						{#if stat.icon === 'Users'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
						{:else if stat.icon === 'ShoppingBag'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
						{:else if stat.icon === 'CreditCard'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
						{:else if stat.icon === 'ChartBar'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
						{:else}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
						{/if}
					</div>
					<p class="ml-16 truncate text-sm font-medium text-slate-500">{stat.label}</p>
				</dt>
				<dd class="ml-16 flex items-baseline pb-1 sm:pb-2">
					<p class="text-2xl font-semibold text-slate-900">{stat.value}</p>
					<p
						class="ml-2 flex items-baseline text-sm font-semibold {stat.trend === 'up'
							? 'text-green-600'
							: 'text-red-600'}"
					>
						{stat.change}
						{#if stat.trend === 'up'}
							<span class="ml-1 text-xs" aria-hidden="true">↑</span>
						{:else}
							<span class="ml-1 text-xs" aria-hidden="true">↓</span>
						{/if}
					</p>
				</dd>
			</div>
		{/each}
	</div>

	<!-- Recent Activity -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
		<div class="flex items-center justify-between border-b border-slate-200 px-4 py-5 sm:px-6">
			<div>
				<h3 class="text-base leading-6 font-semibold text-slate-900">최근 활동</h3>
				<p class="mt-1 text-sm text-slate-500">Price Eye 최근 이벤트</p>
			</div>
			<span
				class="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-600"
			>Live</span>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">User</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">Action</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">Target</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">Status</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase">Time</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each data.recentActivity as activity}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900">{activity.user}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
								<span class="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-600">
									{activity.action}
								</span>
							</td>
							<td class="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-500">{activity.target}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap">
								{#if activity.status === 'success'}
									<span class="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600">성공</span>
								{:else if activity.status === 'warning'}
									<span class="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600">경고</span>
								{:else}
									<span class="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-600">��패</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">{activity.time}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
			<a
				href="/dashboard/monitoring"
				class="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
			>전체 로그 보기 <span aria-hidden="true">&rarr;</span></a>
		</div>
	</div>
</div>
