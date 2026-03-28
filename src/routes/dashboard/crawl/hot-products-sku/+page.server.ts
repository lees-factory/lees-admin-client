import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHotProducts, getCrawlRunnerState } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon'];

export const load: PageServerLoad = async ({ url }) => {
	const marketRaw = url.searchParams.get('market') ?? 'all';
	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

	try {
		const [hotProducts, runnerState] = await Promise.all([
			getHotProducts({ page: 1, limit: 100, market }),
			getCrawlRunnerState()
		]);
		return {
			items: hotProducts.data,
			schedule: runnerState.hotProductsSku.schedule,
			recentJobs: runnerState.hotProductsSku.recentJobs,
			filters: { market }
		};
	} catch (e) {
		throw error(500, '핫프로덕트 데이터를 불러오는데 실패했습니다.');
	}
};
