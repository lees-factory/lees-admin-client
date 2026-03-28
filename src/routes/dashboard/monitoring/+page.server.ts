import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCrawlLogs, getMarketStatuses } from '$lib/adapters/admin';
import type { Market } from '$lib/adapters/admin';

const VALID_MARKETS = ['all', 'coupang', 'aliexpress', 'amazon', 'gmarket'];
const VALID_STATUSES = ['all', 'success', 'failed'];

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') ?? '10') || 10));
	const marketRaw = url.searchParams.get('market') ?? 'all';
	const statusRaw = url.searchParams.get('status') ?? 'all';

	const market = (VALID_MARKETS.includes(marketRaw) ? marketRaw : 'all') as Market | 'all';
	const status = (VALID_STATUSES.includes(statusRaw) ? statusRaw : 'all') as 'success' | 'failed' | 'all';

	try {
		const [marketStatuses, crawlLogs] = await Promise.all([
			getMarketStatuses(),
			getCrawlLogs({ page, limit, market, status })
		]);

		return { marketStatuses, crawlLogs, filters: { market, status } };
	} catch (e) {
		throw error(500, '모니터링 데이터를 불러오는데 실패했습니다.');
	}
};
