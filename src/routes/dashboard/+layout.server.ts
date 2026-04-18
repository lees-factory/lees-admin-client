import type { LayoutServerLoad } from './$types';

// hooks.server.ts에서 주입한 세션 정보(loginId/adminId)를 대시보드 트리 전체에서
// page data로 사용할 수 있게 내려준다. 인증 자체는 hooks에서 이미 보호.
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		admin: {
			login_id: locals.loginId ?? null,
			admin_id: locals.adminId ?? null
		}
	};
};
