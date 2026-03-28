<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { sidebar } from '$lib/stores/sidebar';

	let { children } = $props();
</script>

<div class="min-h-screen bg-slate-100">
	<Sidebar />

	<!-- Main Content Wrapper -->
	<!-- 
      - lg:pl-64 : Desktop Expanded
      - lg:pl-20 : Desktop Collapsed
      - Mobile : No padding (sidebar is overlay)
    -->
	<div
		class="flex min-h-screen flex-col transition-all duration-300 ease-in-out
        {$sidebar.isOpen ? 'lg:pl-64' : 'lg:pl-20'}"
	>
		<Header />
		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
</div>
