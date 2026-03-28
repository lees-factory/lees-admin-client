import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getCrawlLogs, getMarketStatuses, triggerCrawl } from '$lib/adapters/admin';
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

export const actions = {
	retry: async ({ request }) => {
		const formData = await request.formData();
		const itemId = formData.get('itemId') as string;
		if (!itemId) return fail(400, { error: '상품 ID가 필요합니다.' });

		try {
			const result = await triggerCrawl(itemId);
			if (result.success) return { success: true };
			return fail(500, { error: '재시도에 실패했습니다.' });
		} catch (e) {
			return fail(500, { error: '서버 오류가 발생했습니다.' });
		}
	}
} satisfies Actions;
