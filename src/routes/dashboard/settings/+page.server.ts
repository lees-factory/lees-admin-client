import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSettings, updateSettings } from '$lib/adapters/admin';

export const load: PageServerLoad = async () => {
	try {
		const settings = await getSettings();
		return { settings };
	} catch (e) {
		throw error(500, '설정을 불러오는데 실패했습니다.');
	}
};

function safeInt(value: FormDataEntryValue | null, fallback: number, min?: number, max?: number): number {
	const parsed = parseInt(value as string);
	if (isNaN(parsed)) return fallback;
	let result = parsed;
	if (min !== undefined) result = Math.max(min, result);
	if (max !== undefined) result = Math.min(max, result);
	return result;
}

export const actions = {
	save: async ({ request }) => {
		const formData = await request.formData();

		const settings = {
			crawlIntervalMinutes: safeInt(formData.get('crawlIntervalMinutes'), 360, 30, 1440),
			freePlanMaxItems: safeInt(formData.get('freePlanMaxItems'), 5, 1, 100),
			freePlanHistoryDays: safeInt(formData.get('freePlanHistoryDays'), 14, 1, 365),
			proPlanMaxItems: safeInt(formData.get('proPlanMaxItems'), 50, 1, 1000),
			proPlanHistoryDays: safeInt(formData.get('proPlanHistoryDays'), -1, -1, 3650),
			announcement: (formData.get('announcement') as string) ?? '',
			announcementActive: formData.get('announcementActive') === 'on'
		};

		try {
			const result = await updateSettings(settings);

			if (result.success) {
				return { success: true };
			}
			return fail(500, { error: '설정 저장에 실패했습니다.' });
		} catch (e) {
			return fail(500, { error: '서버 오류가 발생했습니다.' });
		}
	}
} satisfies Actions;
