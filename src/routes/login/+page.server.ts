import { dev } from '$app/environment';
import { redirect, fail, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { adminLogin } from '$lib/server/api/auth';
import { ApiError } from '$lib/server/api/client';

// 유효 세션 체크와 /dashboard 리다이렉트는 hooks.server.ts에서 중앙 처리.
// 여기서는 query string의 reason 파라미터만 UI로 전달한다.
export const load: PageServerLoad = async ({ url }) => {
	const reason = url.searchParams.get('reason');
	return { reason };
};

function setSessionCookie(
	cookies: Cookies,
	payload: { token: string; expires_at: string; admin_id?: string; login_id?: string }
) {
	const expiresMs = Date.parse(payload.expires_at);
	const maxAge = Math.max(60, Math.floor((expiresMs - Date.now()) / 1000));
	cookies.set('session', JSON.stringify(payload), {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge
	});
}

export const actions = {
	login: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = (formData.get('id') as string | null)?.trim() ?? '';
		const password = (formData.get('password') as string | null) ?? '';

		if (!id || !password) {
			return fail(400, { error: 'ID와 비밀번호를 입력하세요.', id });
		}

		try {
			const result = await adminLogin({ id, password });
			const data = result.data;
			if (!data?.access_token || !data?.expires_at) {
				return fail(500, { error: '로그인 응답이 올바르지 않습니다.', id });
			}

			setSessionCookie(cookies, {
				token: data.access_token,
				expires_at: data.expires_at,
				admin_id: data.admin_id,
				login_id: data.login_id
			});
		} catch (e) {
			if (e instanceof ApiError) {
				// 401: 자격증명 불일치
				if (e.status === 401) {
					return fail(401, { error: 'ID 또는 비밀번호가 올바르지 않습니다.', id });
				}
				// 400: 요청 형식 문제(공백/형식) — 백엔드 메시지가 더 구체적일 수 있음
				if (e.status === 400) {
					return fail(400, {
						error: e.message || 'ID 또는 비밀번호 형식이 올바르지 않습니다.',
						id
					});
				}
				// 5xx 또는 기타: 백엔드 메시지 노출
				return fail(e.status, {
					error: e.message || `로그인 실패 (HTTP ${e.status})`,
					id
				});
			}

			// ApiError가 아닌 예외(네트워크 단절, DNS 실패, TLS 오류 등)
			console.error('[login] unexpected error:', e);
			const detail =
				e instanceof Error ? `${e.name}: ${e.message}` : '알 수 없는 오류';
			return fail(500, {
				error: `서버에 연결할 수 없습니다. (${detail})`,
				id
			});
		}

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
