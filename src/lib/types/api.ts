// openapi.yml 기반 API 타입 정의
// 서버/클라이언트 양쪽에서 import 가능

// ─── 공통 응답 ───────────────────────────────────────────

export interface ErrorPayload {
	code: string;
	message: string;
}

export interface APIResponse<T = unknown> {
	status: 'success' | 'error';
	data?: T;
	error?: ErrorPayload;
}

// ─── Enum / Literal 타입 ────────────────────────────────

export type AppType = 'AFFILIATE' | 'DROPSHIPPING';
export type MarketType = 'ALIEXPRESS' | 'COUPANG';
export type BatchJobType = 'PRICE_UPDATE';
export type BatchJobStatusEnum = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type TriggerType = 'MANUAL' | 'SCHEDULED';
export type TokenStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_FOUND';
export type UserPlan = 'FREE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// ─── Batch ──────────────────────────────────────────────

export interface HotProductLoadRequest {
	category_ids?: string[];
	keywords?: string;
	sort?: string;
	min_sale_price?: string;
	max_sale_price?: string;
}

export interface PriceUpdateRequest {
	collection_source?: string;
	market?: MarketType;
	product_ids?: string[];
	collected_before?: string;
	force?: boolean;
	requested_by?: string;
}

export interface PriceUpdateFilter {
	collection_source?: string;
	market?: MarketType;
	product_ids?: string[];
	collected_before?: string | null;
	force?: boolean;
}

export interface BatchJobStatus {
	job_type: BatchJobType;
	status: BatchJobStatusEnum;
	trigger_type: TriggerType;
	filter: PriceUpdateFilter;
	requested_at: string;
	started_at?: string | null;
	finished_at?: string | null;
	total_count: number;
	success_count: number;
	fail_count: number;
	skipped_count: number;
	last_error?: string;
}

export interface BatchStatusData {
	job_type: string;
	status: string | null;
}

// ─── Token ──────────────────────────────────────────────

export interface TokenGenerateRequest {
	code: string;
	app_type: AppType;
}

export interface TokenRefreshRequest {
	app_type: AppType;
}

export interface TokenResult {
	seller_id: string;
	app_type: AppType;
	access_token_expires_at: string;
	refresh_token_expires_at?: string | null;
}

export interface TokenStatusEntry {
	app_type: AppType;
	seller_id?: string;
	user_nick?: string;
	status: TokenStatus;
	access_token_expires_at?: string;
	refresh_token_expires_at?: string | null;
	last_refreshed_at?: string;
}

// ─── Users ──────────────────────────────────────────────

export interface AdminUser {
	id: string;
	email: string;
	display_name: string;
	plan: UserPlan;
	status: UserStatus;
	email_verified: boolean;
	tracked_item_count: number;
	created_at: string;
	last_login_at?: string | null;
}

export interface UserListParams {
	search?: string;
	plan?: UserPlan;
	status?: UserStatus;
	page?: number;
	page_size?: number;
}

export interface UserListData {
	total_count: number;
	page: number;
	page_size: number;
	items: AdminUser[];
}

// ─── Health ─────────────────────────────────────────────

export interface HealthResponse {
	status: string;
}
