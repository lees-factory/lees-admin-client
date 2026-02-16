import { writable } from 'svelte/store';

function createSidebarStore() {
	const { subscribe, set, update } = writable({
		isOpen: true, // Desktop default
		isMobileOpen: false // Mobile default
	});

	return {
		subscribe,
		toggle: () => update((s) => ({ ...s, isOpen: !s.isOpen })),
		toggleMobile: () => update((s) => ({ ...s, isMobileOpen: !s.isMobileOpen })),
		closeMobile: () => update((s) => ({ ...s, isMobileOpen: false })),
		setOpen: (isOpen: boolean) => update((s) => ({ ...s, isOpen }))
	};
}

export const sidebar = createSidebarStore();
