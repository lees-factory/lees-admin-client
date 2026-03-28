import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardStats } from '$lib/adapters/admin';

export const load: PageServerLoad = async () => {
	try {
		const rawStats = await getDashboardStats();

		const stats = [
			{ label: '전체 사용자', value: rawStats.totalUsers.toLocaleString(), sub: `오늘 +${rawStats.todaySignups}`, icon: 'Users' },
			{ label: '추적 상품', value: rawStats.totalTrackedItems.toLocaleString(), sub: `${rawStats.activeTrackings.toLocaleString()}개 활성`, icon: 'ShoppingBag' },
			{ label: 'Free / Pro', value: `${rawStats.freeUsers.toLocaleString()} / ${rawStats.proUsers.toLocaleString()}`, sub: `Pro ${((rawStats.proUsers / rawStats.totalUsers) * 100).toFixed(1)}%`, icon: 'CreditCard' },
			{ label: '수집 성공률 (24h)', value: `${rawStats.crawlSuccessRate}%`, sub: `실패 ${rawStats.crawlFailureRate}%`, icon: 'ChartBar' }
		];

		// TODO: 실제 API에서 최근 활동 로그를 가져올 때 교체
		const recentActivity = [
			{ user: 'kim@example.com', action: 'plan.upgraded', target: 'Free → Pro', status: 'success', time: '5분 전' },
			{ user: 'system', action: 'crawl.batch', target: 'Coupang 1,234건', status: 'success', time: '15분 전' },
			{ user: 'system', action: 'crawl.failed', target: 'Amazon 28건 실패', status: 'failed', time: '30분 전' },
			{ user: 'lee@example.com', action: 'item.added', target: 'AliExpress 상품 추가', status: 'success', time: '1시간 전' },
			{ user: 'system', action: 'alert.price_drop', target: 'AirPods Pro -10%', status: 'success', time: '2시간 전' }
		];

		return { stats, recentActivity };
	} catch (e) {
		throw error(500, '대시보드 데이터를 불러오는데 실패했습니다.');
	}
};
