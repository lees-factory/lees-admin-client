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
export type BatchJobType = 'SKU_SNAPSHOT_UPDATE';
export type BatchJobStatusEnum = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type TriggerType = 'MANUAL' | 'SCHEDULED';
export type TokenStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_FOUND';
export type UserPlan = 'FREE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type Currency = 'KRW' | 'USD';
export type TargetGroup = 'ALL' | 'HOT_PRODUCTS' | 'TRACKED';
export type SessionStatusReason = 'ACTIVE' | 'REVOKED' | 'ROTATED' | 'REUSED' | 'EXPIRED';

// ─── Admin Auth ─────────────────────────────────────────

export interface AdminLoginRequest {
	id: string;
	password: string;
}

export interface AdminLoginData {
	admin_id: string;
	login_id: string;
	access_token: string;
	token_type: 'Bearer';
	expires_at: string;
}

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
	currencies?: Currency[];
	target_group?: TargetGroup;
	collected_before?: string;
	force?: boolean;
	requested_by?: string;
}

export interface PriceUpdateFilter {
	collection_source?: string;
	market?: MarketType;
	product_ids?: string[];
	currencies?: Currency[];
	target_group?: TargetGroup;
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
	app_type?: AppType;
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

export interface AdminUserLoginSession {
	id: string;
	user_id: string;
	status: UserStatus;
	status_reason: SessionStatusReason;
	refresh_token_hash: string;
	token_family_id: string;
	parent_session_id?: string | null;
	user_agent: string;
	client_ip: string;
	device_name: string;
	expires_at: string;
	last_seen_at: string;
	rotated_at?: string | null;
	revoked_at?: string | null;
	reuse_detected_at?: string | null;
	created_at: string;
}

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
	sessions: AdminUserLoginSession[];
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

export interface UserSessionListParams {
	status?: UserStatus;
	revoked?: boolean;
	reuse_detected?: boolean;
}

export interface UserSessionListData {
	user_id: string;
	count: number;
	items: AdminUserLoginSession[];
}

export interface UserSessionRevokeData {
	user_id?: string;
	session_id?: string;
	token_family_id?: string;
	revoked?: boolean;
	revoked_count?: number;
	operation_type?: string;
}

// ─── Products ───────────────────────────────────────────

export type ProductLanguage = 'KO' | 'EN';

export interface ProductListItem {
	id: string;
	market: MarketType;
	external_product_id: string;
	original_url: string;
	title: string;
	main_image_url: string;
	product_url: string;
	collection_source: string;
	language: ProductLanguage;
}

export interface ProductListData {
	language: ProductLanguage;
	items: ProductListItem[];
}

export interface ProductListParams {
	language?: ProductLanguage;
	collection_source?: string;
}

// ─── Health ─────────────────────────────────────────────

export interface HealthResponse {
	status: string;
}
