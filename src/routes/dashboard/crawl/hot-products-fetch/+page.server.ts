import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHotProductsApiSources } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon'];

export const load: PageServerLoad = async ({ url }) => {
	const marketRaw = url.searchParams.get('market') ?? 'all';
	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

	try {
		const sources = await getHotProductsApiSources(market);
		return { sources, filters: { market } };
	} catch (e) {
		throw error(500, '핫프로덕트 API 소스를 불러오는데 실패했습니다.');
	}
};
