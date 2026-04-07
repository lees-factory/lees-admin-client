import { apiGet } from './client';
import type { ProductListData, ProductListParams } from '$lib/types/api';

/** GET /v1/products — 상품 목록 조회 */
export function listProducts(params?: ProductListParams) {
	const query: Record<string, string> = {};
	if (params?.language) query.language = params.language;
	if (params?.collection_source) query.collection_source = params.collection_source;
	return apiGet<ProductListData>('/v1/products', query);
}
