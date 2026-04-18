import { error, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listUsers } from '$lib/server/api/users';
import type { UserPlan, UserStatus } from '$lib/types/api';

const VALID_PLANS: (UserPlan | 'all')[] = ['all', 'FREE'];
const VALID_STATUSES: (UserStatus | 'all')[] = ['all', 'ACTIVE', 'INACTIVE'];

// 세션 revoke 액션은 /dashboard/users/[user_id]로 이관.
// 이 페이지는 목록 조회 전용.
export const load: PageServerLoad = async (event) => {
	const { url } = event;
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1);
	const pageSize = Math.max(
		1,
		Math.min(100, parseInt(url.searchParams.get('page_size') ?? '20') || 20)
	);
	const search = url.searchParams.get('search') ?? '';
	const planRaw = url.searchParams.get('plan') ?? 'all';
	const statusRaw = url.searchParams.get('status') ?? 'all';

	const plan = (VALID_PLANS.includes(planRaw as UserPlan | 'all') ? planRaw : 'all') as
		| UserPlan
		| 'all';
	const status = (VALID_STATUSES.includes(statusRaw as UserStatus | 'all') ? statusRaw : 'all') as
		| UserStatus
		| 'all';

	try {
		const result = await listUsers(
			{
				page,
				page_size: pageSize,
				search: search || undefined,
				plan: plan !== 'all' ? plan : undefined,
				status: status !== 'all' ? status : undefined
			},
			event
		);

		return {
			users: result.data!,
			filters: { search, plan, status }
		};
	} catch (e) {
		if (isRedirect(e)) throw e;
		throw error(500, '사용자 데이터를 불러오는데 실패했습니다.');
	}
};
