import { fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTokenStatus, refreshToken } from '$lib/server/api/token';
import { ApiError } from '$lib/server/api/client';
import type { AppType } from '$lib/types/api';

export const load: PageServerLoad = async (event) => {
	try {
		const result = await getTokenStatus(undefined, event);
		return { tokens: result.data?.tokens ?? [] };
	} catch (e) {
		if (isRedirect(e)) throw e;
		return { tokens: [] };
	}
};

export const actions = {
	refresh: async (event) => {
		const formData = await event.request.formData();
		const appType = formData.get('app_type') as AppType;

		if (!appType || !['AFFILIATE', 'DROPSHIPPING'].includes(appType)) {
			return fail(400, { error: '앱 유형을 선택해주세요.' });
		}

		try {
			const result = await refreshToken({ app_type: appType }, event);
			return {
				success: true,
				action: 'refresh',
				message: `${appType} 토큰이 갱신되었습니다.`,
				data: result.data
			};
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg = e instanceof ApiError ? e.message : '토큰 갱신에 실패했습니다.';
			return fail(500, { error: msg });
		}
	}
} satisfies Actions;
