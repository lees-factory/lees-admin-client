import { ADMIN_API_BASE_URL, ADMIN_API_KEY } from '$env/static/private';
import type { APIResponse } from '$lib/types/api';

// ─── PascalCase → snake_case 정규화 ─────────────────────
// Go 서버가 json tag 없이 PascalCase로 직렬화하는 문제를 보정.
// openapi.yml 스펙(snake_case)에 맞추기 위한 변환 레이어.
// Go 서버에 json tag가 추가되면 이 함수를 제거하면 됨.

function pascalToSnake(str: string): string {
	// ID → id, DisplayName → display_name, LastLoginAt → last_login_at
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.toLowerCase();
}

function normalizeKeys(obj: unknown): unknown {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) return obj.map(normalizeKeys);
	if (typeof obj === 'object') {
		const normalized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
			normalized[pascalToSnake(key)] = normalizeKeys(value);
		}
		return normalized;
	}
	return obj;
}

// ─── API Client ─────────────────────────────────────────

class ApiError extends Error {
	status: number;
	code: string;

	constructor(status: number, code: string, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

function buildUrl(path: string, params?: Record<string, string>): string {
	const url = new URL(path, ADMIN_API_BASE_URL);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '') {
				url.searchParams.set(key, value);
			}
		}
	}
	return url.toString();
}

function headers(): HeadersInit {
	return {
		'Content-Type': 'application/json',
		'X-Admin-API-Key': ADMIN_API_KEY
	};
}

async function handleResponse<T>(res: Response): Promise<APIResponse<T>> {
	const raw = await res.json();
	const body = normalizeKeys(raw) as APIResponse<T>;

	if (!res.ok && body.error) {
		throw new ApiError(res.status, body.error.code, body.error.message);
	}

	return body;
}

export async function apiGet<T>(
	path: string,
	params?: Record<string, string>
): Promise<APIResponse<T>> {
	const res = await fetch(buildUrl(path, params), {
		method: 'GET',
		headers: headers()
	});
	return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<APIResponse<T>> {
	const res = await fetch(buildUrl(path), {
		method: 'POST',
		headers: headers(),
		body: body !== undefined ? JSON.stringify(body) : undefined
	});
	return handleResponse<T>(res);
}

export { ApiError };
