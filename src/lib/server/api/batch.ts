import type { RequestEvent } from '@sveltejs/kit';
import { apiGet, apiPost } from './client';
import type {
	BatchJobStatus,
	BatchStatusData,
	HotProductLoadRequest,
	PriceUpdateRequest
} from '$lib/types/api';

type Ev = Pick<RequestEvent, 'locals' | 'cookies'>;

/** POST /v1/batch/load-hot-products — 인기 상품 적재 */
export function loadHotProducts(req: HotProductLoadRequest | undefined, event: Ev) {
	return apiPost<{ message: string }>('/v1/batch/load-hot-products', req, { event });
}

/** POST /v1/batch/enrich-skus/hot-products — 인기 상품 SKU 보강 */
export function enrichHotProductSkus(event: Ev) {
	return apiPost<{ message: string }>('/v1/batch/enrich-skus/hot-products', undefined, { event });
}

/** POST /v1/batch/enrich-skus/all — 전체 상품 SKU 보강 */
export function enrichAllSkus(event: Ev) {
	return apiPost<{ message: string }>('/v1/batch/enrich-skus/all', undefined, { event });
}

/** POST /v1/batch/update-sku-snapshots — SKU snapshot 갱신 배치 */
export function updateSkuSnapshots(req: PriceUpdateRequest | undefined, event: Ev) {
	return apiPost<{ message: string; job: BatchJobStatus }>(
		'/v1/batch/update-sku-snapshots',
		req,
		{ event }
	);
}

/** GET /v1/batch/status — 배치 상태 조회 */
export function getBatchStatus(jobType: 'SKU_SNAPSHOT_UPDATE' | undefined, event: Ev) {
	const params: Record<string, string> = {};
	if (jobType) params.job_type = jobType;
	return apiGet<BatchJobStatus | BatchStatusData>('/v1/batch/status', params, { event });
}
