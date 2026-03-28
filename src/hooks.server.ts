import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/dashboard')) {
		const session = event.cookies.get('session');
		if (!session) {
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
};
