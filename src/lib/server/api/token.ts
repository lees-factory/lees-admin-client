import type { RequestEvent } from '@sveltejs/kit';
import { apiGet, apiPost } from './client';
import type {
	AppType,
	AuthorizeUrlData,
	TokenGenerateRequest,
	TokenRefreshRequest,
	TokenResult,
	TokenStatusEntry
} from '$lib/types/api';

type Ev = Pick<RequestEvent, 'locals' | 'cookies'>;

/** POST /v1/aliexpress/token/generate — OAuth 코드로 토큰 발급 */
export function generateToken(req: TokenGenerateRequest, event: Ev) {
	return apiPost<TokenResult>('/v1/aliexpress/token/generate', req, { event });
}

/** GET /v1/aliexpress/oauth/authorize-url — OAuth 인가 URL 생성 */
export function getAuthorizeUrl(appType: AppType, event: Ev) {
	return apiGet<AuthorizeUrlData>(
		'/v1/aliexpress/oauth/authorize-url',
		{ app_type: appType },
		{ event }
	);
}

/** POST /v1/aliexpress/token/refresh — 토큰 수동 갱신 */
export function refreshToken(req: TokenRefreshRequest | undefined, event: Ev) {
	return apiPost<TokenResult>('/v1/aliexpress/token/refresh', req, { event });
}

/** GET /v1/aliexpress/token/status — 토큰 상태 조회 */
export function getTokenStatus(appType: AppType | undefined, event: Ev) {
	const params: Record<string, string> = {};
	if (appType) params.app_type = appType;
	return apiGet<{ tokens: TokenStatusEntry[] }>('/v1/aliexpress/token/status', params, { event });
}
