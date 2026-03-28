import { writable } from 'svelte/store';

export interface Project {
	id: string;
	name: string;
	type: 'price-tracker';
}

export const projects: Project[] = [
	{ id: 'price-eye', name: 'Price Eye', type: 'price-tracker' }
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
