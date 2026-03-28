import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getHotProducts, crawlHotProducts, toggleHotProductActive } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon', 'gmarket'];

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') ?? '10') || 10));
	const marketRaw = url.searchParams.get('market') ?? 'all';
	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

	try {
		const hotProducts = await getHotProducts({ page, limit, market });
		return { hotProducts, filters: { market } };
	} catch (e) {
		throw error(500, '핫 프로덕트 데이터를 불러오는데 실패했습니다.');
	}
};

export const actions = {
	crawl: async ({ request }) => {
		const formData = await request.formData();
		const marketRaw = (formData.get('market') as string) ?? 'all';
		const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

		try {
			const result = await crawlHotProducts(market);
			if (result.success) return { success: true, action: 'crawl', count: result.count, market };
			return fail(500, { error: '수집에 실패했습니다.' });
		} catch (e) {
			return fail(500, { error: '서버 오류가 발생했습니다.' });
		}
	},

	toggleActive: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const active = formData.get('active') === 'true';
		if (!id) return fail(400, { error: '상품 ID가 필요합니다.' });

		try {
			const result = await toggleHotProductActive(id, active);
			if (result.success) return { success: true, action: 'toggleActive' };
			return fail(500, { error: '상태 변경에 실패했습니다.' });
		} catch (e) {
			return fail(500, { error: '서버 오류가 발생했습니다.' });
		}
	}
} satisfies Actions;
