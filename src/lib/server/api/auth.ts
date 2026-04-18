import { apiPost } from './client';
import type { AdminLoginData, AdminLoginRequest } from '$lib/types/api';

/** POST /v1/admin/auth/login — 관리자 로그인 */
export function adminLogin(req: AdminLoginRequest) {
	return apiPost<AdminLoginData>('/v1/admin/auth/login', req, { skipApiKey: true });
}
