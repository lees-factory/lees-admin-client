import { ADMIN_API_BASE_URL, ADMIN_API_KEY } from '$env/static/private';
import { redirect, type RequestEvent } from '@sveltejs/kit';
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

export interface RequestOptions {
	/**
	 * SvelteKit RequestEvent. 전달되면 locals.bearerToken을 자동 주입하고,
	 * 401 응답 시 세션 쿠키를 정리 후 /login으로 redirect를 throw한다.
	 */
	event?: Pick<RequestEvent, 'locals' | 'cookies'>;
	/** event.locals.bearerToken을 사용하지 않고 명시적으로 토큰을 지정할 때 */
	bearerToken?: string;
	/** admin login처럼 인증이 필요 없는 엔드포인트 호출 시 true */
	skipApiKey?: boolean;
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

function headers(opts?: RequestOptions): HeadersInit {
	const h: Record<string, string> = {
		'Content-Type': 'application/json'
	};
	if (!opts?.skipApiKey) {
		h['X-Admin-API-Key'] = ADMIN_API_KEY;
	}
	const bearer = opts?.bearerToken ?? opts?.event?.locals.bearerToken;
	if (bearer) {
		h['Authorization'] = `Bearer ${bearer}`;
	}
	return h;
}

async function handleResponse<T>(res: Response, opts?: RequestOptions): Promise<APIResponse<T>> {
	// 백엔드가 세션 토큰을 거부(만료/revoke)했을 때: 쿠키 정리 후 강제 로그아웃.
	// event가 있고 요청이 Bearer 기반일 때만 자동 리다이렉트(login 호출 등은 제외).
	if (res.status === 401 && opts?.event && !opts.skipApiKey) {
		opts.event.cookies.delete('session', { path: '/' });
		throw redirect(303, '/login?reason=expired');
	}

	const raw = await res.json().catch(() => ({}));
	const body = normalizeKeys(raw) as APIResponse<T>;

	if (!res.ok) {
		const err = body?.error;
		throw new ApiError(
			res.status,
			err?.code ?? `HTTP_${res.status}`,
			err?.message ?? `Request failed with status ${res.status}`
		);
	}

	return body;
}

export async function apiGet<T>(
	path: string,
	params?: Record<string, string>,
	opts?: RequestOptions
): Promise<APIResponse<T>> {
	const res = await fetch(buildUrl(path, params), {
		method: 'GET',
		headers: headers(opts)
	});
	return handleResponse<T>(res, opts);
}

export async function apiPost<T>(
	path: string,
	body?: unknown,
	opts?: RequestOptions
): Promise<APIResponse<T>> {
	const res = await fetch(buildUrl(path), {
		method: 'POST',
		headers: headers(opts),
		body: body !== undefined ? JSON.stringify(body) : undefined
	});
	return handleResponse<T>(res, opts);
}

export { ApiError };
