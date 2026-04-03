import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getDashboardStats,
	getMarketStatuses,
	getCrawlLogs,
	getHotProducts
} from '$lib/adapters/admin';
import { getBatchStatus } from '$lib/server/api/batch';
import { getTokenStatus } from '$lib/server/api/token';

export const load: PageServerLoad = async () => {
	try {
		const [stats, marketStatuses, recentFailures, hotProducts, batchStatusResult, tokenStatusResult] = await Promise.all([
			getDashboardStats(),
			getMarketStatuses(),
			getCrawlLogs({ page: 1, limit: 5, status: 'failed' }),
			getHotProducts({ page: 1, limit: 100 }),
			getBatchStatus('PRICE_UPDATE').catch(() => ({ data: null })),
			getTokenStatus().catch(() => ({ data: { tokens: [] } }))
		]);

		// 핫프로덕트 마켓별 active 집계
		const hotProductSummary = {
			total: hotProducts.total,
			active: hotProducts.data.filter((p) => p.active).length,
			byMarket: (['coupang', 'aliexpress', 'amazon'] as const).map((m) => {
				const items = hotProducts.data.filter((p) => p.market === m);
				return {
					market: m,
					total: items.length,
					active: items.filter((p) => p.active).length
				};
			})
		};

		return {
			stats,
			marketStatuses,
			recentFailures: recentFailures.data,
			hotProductSummary,
			batchStatus: batchStatusResult.data,
			tokenStatus: tokenStatusResult.data?.tokens ?? []
		};
	} catch (e) {
		throw error(500, '대시보드 데이터를 불러오는데 실패했습니다.');
	}
};
