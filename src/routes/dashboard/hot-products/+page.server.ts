import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getHotProducts, crawlAllHotProducts } from '$lib/adapters/admin';

export const load: PageServerLoad = async () => {
	try {
		const hotProducts = await getHotProducts();
		return { hotProducts };
	} catch (e) {
		throw error(500, '핫 프로덕트 데이터를 불러오는데 실패했습니다.');
	}
};

export const actions = {
	crawlAll: async () => {
		try {
			const result = await crawlAllHotProducts();
			if (result.success) return { success: true, count: result.count };
			return fail(500, { error: '전체 수집에 실패했습니다.' });
		} catch (e) {
			return fail(500, { error: '서버 오류가 발생했습니다.' });
		}
	}
} satisfies Actions;
