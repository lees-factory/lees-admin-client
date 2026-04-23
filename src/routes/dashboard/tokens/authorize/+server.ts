import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAuthorizeUrl } from '$lib/server/api/token';
import { ApiError } from '$lib/server/api/client';
import type { AppType } from '$lib/types/api';

const VALID_APP_TYPES: AppType[] = ['AFFILIATE', 'DROPSHIPPING'];

/**
 * GET /dashboard/tokens/authorize?app_type=DROPSHIPPING
 * 백엔드에서 authorization_url을 받아 그대로 302 리다이렉트.
 * 링크 클릭(target="_blank") 기반이므로 팝업 차단 이슈가 없다.
 */
export const GET: RequestHandler = async (event) => {
	const appType = event.url.searchParams.get('app_type');
	if (!appType || !VALID_APP_TYPES.includes(appType as AppType)) {
		throw error(400, 'app_type 파라미터가 올바르지 않습니다.');
	}

	try {
		const result = await getAuthorizeUrl(appType as AppType, event);
		const url = result.data?.authorization_url;
		if (!url) {
			throw error(500, 'authorization_url을 받지 못했습니다.');
		}
		throw redirect(302, url);
	} catch (e) {
		if (e instanceof ApiError) {
			throw error(e.status, e.message || '인가 URL 생성 실패');
		}
		throw e;
	}
};
