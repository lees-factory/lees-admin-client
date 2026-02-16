<script lang="ts">
	let { data } = $props();
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
			Dashboard Overview
		</h2>
		<div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Last updated: Just now</span>
            <button class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                Refresh
            </button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each data.stats as stat}
			<div class="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
				<dt>
					<div class="absolute rounded-md bg-blue-500 p-3">
						<!-- Icon Placeholder -->
                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
					</div>
					<p class="ml-16 truncate text-sm font-medium text-slate-500">{stat.label}</p>
				</dt>
				<dd class="ml-16 flex items-baseline pb-1 sm:pb-2">
					<p class="text-2xl font-semibold text-slate-900">{stat.value}</p>
					<p class="ml-2 flex items-baseline text-sm font-semibold {stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}">
						{stat.change}
                        {#if stat.trend === 'up'}
                            <span class="sr-only">Increased by</span>
                            <span class="text-xs ml-1">↑</span>
                        {:else}
                            <span class="sr-only">Decreased by</span>
                            <span class="text-xs ml-1">↓</span>
                        {/if}
					</p>
				</dd>
			</div>
		{/each}
	</div>

	<!-- Recent Activity / Audit Log Preview -->
	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="border-b border-gray-200 px-4 py-5 sm:px-6">
			<h3 class="text-base font-semibold leading-6 text-slate-900">Recent Activity</h3>
            <p class="mt-1 text-sm text-slate-500">Latest audit logs and system events.</p>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">User</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Action</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Target</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Time</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each data.recentActivity as activity}
						<tr>
							<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{activity.user}</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                    {activity.action}
                                </span>
                            </td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{activity.target}</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm">
                                {#if activity.status === 'success'}
                                    <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Success</span>
                                {:else if activity.status === 'warning'}
                                    <span class="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Warning</span>
                                {:else}
                                    <span class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Failed</span>
                                {/if}
                            </td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{activity.time}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
        <div class="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
             <a href="/dashboard/logs" class="text-sm font-semibold text-blue-600 hover:text-blue-500">View all logs <span aria-hidden="true">&rarr;</span></a>
        </div>
	</div>
</div>
