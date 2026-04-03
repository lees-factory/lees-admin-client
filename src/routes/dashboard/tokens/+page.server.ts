import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTokenStatus, refreshToken, getAuthorizeUrl } from '$lib/server/api/token';
import { ApiError } from '$lib/server/api/client';
import type { AppType } from '$lib/types/api';

export const load: PageServerLoad = async () => {
	try {
		const result = await getTokenStatus();
		return { tokens: result.data?.tokens ?? [] };
	} catch {
		return { tokens: [] };
	}
};

export const actions = {
	refresh: async ({ request }) => {
		const formData = await request.formData();
		const appType = formData.get('app_type') as AppType;

		if (!appType || !['AFFILIATE', 'DROPSHIPPING'].includes(appType)) {
			return fail(400, { error: '앱 유형을 선택해주세요.' });
		}

		try {
			const result = await refreshToken({ app_type: appType });
			return {
				success: true,
				action: 'refresh',
				message: `${appType} 토큰이 갱신되었습니다.`,
				data: result.data
			};
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : '토큰 갱신에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	authorize: async ({ request }) => {
		const formData = await request.formData();
		const appType = formData.get('app_type') as AppType;

		if (!appType || !['AFFILIATE', 'DROPSHIPPING'].includes(appType)) {
			return fail(400, { error: '앱 유형을 선택해주세요.' });
		}

		try {
			const result = await getAuthorizeUrl(appType);
			return { success: true, action: 'authorize', data: result.data };
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : '인가 URL 생성에 실패했습니다.';
			return fail(500, { error: msg });
		}
	}
} satisfies Actions;
