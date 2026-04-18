import { fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	getBatchStatus,
	loadHotProducts,
	enrichHotProductSkus,
	enrichAllSkus,
	updateSkuSnapshots
} from '$lib/server/api/batch';
import { ApiError } from '$lib/server/api/client';
import type {
	Currency,
	HotProductLoadRequest,
	MarketType,
	PriceUpdateRequest,
	TargetGroup
} from '$lib/types/api';

const VALID_CURRENCIES: Currency[] = ['KRW', 'USD'];
const VALID_TARGET_GROUPS: TargetGroup[] = ['ALL', 'HOT_PRODUCTS', 'TRACKED'];

export const load: PageServerLoad = async (event) => {
	try {
		const result = await getBatchStatus('SKU_SNAPSHOT_UPDATE', event);
		return { skuBatchStatus: result.data ?? null };
	} catch (e) {
		if (isRedirect(e)) throw e;
		return { skuBatchStatus: null };
	}
};

export const actions = {
	loadHotProducts: async (event) => {
		const formData = await event.request.formData();
		const req: HotProductLoadRequest = {};

		const keywords = formData.get('keywords') as string;
		const categoryIds = formData.get('category_ids') as string;
		const sort = formData.get('sort') as string;
		const minPrice = formData.get('min_sale_price') as string;
		const maxPrice = formData.get('max_sale_price') as string;

		if (keywords) req.keywords = keywords;
		if (categoryIds)
			req.category_ids = categoryIds
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		if (sort) req.sort = sort;
		if (minPrice) req.min_sale_price = minPrice;
		if (maxPrice) req.max_sale_price = maxPrice;

		try {
			const result = await loadHotProducts(req, event);
			return { success: true, action: 'loadHotProducts', message: result.data?.message };
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg = e instanceof ApiError ? e.message : '인기 상품 적재에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	enrichHotProductSkus: async (event) => {
		try {
			const result = await enrichHotProductSkus(event);
			return { success: true, action: 'enrichHotProductSkus', message: result.data?.message };
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg = e instanceof ApiError ? e.message : 'SKU 보강에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	enrichAllSkus: async (event) => {
		try {
			const result = await enrichAllSkus(event);
			return { success: true, action: 'enrichAllSkus', message: result.data?.message };
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg = e instanceof ApiError ? e.message : '전체 SKU 보강에 실패했습니다.';
			return fail(500, { error: msg });
		}
	},

	updateSkuSnapshots: async (event) => {
		const formData = await event.request.formData();
		const req: PriceUpdateRequest = {};

		const collectionSource = formData.get('collection_source') as string;
		const market = formData.get('market') as string;
		const productIds = formData.get('product_ids') as string;
		const targetGroupRaw = formData.get('target_group') as string;
		const currenciesRaw = formData.getAll('currencies') as string[];
		const force = formData.get('force');
		const requestedBy = formData.get('requested_by') as string;

		if (collectionSource) req.collection_source = collectionSource;
		if (market) req.market = market as MarketType;
		if (productIds)
			req.product_ids = productIds
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		if (targetGroupRaw && VALID_TARGET_GROUPS.includes(targetGroupRaw as TargetGroup)) {
			req.target_group = targetGroupRaw as TargetGroup;
		}
		const currencies = currenciesRaw.filter((c): c is Currency =>
			VALID_CURRENCIES.includes(c as Currency)
		);
		if (currencies.length > 0) req.currencies = currencies;
		if (force === 'on') req.force = true;
		if (requestedBy) req.requested_by = requestedBy;

		try {
			const result = await updateSkuSnapshots(req, event);
			return {
				success: true,
				action: 'updateSkuSnapshots',
				message: result.data?.message,
				job: result.data?.job
			};
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg = e instanceof ApiError ? e.message : 'SKU snapshot 갱신에 실패했습니다.';
			return fail(500, { error: msg });
		}
	}
} satisfies Actions;
