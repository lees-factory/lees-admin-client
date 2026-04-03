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

/** POST /v1/batch/update-prices — 가격 갱신 배치 */
export function updatePrices(req?: PriceUpdateRequest) {
	return apiPost<{ message: string; job: BatchJobStatus }>('/v1/batch/update-prices', req);
}

/** GET /v1/batch/status — 배치 상태 조회 */
export function getBatchStatus(jobType?: 'PRICE_UPDATE') {
	const params: Record<string, string> = {};
	if (jobType) params.job_type = jobType;
	return apiGet<BatchJobStatus | BatchStatusData>('/v1/batch/status', params);
}
