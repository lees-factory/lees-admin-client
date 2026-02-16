import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ cookies }) => {
		// Clear session cookie
		cookies.delete('session', { path: '/' });
		
		// Redirect to login
		throw redirect(303, '/login');
	}
} satisfies Actions;
