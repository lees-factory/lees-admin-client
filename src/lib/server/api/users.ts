import { apiGet } from './client';
import type { UserListData, UserListParams } from '$lib/types/api';

/** GET /v1/users — 사용자 목록 조회 */
export function listUsers(params?: UserListParams) {
	const query: Record<string, string> = {};
	if (params?.search) query.search = params.search;
	if (params?.plan) query.plan = params.plan;
	if (params?.status) query.status = params.status;
	if (params?.page) query.page = String(params.page);
	if (params?.page_size) query.page_size = String(params.page_size);
	return apiGet<UserListData>('/v1/users', query);
}
