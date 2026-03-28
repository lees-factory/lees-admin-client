import { dev } from '$app/environment';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (session) {
		throw redirect(303, '/dashboard');
	}
};

export const actions = {
	// TODO: 실제 연동 시 adapter 검증 후 세션 발급
	login: async ({ cookies }) => {
		cookies.set('session', 'admin-session-token', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 // 1 day
		});
		throw redirect(303, '/dashboard');
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
