import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Mock Data for Dashboard
	return {
		stats: [
			{ label: 'Total Users', value: '12,345', change: '+12%', trend: 'up' },
			{ label: 'Active Sessions', value: '423', change: '-5%', trend: 'down' },
			{ label: 'Revenue (MTD)', value: '$45,231', change: '+8%', trend: 'up' },
			{ label: 'Audit Logs (Today)', value: '1,204', change: '+23%', trend: 'up' }
		],
		recentActivity: [
			{ id: 1, user: 'admin@example.com', action: 'user.create', target: 'user_8823', time: '2 mins ago', status: 'success' },
			{ id: 2, user: 'support@example.com', action: 'order.refund', target: 'ord_9921', time: '15 mins ago', status: 'success' },
			{ id: 3, user: 'system', action: 'backup.daily', target: 'db_main', time: '1 hour ago', status: 'success' },
			{ id: 4, user: 'unknown', action: 'login.failed', target: 'ip_192.168.1.1', time: '2 hours ago', status: 'warning' },
			{ id: 5, user: 'admin@example.com', action: 'settings.update', target: 'feature_flags', time: '3 hours ago', status: 'success' }
		]
	};
};
