import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCrawlTargetItems, getCrawlRunnerState } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon'];

export const load: PageServerLoad = async ({ url }) => {
	const marketRaw = url.searchParams.get('market') ?? 'all';
	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';

	try {
		const [items, runnerState] = await Promise.all([
			getCrawlTargetItems(market),
			getCrawlRunnerState()
		]);
		return {
			items,
			schedule: runnerState.userItems.schedule,
			recentJobs: runnerState.userItems.recentJobs,
			filters: { market }
		};
	} catch (e) {
		throw error(500, '크롤 대상 아이템을 불러오는데 실패했습니다.');
	}
};
