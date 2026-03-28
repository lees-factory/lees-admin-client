import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUsers } from '$lib/adapters/admin';
import type { UserPlan, UserStatus } from '$lib/adapters/admin';

const VALID_PLANS = ['all', 'free', 'pro'];
const VALID_STATUSES = ['all', 'active', 'inactive', 'deleted'];

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') ?? '10') || 10));
	const search = url.searchParams.get('search') ?? '';
	const planRaw = url.searchParams.get('plan') ?? 'all';
	const statusRaw = url.searchParams.get('status') ?? 'all';

	const plan = (VALID_PLANS.includes(planRaw) ? planRaw : 'all') as UserPlan | 'all';
	const status = (VALID_STATUSES.includes(statusRaw) ? statusRaw : 'all') as UserStatus | 'all';

	try {
		const users = await getUsers({ page, limit, search, plan, status });
		return { users, filters: { search, plan, status } };
	} catch (e) {
		throw error(500, '사용자 데이터를 불러오는데 실패했습니다.');
	}
};
