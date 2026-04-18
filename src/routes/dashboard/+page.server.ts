import { error, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getDashboardStats,
	getMarketStatuses,
	getCrawlLogs,
	getHotProducts
} from '$lib/adapters/admin';
import { getBatchStatus } from '$lib/server/api/batch';
import { getTokenStatus } from '$lib/server/api/token';

export const load: PageServerLoad = async (event) => {
	try {
		const [stats, marketStatuses, recentFailures, hotProducts] = await Promise.all([
			getDashboardStats(),
			getMarketStatuses(),
			getCrawlLogs({ page: 1, limit: 5, status: 'failed' }),
			getHotProducts({ page: 1, limit: 100 })
		]);

		// Bearer 기반 호출은 실패 시 redirect(401 자동 로그아웃) 또는 ApiError 발생 가능.
		// redirect는 반드시 bubble-up 시키고, 그 외 에러는 null/empty로 fallback.
		let batchStatus: Awaited<ReturnType<typeof getBatchStatus>>['data'] | null = null;
		try {
			const result = await getBatchStatus('SKU_SNAPSHOT_UPDATE', event);
			batchStatus = result.data ?? null;
		} catch (e) {
			if (isRedirect(e)) throw e;
		}

		let tokenStatus: Awaited<ReturnType<typeof getTokenStatus>>['data'] = { tokens: [] };
		try {
			const result = await getTokenStatus(undefined, event);
			tokenStatus = result.data ?? { tokens: [] };
		} catch (e) {
			if (isRedirect(e)) throw e;
		}

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
			batchStatus,
			tokenStatus: tokenStatus?.tokens ?? []
		};
	} catch (e) {
		if (isRedirect(e)) throw e;
		throw error(500, '대시보드 데이터를 불러오는데 실패했습니다.');
	}
};
