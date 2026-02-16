<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar';
</script>

<header class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
	<div class="flex items-center">
		<!-- Mobile Toggle (Keep visible on mobile) -->
		<button
			type="button"
			class="focus:ring-primary-500 -ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset lg:hidden"
			onclick={() => sidebar.toggleMobile()}
		>
			<span class="sr-only">Open sidebar</span>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		</button>

        <!-- Page Title -->
        <h1 class="ml-2 text-lg font-semibold text-slate-800 lg:ml-0">Dashboard</h1>
	</div>

	<div class="flex items-center gap-4">
        <form method="POST" action="/logout">
            <button type="submit" class="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Logout</button>
        </form>
	</div>
</header>
