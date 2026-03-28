/**
 * Price Eye Admin API Adapter
 *
 * TODO: 백엔드 API 연동 시 mock 데이터를 실제 fetch 호출로 교체
 * 엔드포인트 베이스: /v1/admin/*
 */

// ─── Types ───────────────────────────────────────────────────

export interface DashboardStats {
	totalUsers: number;
	todaySignups: number;
	totalTrackedItems: number;
	activeTrackings: number;
	freeUsers: number;
	proUsers: number;
	crawlSuccessRate: number; // 0-100
	crawlFailureRate: number; // 0-100
}

export type UserPlan = 'free' | 'pro';
export type UserStatus = 'active' | 'inactive' | 'deleted';

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	plan: UserPlan;
	status: UserStatus;
	emailVerified: boolean;
	trackedItemCount: number;
	createdAt: string;
	lastLoginAt: string | null;
}

export interface AdminUserListParams {
	page: number;
	limit: number;
	search?: string;
	plan?: UserPlan | 'all';
	status?: UserStatus | 'all';
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export type Market = 'aliexpress' | 'coupang' | 'amazon' | 'gmarket';

export interface TrackedItem {
	id: string;
	userId: string;
	userEmail: string;
	productName: string;
	market: Market;
	currentPrice: number;
	currency: string;
	lastCrawledAt: string | null;
	crawlStatus: 'success' | 'failed' | 'pending';
	createdAt: string;
	priceHistory: PricePoint[];
}

export interface PricePoint {
	price: number;
	date: string;
}

export interface CrawlLog {
	id: string;
	market: Market;
	itemId: string;
	productName: string;
	status: 'success' | 'failed';
	duration: number; // ms
	errorMessage?: string;
	createdAt: string;
}

export interface MarketStatus {
	market: Market;
	displayName: string;
	status: 'healthy' | 'degraded' | 'down';
	successRate: number;
	avgDuration: number; // ms
	lastCheckedAt: string;
	totalCrawls24h: number;
}

export interface SystemSettings {
	crawlIntervalMinutes: number;
	freePlanMaxItems: number;
	freePlanHistoryDays: number;
	proPlanMaxItems: number;
	proPlanHistoryDays: number; // -1 = unlimited
	announcement: string;
	announcementActive: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_DASHBOARD: DashboardStats = {
	totalUsers: 1243,
	todaySignups: 18,
	totalTrackedItems: 8721,
	activeTrackings: 6234,
	freeUsers: 1089,
	proUsers: 154,
	crawlSuccessRate: 94.7,
	crawlFailureRate: 5.3
};

const MOCK_USERS: AdminUser[] = [
	{
		id: 'u_001',
		email: 'kim@example.com',
		name: '김철수',
		plan: 'pro',
		status: 'active',
		emailVerified: true,
		trackedItemCount: 42,
		createdAt: '2025-11-15T09:00:00Z',
		lastLoginAt: '2026-03-28T02:30:00Z'
	},
	{
		id: 'u_002',
		email: 'lee@example.com',
		name: '이영희',
		plan: 'free',
		status: 'active',
		emailVerified: true,
		trackedItemCount: 5,
		createdAt: '2026-01-20T14:00:00Z',
		lastLoginAt: '2026-03-27T18:00:00Z'
	},
	{
		id: 'u_003',
		email: 'park@example.com',
		name: '박지민',
		plan: 'free',
		status: 'active',
		emailVerified: false,
		trackedItemCount: 2,
		createdAt: '2026-03-10T11:00:00Z',
		lastLoginAt: '2026-03-25T09:15:00Z'
	},
	{
		id: 'u_004',
		email: 'choi@example.com',
		name: '최수현',
		plan: 'pro',
		status: 'active',
		emailVerified: true,
		trackedItemCount: 38,
		createdAt: '2025-12-01T08:00:00Z',
		lastLoginAt: '2026-03-28T07:00:00Z'
	},
	{
		id: 'u_005',
		email: 'jung@example.com',
		name: '정민호',
		plan: 'free',
		status: 'inactive',
		emailVerified: true,
		trackedItemCount: 0,
		createdAt: '2026-02-14T16:00:00Z',
		lastLoginAt: '2026-02-28T12:00:00Z'
	},
	{
		id: 'u_006',
		email: 'han@example.com',
		name: '한소영',
		plan: 'free',
		status: 'active',
		emailVerified: true,
		trackedItemCount: 4,
		createdAt: '2026-03-01T10:00:00Z',
		lastLoginAt: '2026-03-27T20:00:00Z'
	},
	{
		id: 'u_007',
		email: 'yoon@example.com',
		name: '윤지훈',
		plan: 'pro',
		status: 'active',
		emailVerified: true,
		trackedItemCount: 50,
		createdAt: '2025-10-05T07:00:00Z',
		lastLoginAt: '2026-03-28T01:00:00Z'
	},
	{
		id: 'u_008',
		email: 'kang@example.com',
		name: '강민지',
		plan: 'free',
		status: 'active',
		emailVerified: false,
		trackedItemCount: 3,
		createdAt: '2026-03-20T13:00:00Z',
		lastLoginAt: '2026-03-26T15:00:00Z'
	}
];

const MOCK_TRACKED_ITEMS: TrackedItem[] = [
	{
		id: 'ti_001',
		userId: 'u_001',
		userEmail: 'kim@example.com',
		productName: 'Apple AirPods Pro 2nd Gen',
		market: 'coupang',
		currentPrice: 289000,
		currency: 'KRW',
		lastCrawledAt: '2026-03-28T06:00:00Z',
		crawlStatus: 'success',
		createdAt: '2026-01-15T09:00:00Z',
		priceHistory: [
			{ price: 329000, date: '2026-01-15' },
			{ price: 319000, date: '2026-02-01' },
			{ price: 299000, date: '2026-02-15' },
			{ price: 289000, date: '2026-03-01' }
		]
	},
	{
		id: 'ti_002',
		userId: 'u_002',
		userEmail: 'lee@example.com',
		productName: 'Xiaomi Robot Vacuum X10+',
		market: 'aliexpress',
		currentPrice: 45200,
		currency: 'KRW',
		lastCrawledAt: '2026-03-28T05:30:00Z',
		crawlStatus: 'success',
		createdAt: '2026-02-10T14:00:00Z',
		priceHistory: [
			{ price: 52000, date: '2026-02-10' },
			{ price: 48000, date: '2026-02-20' },
			{ price: 45200, date: '2026-03-15' }
		]
	},
	{
		id: 'ti_003',
		userId: 'u_004',
		userEmail: 'choi@example.com',
		productName: 'Samsung Galaxy S25 Ultra',
		market: 'coupang',
		currentPrice: 1650000,
		currency: 'KRW',
		lastCrawledAt: '2026-03-28T06:15:00Z',
		crawlStatus: 'success',
		createdAt: '2026-03-01T08:00:00Z',
		priceHistory: [
			{ price: 1790000, date: '2026-03-01' },
			{ price: 1720000, date: '2026-03-10' },
			{ price: 1650000, date: '2026-03-20' }
		]
	},
	{
		id: 'ti_004',
		userId: 'u_001',
		userEmail: 'kim@example.com',
		productName: 'Logitech MX Master 3S',
		market: 'amazon',
		currentPrice: 89000,
		currency: 'KRW',
		lastCrawledAt: null,
		crawlStatus: 'failed',
		createdAt: '2026-03-20T11:00:00Z',
		priceHistory: [{ price: 95000, date: '2026-03-20' }]
	},
	{
		id: 'ti_005',
		userId: 'u_007',
		userEmail: 'yoon@example.com',
		productName: 'Nike Air Max 97',
		market: 'gmarket',
		currentPrice: 179000,
		currency: 'KRW',
		lastCrawledAt: '2026-03-28T04:00:00Z',
		crawlStatus: 'success',
		createdAt: '2026-02-01T07:00:00Z',
		priceHistory: [
			{ price: 199000, date: '2026-02-01' },
			{ price: 189000, date: '2026-02-15' },
			{ price: 179000, date: '2026-03-01' }
		]
	},
	{
		id: 'ti_006',
		userId: 'u_003',
		userEmail: 'park@example.com',
		productName: 'Dyson V15 Detect',
		market: 'coupang',
		currentPrice: 890000,
		currency: 'KRW',
		lastCrawledAt: '2026-03-27T23:00:00Z',
		crawlStatus: 'failed',
		createdAt: '2026-03-15T13:00:00Z',
		priceHistory: [{ price: 920000, date: '2026-03-15' }]
	}
];

const MOCK_CRAWL_LOGS: CrawlLog[] = [
	{
		id: 'cl_001',
		market: 'coupang',
		itemId: 'ti_001',
		productName: 'Apple AirPods Pro 2nd Gen',
		status: 'success',
		duration: 1230,
		createdAt: '2026-03-28T06:00:00Z'
	},
	{
		id: 'cl_002',
		market: 'aliexpress',
		itemId: 'ti_002',
		productName: 'Xiaomi Robot Vacuum X10+',
		status: 'success',
		duration: 3450,
		createdAt: '2026-03-28T05:30:00Z'
	},
	{
		id: 'cl_003',
		market: 'coupang',
		itemId: 'ti_003',
		productName: 'Samsung Galaxy S25 Ultra',
		status: 'success',
		duration: 980,
		createdAt: '2026-03-28T06:15:00Z'
	},
	{
		id: 'cl_004',
		market: 'amazon',
		itemId: 'ti_004',
		productName: 'Logitech MX Master 3S',
		status: 'failed',
		duration: 15000,
		errorMessage: 'Timeout: page load exceeded 15s',
		createdAt: '2026-03-28T05:00:00Z'
	},
	{
		id: 'cl_005',
		market: 'gmarket',
		itemId: 'ti_005',
		productName: 'Nike Air Max 97',
		status: 'success',
		duration: 2100,
		createdAt: '2026-03-28T04:00:00Z'
	},
	{
		id: 'cl_006',
		market: 'coupang',
		itemId: 'ti_006',
		productName: 'Dyson V15 Detect',
		status: 'failed',
		duration: 15000,
		errorMessage: 'Selector not found: .prod-price',
		createdAt: '2026-03-27T23:00:00Z'
	},
	{
		id: 'cl_007',
		market: 'aliexpress',
		itemId: 'ti_002',
		productName: 'Xiaomi Robot Vacuum X10+',
		status: 'success',
		duration: 4200,
		createdAt: '2026-03-27T17:30:00Z'
	},
	{
		id: 'cl_008',
		market: 'coupang',
		itemId: 'ti_001',
		productName: 'Apple AirPods Pro 2nd Gen',
		status: 'success',
		duration: 1100,
		createdAt: '2026-03-27T18:00:00Z'
	}
];

const MOCK_MARKET_STATUS: MarketStatus[] = [
	{
		market: 'coupang',
		displayName: 'Coupang',
		status: 'healthy',
		successRate: 96.2,
		avgDuration: 1200,
		lastCheckedAt: '2026-03-28T06:15:00Z',
		totalCrawls24h: 3421
	},
	{
		market: 'aliexpress',
		displayName: 'AliExpress',
		status: 'healthy',
		successRate: 91.8,
		avgDuration: 3800,
		lastCheckedAt: '2026-03-28T05:30:00Z',
		totalCrawls24h: 1856
	},
	{
		market: 'amazon',
		displayName: 'Amazon',
		status: 'degraded',
		successRate: 72.4,
		avgDuration: 8500,
		lastCheckedAt: '2026-03-28T05:00:00Z',
		totalCrawls24h: 982
	},
	{
		market: 'gmarket',
		displayName: 'G-Market',
		status: 'healthy',
		successRate: 94.1,
		avgDuration: 2100,
		lastCheckedAt: '2026-03-28T04:00:00Z',
		totalCrawls24h: 1243
	}
];

const MOCK_SETTINGS: SystemSettings = {
	crawlIntervalMinutes: 360,
	freePlanMaxItems: 5,
	freePlanHistoryDays: 14,
	proPlanMaxItems: 50,
	proPlanHistoryDays: -1,
	announcement: '',
	announcementActive: false
};

// ─── Adapter Functions (mock) ────────────────────────────────
// TODO: 백엔드 연동 시 실제 fetch 호출로 교체

export async function getDashboardStats(): Promise<DashboardStats> {
	return MOCK_DASHBOARD;
}

export async function getUsers(
	params: AdminUserListParams
): Promise<PaginatedResponse<AdminUser>> {
	let filtered = [...MOCK_USERS];

	if (params.search) {
		const q = params.search.toLowerCase();
		filtered = filtered.filter(
			(u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
		);
	}
	if (params.plan && params.plan !== 'all') {
		filtered = filtered.filter((u) => u.plan === params.plan);
	}
	if (params.status && params.status !== 'all') {
		filtered = filtered.filter((u) => u.status === params.status);
	}

	const total = filtered.length;
	const start = (params.page - 1) * params.limit;
	const data = filtered.slice(start, start + params.limit);

	return {
		data,
		total,
		page: params.page,
		limit: params.limit,
		totalPages: Math.ceil(total / params.limit)
	};
}

export async function getUser(id: string): Promise<AdminUser | null> {
	return MOCK_USERS.find((u) => u.id === id) ?? null;
}

export async function updateUserPlan(
	_id: string,
	_plan: UserPlan
): Promise<{ success: boolean }> {
	// TODO: PATCH /v1/admin/users/:id
	return { success: true };
}

export async function updateUserStatus(
	_id: string,
	_status: UserStatus
): Promise<{ success: boolean }> {
	// TODO: PATCH /v1/admin/users/:id
	return { success: true };
}

export async function deleteUser(_id: string): Promise<{ success: boolean }> {
	// TODO: DELETE /v1/admin/users/:id
	return { success: true };
}

export async function getTrackedItems(params: {
	page: number;
	limit: number;
	market?: Market | 'all';
	status?: 'success' | 'failed' | 'pending' | 'all';
}): Promise<PaginatedResponse<TrackedItem>> {
	let filtered = [...MOCK_TRACKED_ITEMS];

	if (params.market && params.market !== 'all') {
		filtered = filtered.filter((i) => i.market === params.market);
	}
	if (params.status && params.status !== 'all') {
		filtered = filtered.filter((i) => i.crawlStatus === params.status);
	}

	const total = filtered.length;
	const start = (params.page - 1) * params.limit;
	const data = filtered.slice(start, start + params.limit);

	return {
		data,
		total,
		page: params.page,
		limit: params.limit,
		totalPages: Math.ceil(total / params.limit)
	};
}

export async function triggerCrawl(
	_itemId: string
): Promise<{ success: boolean }> {
	// TODO: POST /v1/admin/crawl/trigger
	return { success: true };
}

export async function getCrawlLogs(params: {
	page: number;
	limit: number;
	market?: Market | 'all';
	status?: 'success' | 'failed' | 'all';
}): Promise<PaginatedResponse<CrawlLog>> {
	let filtered = [...MOCK_CRAWL_LOGS];

	if (params.market && params.market !== 'all') {
		filtered = filtered.filter((l) => l.market === params.market);
	}
	if (params.status && params.status !== 'all') {
		filtered = filtered.filter((l) => l.status === params.status);
	}

	const total = filtered.length;
	const start = (params.page - 1) * params.limit;
	const data = filtered.slice(start, start + params.limit);

	return {
		data,
		total,
		page: params.page,
		limit: params.limit,
		totalPages: Math.ceil(total / params.limit)
	};
}

export async function getMarketStatuses(): Promise<MarketStatus[]> {
	return MOCK_MARKET_STATUS;
}

export async function getSettings(): Promise<SystemSettings> {
	return MOCK_SETTINGS;
}

export async function updateSettings(
	_settings: Partial<SystemSettings>
): Promise<{ success: boolean }> {
	// TODO: PATCH /v1/admin/settings
	return { success: true };
}
