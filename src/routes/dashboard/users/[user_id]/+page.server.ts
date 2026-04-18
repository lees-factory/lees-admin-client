import { error, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	listUserSessions,
	revokeAllUserSessions,
	revokeUserSession,
	revokeUserSessionsByTokenFamily
} from '$lib/server/api/sessions';
import { ApiError } from '$lib/server/api/client';
import type { UserSessionListParams, UserStatus } from '$lib/types/api';

const VALID_STATUSES: (UserStatus | 'all')[] = ['all', 'ACTIVE', 'INACTIVE'];

function parseTriState(raw: string | null): boolean | undefined {
	if (raw === 'true') return true;
	if (raw === 'false') return false;
	return undefined;
}

export const load: PageServerLoad = async (event) => {
	const userId = event.params.user_id;
	const url = event.url;

	const statusRaw = url.searchParams.get('status') ?? 'all';
	const status = (VALID_STATUSES.includes(statusRaw as UserStatus | 'all')
		? statusRaw
		: 'all') as UserStatus | 'all';

	const revoked = parseTriState(url.searchParams.get('revoked'));
	const reuseDetected = parseTriState(url.searchParams.get('reuse_detected'));

	const params: UserSessionListParams = {};
	if (status !== 'all') params.status = status;
	if (revoked !== undefined) params.revoked = revoked;
	if (reuseDetected !== undefined) params.reuse_detected = reuseDetected;

	try {
		const result = await listUserSessions(userId, params, event);
		return {
			user_id: userId,
			sessions: result.data?.items ?? [],
			count: result.data?.count ?? 0,
			filters: {
				status,
				revoked: url.searchParams.get('revoked') ?? 'any',
				reuse_detected: url.searchParams.get('reuse_detected') ?? 'any'
			}
		};
	} catch (e) {
		if (isRedirect(e)) throw e;
		if (e instanceof ApiError) {
			throw error(e.status, e.message || '세션 조회 실패');
		}
		throw error(500, '세션 조회 실패');
	}
};

function requireString(value: FormDataEntryValue | null, field: string): string {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${field} 필수`);
	}
	return value.trim();
}

export const actions = {
	revokeAll: async (event) => {
		const userId = event.params.user_id;
		try {
			const result = await revokeAllUserSessions(userId, event);
			return {
				success: true,
				action: 'revokeAll',
				data: result.data,
				message: '모든 세션을 로그아웃했습니다.'
			};
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: e instanceof Error ? e.message : '요청 실패' });
		}
	},

	revokeOne: async (event) => {
		const userId = event.params.user_id;
		const formData = await event.request.formData();
		try {
			const sessionId = requireString(formData.get('session_id'), 'session_id');
			const result = await revokeUserSession(userId, sessionId, event);
			return {
				success: true,
				action: 'revokeOne',
				session_id: sessionId,
				data: result.data,
				message: '세션을 로그아웃했습니다.'
			};
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(400, { error: e instanceof Error ? e.message : '요청 실패' });
		}
	},

	revokeFamily: async (event) => {
		const userId = event.params.user_id;
		const formData = await event.request.formData();
		try {
			const tokenFamilyId = requireString(formData.get('token_family_id'), 'token_family_id');
			const result = await revokeUserSessionsByTokenFamily(userId, tokenFamilyId, event);
			return {
				success: true,
				action: 'revokeFamily',
				token_family_id: tokenFamilyId,
				data: result.data,
				message: '이 로그인 체인의 세션을 모두 로그아웃했습니다.'
			};
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(400, { error: e instanceof Error ? e.message : '요청 실패' });
		}
	}
} satisfies Actions;
