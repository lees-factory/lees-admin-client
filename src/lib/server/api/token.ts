import { apiGet, apiPost } from './client';
import type {
	AppType,
	TokenGenerateRequest,
	TokenRefreshRequest,
	TokenResult,
	TokenStatusEntry
} from '$lib/types/api';

/** POST /v1/aliexpress/token/generate — OAuth 코드로 토큰 발급 */
export function generateToken(req: TokenGenerateRequest) {
	return apiPost<TokenResult>('/v1/aliexpress/token/generate', req);
}

/** GET /v1/aliexpress/oauth/authorize-url — OAuth 인가 URL 생성 */
export function getAuthorizeUrl(appType: AppType) {
	return apiGet<unknown>('/v1/aliexpress/oauth/authorize-url', { app_type: appType });
}

/** POST /v1/aliexpress/token/refresh — 토큰 수동 갱신 */
export function refreshToken(req?: TokenRefreshRequest) {
	return apiPost<TokenResult>('/v1/aliexpress/token/refresh', req);
}

/** GET /v1/aliexpress/token/status — 토큰 상태 조회 */
export function getTokenStatus(appType?: AppType) {
	const params: Record<string, string> = {};
	if (appType) params.app_type = appType;
	return apiGet<{ tokens: TokenStatusEntry[] }>('/v1/aliexpress/token/status', params);
}
