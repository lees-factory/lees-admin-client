import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (session) {
		throw redirect(303, '/dashboard');
	}
};

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		// TODO: Implement actual auth validation with adapter
		if (!email || !password) {
			return fail(400, { error: 'Missing email or password' });
		}

		// Mock auth for now
		if (email === 'admin@example.com' && password === 'password') {
			cookies.set('session', 'admin-session-token', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: !dev,
				maxAge: 60 * 60 * 24 // 1 day
			});
			throw redirect(303, '/dashboard');
		}

		return fail(401, { error: 'Invalid credentials' });
	},

	devLogin: async ({ cookies }) => {
		if (!dev) {
			return fail(403, { error: 'Development only' });
		}

		// Bypass auth for dev
		cookies.set('session', 'dev-session-token', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 // 1 day
		});

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
