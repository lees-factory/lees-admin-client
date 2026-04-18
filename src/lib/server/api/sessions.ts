import type { RequestEvent } from '@sveltejs/kit';
import { apiGet, apiPost } from './client';
import type {
	UserSessionListData,
	UserSessionListParams,
	UserSessionRevokeData
} from '$lib/types/api';

type Ev = Pick<RequestEvent, 'locals' | 'cookies'>;

/** GET /v1/users/{user_id}/sessions — 사용자 세션 목록 조회 */
export function listUserSessions(
	userId: string,
	params: UserSessionListParams | undefined,
	event: Ev
) {
	const query: Record<string, string> = {};
	if (params?.status) query.status = params.status;
	if (params?.revoked !== undefined) query.revoked = String(params.revoked);
	if (params?.reuse_detected !== undefined) query.reuse_detected = String(params.reuse_detected);
	return apiGet<UserSessionListData>(
		`/v1/users/${encodeURIComponent(userId)}/sessions`,
		query,
		{ event }
	);
}

/** POST /v1/users/{user_id}/sessions/revoke — 전체 세션 강제 로그아웃 */
export function revokeAllUserSessions(userId: string, event: Ev) {
	return apiPost<UserSessionRevokeData>(
		`/v1/users/${encodeURIComponent(userId)}/sessions/revoke`,
		undefined,
		{ event }
	);
}

/** POST /v1/users/{user_id}/sessions/{session_id}/revoke — 특정 세션 강제 로그아웃 */
export function revokeUserSession(userId: string, sessionId: string, event: Ev) {
	return apiPost<UserSessionRevokeData>(
		`/v1/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`,
		undefined,
		{ event }
	);
}

/** POST /v1/users/{user_id}/sessions/token-families/{token_family_id}/revoke — 토큰 패밀리 단위 revoke */
export function revokeUserSessionsByTokenFamily(
	userId: string,
	tokenFamilyId: string,
	event: Ev
) {
	return apiPost<UserSessionRevokeData>(
		`/v1/users/${encodeURIComponent(userId)}/sessions/token-families/${encodeURIComponent(tokenFamilyId)}/revoke`,
		undefined,
		{ event }
	);
}
