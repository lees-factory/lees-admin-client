import { redirect, type Cookies, type Handle } from '@sveltejs/kit';

interface SessionPayload {
	token: string;
	expires_at: string;
	admin_id?: string;
	login_id?: string;
}

function readSession(cookies: Cookies): SessionPayload | null {
	const raw = cookies.get('session');
	if (!raw) return null;

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}

	if (!parsed || typeof parsed !== 'object') return null;
	const p = parsed as Record<string, unknown>;
	if (typeof p.token !== 'string' || !p.token) return null;
	if (typeof p.expires_at !== 'string') return null;

	const expires = Date.parse(p.expires_at);
	if (Number.isNaN(expires) || expires <= Date.now()) return null;

	return {
		token: p.token,
		expires_at: p.expires_at,
		admin_id: typeof p.admin_id === 'string' ? p.admin_id : undefined,
		login_id: typeof p.login_id === 'string' ? p.login_id : undefined
	};
}

function clearSession(cookies: Cookies) {
	cookies.delete('session', { path: '/' });
}

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const session = readSession(event.cookies);

	if (session) {
		event.locals.bearerToken = session.token;
		event.locals.adminId = session.admin_id;
		event.locals.loginId = session.login_id;
	} else {
		// 쿠키가 있지만 포맷/만료 문제가 있다면 정리
		if (event.cookies.get('session')) {
			clearSession(event.cookies);
		}
	}

	// 보호 영역: /dashboard/* 및 /logout은 유효 세션 필요
	const requiresAuth = pathname.startsWith('/dashboard') || pathname === '/logout';
	if (requiresAuth && !session) {
		throw redirect(303, '/login');
	}

	// 이미 로그인했으면 /login 접근 시 /dashboard로
	if (pathname === '/login' && session) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};
