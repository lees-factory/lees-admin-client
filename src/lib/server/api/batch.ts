import { apiGet, apiPost } from './client';
import type {
	BatchJobStatus,
	BatchStatusData,
	HotProductLoadRequest,
	PriceUpdateRequest
} from '$lib/types/api';

/** POST /v1/batch/load-hot-products — 인기 상품 적재 */
export function loadHotProducts(req?: HotProductLoadRequest) {
	return apiPost<{ message: string }>('/v1/batch/load-hot-products', req);
}

/** POST /v1/batch/enrich-skus/hot-products — 인기 상품 SKU 보강 */
export function enrichHotProductSkus() {
	return apiPost<{ message: string }>('/v1/batch/enrich-skus/hot-products');
}

/** POST /v1/batch/enrich-skus/all — 전체 상품 SKU 보강 */
export function enrichAllSkus() {
	return apiPost<{ message: string }>('/v1/batch/enrich-skus/all');
}

/** POST /v1/batch/update-product-prices — 가격 갱신 배치 */
export function updateProductPrices(req?: PriceUpdateRequest) {
	return apiPost<{ message: string; job: BatchJobStatus }>('/v1/batch/update-product-prices', req);
}

/** POST /v1/batch/update-sku-snapshots — SKU snapshot 갱신 배치 */
export function updateSkuSnapshots(req?: PriceUpdateRequest) {
	return apiPost<{ message: string; job: BatchJobStatus }>('/v1/batch/update-sku-snapshots', req);
}

/** GET /v1/batch/status — 배치 상태 조회 */
export function getBatchStatus(jobType?: 'PRICE_UPDATE' | 'SKU_SNAPSHOT_UPDATE') {
	const params: Record<string, string> = {};
	if (jobType) params.job_type = jobType;
	return apiGet<BatchJobStatus | BatchStatusData>('/v1/batch/status', params);
}
