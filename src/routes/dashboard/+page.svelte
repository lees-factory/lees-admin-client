<script lang="ts">
	import { currentProject } from '$lib/stores/project';
	import { fade } from 'svelte/transition';

	// Dummy data per project type
	const dashboardData = {
		ecommerce: {
			stats: [
				{ label: 'Total Revenue', value: '$45,231', change: '+8%', trend: 'up', icon: 'Dollar' },
				{ label: 'Orders', value: '1,204', change: '+23%', trend: 'up', icon: 'ShoppingBag' },
				{ label: 'Active Customers', value: '12,345', change: '+12%', trend: 'up', icon: 'Users' },
				{
					label: 'Avg. Order Value',
					value: '$84.32',
					change: '-2%',
					trend: 'down',
					icon: 'ChartBar'
				}
			],
			recentActivity: [
				{
					user: 'john@example.com',
					action: 'order.created',
					target: '#ORD-9921',
					status: 'success',
					time: '2 mins ago'
				},
				{
					user: 'sarah@store.com',
					action: 'product.updated',
					target: 'Nike Air Max',
					status: 'success',
					time: '15 mins ago'
				},
				{
					user: 'system',
					action: 'inventory.alert',
					target: 'Warehouse A',
					status: 'warning',
					time: '1 hour ago'
				}
			]
		},
		cloud: {
			stats: [
				{ label: 'Active Instances', value: '42', change: '+2', trend: 'up', icon: 'Server' },
				{ label: 'CPU Usage', value: '78%', change: '+5%', trend: 'up', icon: 'Cpu' },
				{
					label: 'Storage Used',
					value: '1.2 TB',
					change: '85%',
					trend: 'warning',
					icon: 'Database'
				},
				{ label: 'Monthly Cost', value: '$1,204', change: '+12%', trend: 'up', icon: 'CreditCard' }
			],
			recentActivity: [
				{
					user: 'devops@cloud.com',
					action: 'instance.reboot',
					target: 'worker-node-03',
					status: 'success',
					time: '5 mins ago'
				},
				{
					user: 'system',
					action: 'autoscaling.trigger',
					target: 'api-cluster',
					status: 'success',
					time: '20 mins ago'
				},
				{
					user: 'monitor',
					action: 'health.check_failed',
					target: 'db-replica-02',
					status: 'failed',
					time: '1 hour ago'
				}
			]
		}
	};

	// Derived state based on current project type
	let currentData = $derived(
		dashboardData[$currentProject.type as keyof typeof dashboardData] || dashboardData.ecommerce
	);
</script>

<div class="space-y-6" in:fade={{ duration: 300 }}>
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2
				class="text-2xl leading-7 font-bold text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight"
			>
				{$currentProject.name} Dashboard
			</h2>
			<p class="mt-1 text-sm text-slate-500">
				Project ID: <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs"
					>{$currentProject.id}</span
				>
				&bull; Environment: Production
			</p>
		</div>
		<div class="flex items-center gap-2">
			<span class="hidden text-sm text-slate-500 sm:inline">Last updated: Just now</span>
			<button
				class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 transition-colors ring-inset hover:bg-slate-50"
			>
				Refresh
			</button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each currentData.stats as stat}
			<div
				class="relative overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md sm:px-6 sm:py-6"
			>
				<dt>
					<div class="absolute rounded-md bg-blue-500 p-3 shadow-sm">
						<!-- Icon Placeholder -->
						{#if stat.icon === 'Dollar'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
						{:else if stat.icon === 'Server'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2m-2-4h.01M17 16h.01"
								/></svg
							>
						{:else if stat.icon === 'Cpu'}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
								/></svg
							>
						{:else}
							<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/></svg
							>
						{/if}
					</div>
					<p class="ml-16 truncate text-sm font-medium text-slate-500">{stat.label}</p>
				</dt>
				<dd class="ml-16 flex items-baseline pb-1 sm:pb-2">
					<p class="text-2xl font-semibold text-slate-900">{stat.value}</p>
					<p
						class="ml-2 flex items-baseline text-sm font-semibold {stat.trend === 'up'
							? 'text-green-600'
							: stat.trend === 'down'
								? 'text-red-600'
								: 'text-yellow-600'}"
					>
						{stat.change}
						{#if stat.trend === 'up'}
							<span class="sr-only">Increased by</span>
							<span class="ml-1 text-xs">↑</span>
						{:else if stat.trend === 'down'}
							<span class="sr-only">Decreased by</span>
							<span class="ml-1 text-xs">↓</span>
						{/if}
					</p>
				</dd>
			</div>
		{/each}
	</div>

	<!-- Recent Activity / Audit Log Preview -->
	<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
		<div class="flex items-center justify-between border-b border-gray-200 px-4 py-5 sm:px-6">
			<div>
				<h3 class="text-base leading-6 font-semibold text-slate-900">Recent Activity</h3>
				<p class="mt-1 text-sm text-slate-500">Latest events for {$currentProject.name}</p>
			</div>
			<span
				class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset"
				>Live</span
			>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50/50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>User</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>Action</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>Target</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>Status</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
							>Time</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200 bg-white">
					{#each currentData.recentActivity as activity}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900"
								>{activity.user}</td
							>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
								<span
									class="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset"
								>
									{activity.action}
								</span>
							</td>
							<td class="px-6 py-4 font-mono text-sm text-xs whitespace-nowrap text-slate-500"
								>{activity.target}</td
							>
							<td class="px-6 py-4 text-sm whitespace-nowrap">
								{#if activity.status === 'success'}
									<span
										class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
										>Success</span
									>
								{:else if activity.status === 'warning'}
									<span
										class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset"
										>Warning</span
									>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-600/10 ring-inset"
										>Failed</span
									>
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
				href="/dashboard/logs"
				class="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
				>View all logs <span aria-hidden="true">&rarr;</span></a
			>
		</div>
	</div>
</div>
