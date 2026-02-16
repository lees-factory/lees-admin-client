import { writable } from 'svelte/store';

export interface Project {
	id: string;
	name: string;
	type: 'ecommerce' | 'cloud'; // To differentiate UI themes/content
}

export const projects: Project[] = [
	{ id: 'boom', name: 'boom', type: 'ecommerce' },
	{ id: 'cloud-between-us', name: 'cloud between us', type: 'cloud' }
];

function createProjectStore() {
	const { subscribe, set, update } = writable<Project>(projects[0]);

	return {
		subscribe,
		set,
		select: (projectId: string) => {
			const found = projects.find((p) => p.id === projectId);
			if (found) set(found);
		}
	};
}

export const currentProject = createProjectStore();
