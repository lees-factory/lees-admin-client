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

export type Market = 'aliexpress' | 'coupang' | 'amazon';

export interface TrackedItem {
	id: string;
	userId: string;
	userEmail: string;
	productName: string;
	productUrl: string;
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
	productUrl: string;
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

export interface HotProduct {
	id: string;
	trackedItemId: string;
	productName: string;
	productUrl: string;
	market: Market;
	currentPrice: number;
	currency: string;
	imageUrl: string;
	rank: number;
	active: boolean;
	lastCrawledAt: string | null;
	crawlStatus: 'success' | 'failed' | 'pending';
	createdAt: string;
	updatedAt: string;
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

// ─── Crawl Runner Types ─────────────────────────────────────

export type CrawlJobType = 'user-items' | 'hot-products-fetch' | 'hot-products-sku';

export interface HotProductsApiSource {
	id: string;
	market: Market;
	apiName: string;
	endpoint: string;
	description: string;
	lastFetchedAt: string | null;
	lastFetchedCount: number;
}
export type CrawlJobStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface CrawlSchedule {
	enabled: boolean;
	intervalMinutes: number;
	lastRunAt: string | null;
	nextRunAt: string | null;
}

export interface CrawlJob {
	id: string;
	type: CrawlJobType;
	status: CrawlJobStatus;
	market: Market | 'all';
	totalItems: number;
	processedItems: number;
	successCount: number;
	failCount: number;
	startedAt: string | null;
	completedAt: string | null;
	errorMessage?: string;
}

export interface CrawlRunnerState {
	userItems: {
		schedule: CrawlSchedule;
		lastJob: CrawlJob | null;
		recentJobs: CrawlJob[];
	};
	hotProductsSku: {
		schedule: CrawlSchedule;
		lastJob: CrawlJob | null;
		recentJobs: CrawlJob[];
	};
}

function mockProductUrl(market: Market, id: string): string {
	const domains: Record<Market, string> = {
		coupang: 'https://www.coupang.com/vp/products/',
		aliexpress: 'https://www.aliexpress.com/item/',
		amazon: 'https://www.amazon.com/dp/'
	};
	return `${domains[market]}${id}`;
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
		productUrl: mockProductUrl('coupang', 'ti_001'),
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
		productUrl: mockProductUrl('aliexpress', 'ti_002'),
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
		productUrl: mockProductUrl('coupang', 'ti_003'),
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
		productUrl: mockProductUrl('amazon', 'ti_004'),
		market: 'amazon',
		currentPrice: 89000,
		currency: 'KRW',
		lastCrawledAt: null,
		crawlStatus: 'failed',
		createdAt: '2026-03-20T11:00:00Z',
		priceHistory: [{ price: 95000, date: '2026-03-20' }]
	},
	{
		id: 'ti_006',
		userId: 'u_003',
		userEmail: 'park@example.com',
		productName: 'Dyson V15 Detect',
		productUrl: mockProductUrl('coupang', 'ti_006'),
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
		productUrl: mockProductUrl('coupang', 'ti_001'),
		status: 'success',
		duration: 1230,
		createdAt: '2026-03-28T06:00:00Z'
	},
	{
		id: 'cl_002',
		market: 'aliexpress',
		itemId: 'ti_002',
		productName: 'Xiaomi Robot Vacuum X10+',
		productUrl: mockProductUrl('aliexpress', 'ti_002'),
		status: 'success',
		duration: 3450,
		createdAt: '2026-03-28T05:30:00Z'
	},
	{
		id: 'cl_003',
		market: 'coupang',
		itemId: 'ti_003',
		productName: 'Samsung Galaxy S25 Ultra',
		productUrl: mockProductUrl('coupang', 'ti_003'),
		status: 'success',
		duration: 980,
		createdAt: '2026-03-28T06:15:00Z'
	},
	{
		id: 'cl_004',
		market: 'amazon',
		itemId: 'ti_004',
		productName: 'Logitech MX Master 3S',
		productUrl: mockProductUrl('amazon', 'ti_004'),
		status: 'failed',
		duration: 15000,
		errorMessage: 'Timeout: page load exceeded 15s',
		createdAt: '2026-03-28T05:00:00Z'
	},
	{
		id: 'cl_006',
		market: 'coupang',
		itemId: 'ti_006',
		productName: 'Dyson V15 Detect',
		productUrl: mockProductUrl('coupang', 'ti_006'),
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
		productUrl: mockProductUrl('aliexpress', 'ti_002'),
		status: 'success',
		duration: 4200,
		createdAt: '2026-03-27T17:30:00Z'
	},
	{
		id: 'cl_008',
		market: 'coupang',
		itemId: 'ti_001',
		productName: 'Apple AirPods Pro 2nd Gen',
		productUrl: mockProductUrl('coupang', 'ti_001'),
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
];

// 핫프로덕트: 수집(fetch) 결과로 쌓인 목록 — 마켓별 10개씩 총 30개
const HOT_PRODUCT_SEED: { name: string; market: Market; price: number; active: boolean; status: 'success' | 'failed' | 'pending' }[] = [
	// Coupang 10개
	{ name: 'Apple AirPods Pro 2nd Gen', market: 'coupang', price: 289000, active: true, status: 'success' },
	{ name: 'Samsung Galaxy S25 Ultra', market: 'coupang', price: 1650000, active: true, status: 'success' },
	{ name: '다이슨 에어랩 컴플리트', market: 'coupang', price: 598000, active: true, status: 'success' },
	{ name: 'LG 그램 17 2026', market: 'coupang', price: 1890000, active: true, status: 'success' },
	{ name: '쿠쿠 IH 전기밥솥', market: 'coupang', price: 289000, active: false, status: 'success' },
	{ name: '삼성 비스포크 제트 AI', market: 'coupang', price: 1190000, active: false, status: 'success' },
	{ name: '오설록 프리미엄 세트', market: 'coupang', price: 42000, active: false, status: 'pending' },
	{ name: '닌텐도 스위치 2', market: 'coupang', price: 449000, active: true, status: 'success' },
	{ name: '코웨이 아이콘 정수기', market: 'coupang', price: 38900, active: false, status: 'failed' },
	{ name: '필립스 소닉케어 다이아몬드', market: 'coupang', price: 189000, active: false, status: 'success' },
	// AliExpress 10개
	{ name: 'Xiaomi Robot Vacuum X10+', market: 'aliexpress', price: 45200, active: true, status: 'success' },
	{ name: 'Baseus 65W GaN Charger', market: 'aliexpress', price: 18500, active: true, status: 'success' },
	{ name: 'Dreame L20 Ultra', market: 'aliexpress', price: 82000, active: true, status: 'success' },
	{ name: 'QCY HT07 ANC Earbuds', market: 'aliexpress', price: 23400, active: false, status: 'success' },
	{ name: 'Ugreen Nexode 100W', market: 'aliexpress', price: 32000, active: false, status: 'success' },
	{ name: 'POCO F6 Pro 512GB', market: 'aliexpress', price: 389000, active: true, status: 'success' },
	{ name: 'Anker Soundcore Space Q45', market: 'aliexpress', price: 67000, active: false, status: 'failed' },
	{ name: 'Roborock S8 MaxV Ultra', market: 'aliexpress', price: 125000, active: true, status: 'success' },
	{ name: 'Xiaomi Smart Band 9 Pro', market: 'aliexpress', price: 42000, active: false, status: 'pending' },
	{ name: 'Redmi Buds 5 Pro', market: 'aliexpress', price: 28000, active: false, status: 'success' },
	// Amazon 10개
	{ name: 'Logitech MX Master 3S', market: 'amazon', price: 89000, active: true, status: 'success' },
	{ name: 'Sony WH-1000XM5', market: 'amazon', price: 328000, active: true, status: 'success' },
	{ name: 'Kindle Paperwhite 2025', market: 'amazon', price: 159000, active: true, status: 'success' },
	{ name: 'Apple Magic Keyboard', market: 'amazon', price: 135000, active: false, status: 'success' },
	{ name: 'Anker 737 Power Bank', market: 'amazon', price: 78000, active: false, status: 'success' },
	{ name: 'Bose QC Ultra Headphones', market: 'amazon', price: 389000, active: true, status: 'failed' },
	{ name: 'Razer Viper V3 Pro', market: 'amazon', price: 189000, active: false, status: 'success' },
	{ name: 'SteelSeries Arctis Nova 7', market: 'amazon', price: 156000, active: false, status: 'success' },
	{ name: 'Corsair K70 RGB TKL', market: 'amazon', price: 145000, active: false, status: 'pending' },
	{ name: 'Samsung T7 Shield SSD 2TB', market: 'amazon', price: 178000, active: true, status: 'success' },
];

const MOCK_HOT_PRODUCTS: HotProduct[] = HOT_PRODUCT_SEED.map((s, i) => ({
	id: `hp_${String(i + 1).padStart(3, '0')}`,
	trackedItemId: `hpti_${String(i + 1).padStart(3, '0')}`,
	productName: s.name,
	productUrl: mockProductUrl(s.market, `hp_${String(i + 1).padStart(3, '0')}`),
	market: s.market,
	currentPrice: s.price,
	currency: 'KRW',
	imageUrl: '',
	rank: i + 1,
	active: s.active,
	lastCrawledAt: s.status !== 'pending' ? '2026-03-28T06:00:00Z' : null,
	crawlStatus: s.status,
	createdAt: '2026-03-20T09:00:00Z',
	updatedAt: '2026-03-28T06:00:00Z'
}));

const MOCK_SETTINGS: SystemSettings = {
	crawlIntervalMinutes: 360,
	freePlanMaxItems: 5,
	freePlanHistoryDays: 14,
	proPlanMaxItems: 50,
	proPlanHistoryDays: -1,
	announcement: '',
	announcementActive: false
};

const MOCK_CRAWL_RUNNER_STATE: CrawlRunnerState = {
	userItems: {
		schedule: {
			enabled: false,
			intervalMinutes: 360,
			lastRunAt: '2026-03-28T06:00:00Z',
			nextRunAt: null
		},
		lastJob: {
			id: 'cj_001',
			type: 'user-items',
			status: 'completed',
			market: 'all',
			totalItems: 156,
			processedItems: 156,
			successCount: 148,
			failCount: 8,
			startedAt: '2026-03-28T06:00:00Z',
			completedAt: '2026-03-28T06:12:34Z'
		},
		recentJobs: [
			{
				id: 'cj_001',
				type: 'user-items',
				status: 'completed',
				market: 'all',
				totalItems: 156,
				processedItems: 156,
				successCount: 148,
				failCount: 8,
				startedAt: '2026-03-28T06:00:00Z',
				completedAt: '2026-03-28T06:12:34Z'
			},
			{
				id: 'cj_002',
				type: 'user-items',
				status: 'completed',
				market: 'coupang',
				totalItems: 72,
				processedItems: 72,
				successCount: 70,
				failCount: 2,
				startedAt: '2026-03-27T18:00:00Z',
				completedAt: '2026-03-27T18:05:12Z'
			},
			{
				id: 'cj_003',
				type: 'user-items',
				status: 'failed',
				market: 'amazon',
				totalItems: 34,
				processedItems: 12,
				successCount: 10,
				failCount: 2,
				startedAt: '2026-03-27T12:00:00Z',
				completedAt: '2026-03-27T12:03:45Z',
				errorMessage: 'Rate limit exceeded — Amazon blocked after 12 requests'
			}
		]
	},
	hotProductsSku: {
		schedule: {
			enabled: true,
			intervalMinutes: 720,
			lastRunAt: '2026-03-28T00:00:00Z',
			nextRunAt: '2026-03-28T12:00:00Z'
		},
		lastJob: {
			id: 'cj_010',
			type: 'hot-products-sku',
			status: 'completed',
			market: 'all',
			totalItems: 5,
			processedItems: 5,
			successCount: 4,
			failCount: 1,
			startedAt: '2026-03-28T00:00:00Z',
			completedAt: '2026-03-28T00:02:18Z'
		},
		recentJobs: [
			{
				id: 'cj_010',
				type: 'hot-products-sku',
				status: 'completed',
				market: 'all',
				totalItems: 5,
				processedItems: 5,
				successCount: 4,
				failCount: 1,
				startedAt: '2026-03-28T00:00:00Z',
				completedAt: '2026-03-28T00:02:18Z'
			},
			{
				id: 'cj_011',
				type: 'hot-products-sku',
				status: 'completed',
				market: 'coupang',
				totalItems: 2,
				processedItems: 2,
				successCount: 2,
				failCount: 0,
				startedAt: '2026-03-27T12:00:00Z',
				completedAt: '2026-03-27T12:00:45Z'
			}
		]
	}
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

// ─── Hot Products ───────────────────────────────────────────

export async function getHotProducts(params: {
	page: number;
	limit: number;
	market?: Market | 'all';
}): Promise<PaginatedResponse<HotProduct>> {
	// TODO: GET /v1/admin/hot-products?page=&limit=&market=
	let filtered = [...MOCK_HOT_PRODUCTS].sort((a, b) => a.rank - b.rank);

	if (params.market && params.market !== 'all') {
		filtered = filtered.filter((p) => p.market === params.market);
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

export async function toggleHotProductActive(
	_id: string,
	_active: boolean
): Promise<{ success: boolean }> {
	// TODO: PATCH /v1/admin/hot-products/:id/active
	return { success: true };
}

export async function crawlHotProducts(
	market?: Market | 'all'
): Promise<{ success: boolean; count: number }> {
	// TODO: POST /v1/admin/hot-products/crawl  body: { market }
	const targets = market && market !== 'all'
		? MOCK_HOT_PRODUCTS.filter((p) => p.market === market)
		: MOCK_HOT_PRODUCTS;
	return { success: true, count: targets.length };
}

// ─── Crawl Simulation Items ─────────────────────────────────

export interface CrawlTargetItem {
	id: string;
	productName: string;
	market: Market;
	url: string;
	userEmail: string;
}

const PRODUCT_NAMES_KR = [
	'삼성 갤럭시 S25 울트라', '애플 아이폰 16 프로맥스', 'LG 그램 17인치', '소니 WH-1000XM5',
	'다이슨 V15 디텍트', '샤오미 로봇청소기 X10+', '닌텐도 스위치 2', '로지텍 MX Master 3S',
	'에어팟 프로 2세대', '갤럭시 버즈3 프로', '애플워치 울트라2', '갤럭시워치 울트라',
	'아이패드 프로 M4', '갤럭시탭 S10 울트라', '맥북 프로 16인치', '레노버 씽크패드 X1',
	'커세어 K70 RGB', '레이저 바이퍼 V3', '스틸시리즈 아크티스 노바7', 'JBL 플립6',
	'보스 QC 울트라', '필립스 에어프라이어 XXL', '드롱기 커피머신', '브레빌 에스프레소',
	'나이키 에어맥스 97', '아디다스 울트라부스트', '뉴발란스 993', '아식스 젤 카야노 31',
	'삼성 비스포크 냉장고', 'LG 디오스 식기세척기', '쿠쿠 전기밥솥', '위닉스 공기청정기',
	'발뮤다 토스터', '일렉트로룩스 세탁기', '삼성 BESPOKE AI 세탁기', 'LG 스타일러',
	'오큘러스 퀘스트3', 'PS5 프로', 'Xbox 시리즈X', '스팀덱 OLED',
	'캐논 EOS R5', '소니 A7R V', '후지필름 X-T5', 'DJI 미니4 프로',
	'고프로 히어로13', 'Anker 보조배터리 26800', '삼성 T7 SSD 2TB', 'WD 외장하드 5TB',
	'벤큐 모니터 32인치', 'LG 울트라기어 27GP850', '삼성 오디세이 G9', '델 U3423WE',
];

const USER_NAMES = [
	'kim', 'lee', 'park', 'choi', 'jung', 'han', 'yoon', 'kang', 'cho', 'shin',
	'oh', 'seo', 'kwon', 'hwang', 'ahn', 'song', 'jeon', 'lim', 'bae', 'ryu'
];

const MARKETS: Market[] = ['coupang', 'aliexpress', 'amazon'];

function generateCrawlTargetItems(count: number): CrawlTargetItem[] {
	const items: CrawlTargetItem[] = [];
	for (let i = 0; i < count; i++) {
		const market = MARKETS[i % MARKETS.length];
		const productName = PRODUCT_NAMES_KR[i % PRODUCT_NAMES_KR.length] + (i >= PRODUCT_NAMES_KR.length ? ` (${Math.floor(i / PRODUCT_NAMES_KR.length) + 1})` : '');
		const user = USER_NAMES[i % USER_NAMES.length];
		const domains: Record<Market, string> = {
			coupang: 'coupang.com/vp/products/',
			aliexpress: 'aliexpress.com/item/',
			amazon: 'amazon.com/dp/'
		};
		items.push({
			id: `cti_${String(i + 1).padStart(3, '0')}`,
			productName,
			market,
			url: `https://www.${domains[market]}${100000 + i}`,
			userEmail: `${user}${Math.floor(i / 20) + 1}@example.com`
		});
	}
	return items;
}

const MOCK_CRAWL_TARGET_ITEMS = generateCrawlTargetItems(200);

const MOCK_HOT_PRODUCTS_API_SOURCES: HotProductsApiSource[] = [
	{
		id: 'hpas_001',
		market: 'coupang',
		apiName: 'Coupang Partners API',
		endpoint: 'https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories',
		description: '쿠팡 베스트 카테고리 상품 목록',
		lastFetchedAt: '2026-03-28T06:00:00Z',
		lastFetchedCount: 6
	},
	{
		id: 'hpas_002',
		market: 'coupang',
		apiName: 'Coupang Goldbox API',
		endpoint: 'https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/products/goldbox',
		description: '쿠팡 골드박스(타임딜) 상품 목록',
		lastFetchedAt: '2026-03-28T06:00:00Z',
		lastFetchedCount: 4
	},
	{
		id: 'hpas_003',
		market: 'aliexpress',
		apiName: 'AliExpress Affiliate Hot Products',
		endpoint: 'https://api-sg.aliexpress.com/sync/affiliate/hot_product/query',
		description: 'AliExpress 인기 상품 API',
		lastFetchedAt: '2026-03-28T05:30:00Z',
		lastFetchedCount: 7
	},
	{
		id: 'hpas_004',
		market: 'aliexpress',
		apiName: 'AliExpress Super Deals',
		endpoint: 'https://api-sg.aliexpress.com/sync/affiliate/super_deals/query',
		description: 'AliExpress 슈퍼딜 상품 API',
		lastFetchedAt: '2026-03-28T05:30:00Z',
		lastFetchedCount: 3
	},
	{
		id: 'hpas_005',
		market: 'amazon',
		apiName: 'Amazon PA-API Best Sellers',
		endpoint: 'https://webservices.amazon.com/paapi5/getbrowsenodes',
		description: 'Amazon 베스트셀러 상품 조회',
		lastFetchedAt: '2026-03-27T18:00:00Z',
		lastFetchedCount: 6
	},
	{
		id: 'hpas_006',
		market: 'amazon',
		apiName: 'Amazon PA-API Deals',
		endpoint: 'https://webservices.amazon.com/paapi5/searchitems',
		description: 'Amazon 오늘의 딜 상품 조회',
		lastFetchedAt: '2026-03-27T18:00:00Z',
		lastFetchedCount: 4
	}
];

// ─── Crawl Runner ───────────────────────────────────────────

export async function getCrawlRunnerState(): Promise<CrawlRunnerState> {
	// TODO: GET /v1/admin/crawl-runner/state
	return MOCK_CRAWL_RUNNER_STATE;
}

export async function getCrawlTargetItems(market?: Market | 'all'): Promise<CrawlTargetItem[]> {
	// TODO: GET /v1/admin/crawl/user-items?market=
	if (market && market !== 'all') {
		return MOCK_CRAWL_TARGET_ITEMS.filter((i) => i.market === market);
	}
	return MOCK_CRAWL_TARGET_ITEMS;
}

export async function getHotProductsApiSources(market?: Market | 'all'): Promise<HotProductsApiSource[]> {
	// TODO: GET /v1/admin/crawl/hot-products-fetch/sources?market=
	if (market && market !== 'all') {
		return MOCK_HOT_PRODUCTS_API_SOURCES.filter((s) => s.market === market);
	}
	return MOCK_HOT_PRODUCTS_API_SOURCES;
}

export async function updateCrawlSchedule(
	type: CrawlJobType,
	schedule: Partial<CrawlSchedule>
): Promise<{ success: boolean }> {
	// TODO: PATCH /v1/admin/crawl-runner/schedule  body: { type, ...schedule }
	return { success: true };
}
