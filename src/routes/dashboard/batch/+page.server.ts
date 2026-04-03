import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getBatchStatus, loadHotProducts, enrichHotProductSkus, enrichAllSkus, updatePrices } from '$lib/server/api/batch';
import { ApiError } from '$lib/server/api/client';
import type { HotProductLoadRequest, PriceUpdateRequest, MarketType } from '$lib/types/api';

export const load: PageServerLoad = async () => {
	try {
		const statusResult = await getBatchStatus('PRICE_UPDATE');
		return { batchStatus: statusResult.data ?? null };
	} catch {
		return { batchStatus: null };
	}
};

export const actions = {
	loadHotProducts: async ({ request }) => {
		const formData = await request.formData();
		const req: HotProductLoadRequest = {};

		const keywords = formData.get('keywords') as string;
		const categoryIds = formData.get('category_ids') as string;
		const sort = formData.get('sort') as string;
		const minPrice = formData.get('min_sale_price') as string;
		const maxPrice = formData.get('max_sale_price') as string;

		if (keywords) req.keywords = keywords;
		if (categoryIds) req.category_ids = categoryIds.split(',').map((s) => s.trim()).filter(Boolean);
		if (sort) req.sort = sort;
		if (minPrice) req.min_sale_price = minPrice;
		if (maxPrice) req.max_sale_price = maxPrice;

		try {
			const result = await loadHotProducts(req);
			return { success: true, action: 'loadHotProducts', message: result.data?.message };
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : '인기 상품 적재에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	enrichHotProductSkus: async () => {
		try {
			const result = await enrichHotProductSkus();
			return { success: true, action: 'enrichHotProductSkus', message: result.data?.message };
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : 'SKU 보강에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	enrichAllSkus: async () => {
		try {
			const result = await enrichAllSkus();
			return { success: true, action: 'enrichAllSkus', message: result.data?.message };
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : '전체 SKU 보강에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	updatePrices: async ({ request }) => {
		const formData = await request.formData();
		const req: PriceUpdateRequest = {};

		const collectionSource = formData.get('collection_source') as string;
		const market = formData.get('market') as string;
		const productIds = formData.get('product_ids') as string;
		const collectedBefore = formData.get('collected_before') as string;
		const force = formData.get('force');
		const requestedBy = formData.get('requested_by') as string;

		if (collectionSource) req.collection_source = collectionSource;
		if (market) req.market = market as MarketType;
		if (productIds) req.product_ids = productIds.split(',').map((s) => s.trim()).filter(Boolean);
		if (collectedBefore) req.collected_before = collectedBefore;
		if (force === 'on') req.force = true;
		if (requestedBy) req.requested_by = requestedBy;

		try {
			const result = await updatePrices(req);
			return { success: true, action: 'updatePrices', message: result.data?.message, job: result.data?.job };
		} catch (e) {
			const msg = e instanceof ApiError ? e.message : '가격 갱신에 실패했습니다.';
			return fail(500, { error: msg });
		}
	}
} satisfies Actions;
