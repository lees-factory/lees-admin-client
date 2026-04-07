import type { PageServerLoad } from './$types';
import { listProducts } from '$lib/server/api/products';
import type { ProductLanguage } from '$lib/types/api';

export const load: PageServerLoad = async ({ url }) => {
	const language = (url.searchParams.get('language') as ProductLanguage) || 'KO';
	const collectionSource = url.searchParams.get('collection_source') || '';

	try {
		const result = await listProducts({
			language,
			collection_source: collectionSource || undefined
		});
		return {
			products: result.data ?? { language, items: [] },
			filters: { language, collection_source: collectionSource }
		};
	} catch {
		return {
			products: { language, items: [] },
			filters: { language, collection_source: collectionSource }
		};
	}
};
