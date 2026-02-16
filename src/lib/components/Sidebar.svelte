<script lang="ts">
	import { sidebar } from '$lib/stores/sidebar';
	import { page } from '$app/stores';

	// Rich dummy menu data
	const menuSections = [
		{
			title: 'Analytics',
			items: [
				{ name: 'Dashboard', href: '/dashboard', icon: 'ChartPie' },
				{ name: 'Reports', href: '/dashboard/reports', icon: 'DocumentText' },
				{ name: 'Live View', href: '/dashboard/live', icon: 'Eye' }
			]
		},
		{
			title: 'Management',
			items: [
				{ name: 'Users', href: '/dashboard/users', icon: 'Users' },
				{ name: 'Products', href: '/dashboard/products', icon: 'Cube' },
				{ name: 'Orders', href: '/dashboard/orders', icon: 'ShoppingBag' }
			]
		},
		{
			title: 'System',
			items: [
				{ name: 'Settings', href: '/dashboard/settings', icon: 'Cog' },
				{ name: 'Logs', href: '/dashboard/logs', icon: 'Terminal' },
				{ name: 'API Keys', href: '/dashboard/api-keys', icon: 'Key' }
			]
		}
	];

	function isCurrent(href: string) {
		return $page.url.pathname === href;
	}
</script>

<!-- Mobile Overlay -->
{#if $sidebar.isMobileOpen}
	<div
		class="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity lg:hidden"
		onclick={() => sidebar.closeMobile()}
        onkeydown={(e) => e.key === 'Escape' && sidebar.closeMobile()}
        role="button"
        tabindex="0"
	></div>
{/if}

<!-- Sidebar Container -->
<!-- Note: Removed newlines in class attribute to avoid parsing issues -->
<aside class="fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl lg:shadow-none {$sidebar.isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 {$sidebar.isOpen ? 'w-64' : 'w-20'} overflow-hidden">

	<!-- Header: Logo & Toggle -->
	<div class="relative flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-800 bg-slate-950/30">
		<!-- Logo -->
		<div class="flex items-center overflow-hidden transition-all duration-300 {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:w-auto lg:opacity-100'}">
            {#if $sidebar.isOpen}
			    <span class="text-lg font-bold text-blue-400 tracking-tight whitespace-nowrap">LEES</span>
            {:else}
                <!-- Collapsed Logo (Centered) -->
                <span class="text-xl font-bold text-blue-500 mx-auto">L</span>
            {/if}
		</div>

        <!-- Toggle Button (Desktop: Top Right inside Sidebar) -->
        <button 
            onclick={() => sidebar.toggle()}
            class="hidden lg:flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
            title="Toggle Sidebar"
        >
            {#if $sidebar.isOpen}
                <!-- Chevron Left -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            {:else}
                <!-- Chevron Right (When collapsed, button might cover logo if not careful. In collapsed mode w-20, button centers) -->
                <!-- Actually in collapsed mode, we want the button to be centered or accessible. 
                     If we center the button, the logo is hidden. That's fine. -->
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            {/if}
        </button>
        
        <!-- Mobile Close Button -->
        <button 
            onclick={() => sidebar.closeMobile()}
            class="lg:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Close sidebar"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
	</div>

	<!-- Scrollable Nav Area -->
	<nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6">
        {#each menuSections as section}
            <div class="space-y-1">
                <!-- Section Title (Hidden if collapsed) -->
                {#if $sidebar.isOpen}
                    <h3 class="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-opacity duration-300 opacity-100 whitespace-nowrap">
                        {section.title}
                    </h3>
                {:else}
                    <div class="h-4 mb-2"></div> <!-- Spacer for alignment -->
                {/if}

                {#each section.items as item}
                    <a
                        href={item.href}
                        class="group relative flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        {isCurrent(item.href)
                            ? 'bg-blue-600/10 text-blue-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                        {$sidebar.isOpen ? '' : 'justify-center'}"
                        title={!$sidebar.isOpen ? item.name : ''}
                    >
                        <!-- Icon -->
                        <span class="shrink-0 transition-colors duration-200 {isCurrent(item.href) ? 'text-blue-400' : 'group-hover:text-white'}">
                             <!-- Simple icon mapping for dummy -->
                             {#if item.icon === 'ChartPie'}
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                             {:else if item.icon === 'DocumentText'}
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             {:else if item.icon === 'Users'}
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                             {:else if item.icon === 'Cog'}
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             {:else}
                                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                             {/if}
                        </span>
                        
                        <!-- Text -->
                        <span class="ml-3 truncate font-medium tracking-wide transition-all duration-300
                            {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'} whitespace-nowrap block"
                        >
                            {item.name}
                        </span>

                        <!-- Active Indicator (Right Border) -->
                        {#if isCurrent(item.href) && $sidebar.isOpen}
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-l-full"></div>
                        {/if}
                    </a>
                {/each}
            </div>
        {/each}
	</nav>

    <!-- Footer: User Profile -->
    <div class="border-t border-slate-800 p-4 bg-slate-950/30">
        <div class="flex items-center {$sidebar.isOpen ? '' : 'justify-center'}">
             <div class="h-9 w-9 rounded-full bg-slate-700 border border-slate-600 shrink-0 flex items-center justify-center text-xs text-slate-300 font-bold shadow-sm">
                SU
             </div>
             
             <div class="ml-3 overflow-hidden transition-all duration-300
                {$sidebar.isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}"
             >
                <p class="truncate text-sm font-semibold text-white">Super User</p>
                <p class="truncate text-xs text-slate-500">super@admin.com</p>
            </div>
            
            <!-- Settings Icon (Only visible when expanded) -->
            {#if $sidebar.isOpen}
                <button 
                    class="ml-auto p-1.5 text-slate-500 hover:text-white rounded-md hover:bg-slate-800"
                    aria-label="Settings"
                >
                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
            {/if}
        </div>
    </div>
</aside>
