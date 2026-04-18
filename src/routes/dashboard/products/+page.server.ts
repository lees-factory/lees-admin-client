import { isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listProducts } from '$lib/server/api/products';
import type { ProductLanguage } from '$lib/types/api';

export const load: PageServerLoad = async (event) => {
	const { url } = event;
	const language = (url.searchParams.get('language') as ProductLanguage) || 'KO';
	const collectionSource = url.searchParams.get('collection_source') || '';

	try {
		const result = await listProducts(
			{
				language,
				collection_source: collectionSource || undefined
			},
			event
		);
		return {
			products: result.data ?? { language, items: [] },
			filters: { language, collection_source: collectionSource }
		};
	} catch (e) {
		if (isRedirect(e)) throw e;
		return {
			products: { language, items: [] },
			filters: { language, collection_source: collectionSource }
		};
	}
};
