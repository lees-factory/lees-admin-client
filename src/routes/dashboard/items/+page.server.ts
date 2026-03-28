import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTrackedItems } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon', 'gmarket'];

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') ?? '10') || 10));
	const marketRaw = url.searchParams.get('market') ?? 'all';

	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

	try {
		const items = await getTrackedItems({ page, limit, market });
		return { items, filters: { market } };
	} catch (e) {
		throw error(500, '추적 상품 데이터를 불러오는데 실패했습니다.');
	}
};
