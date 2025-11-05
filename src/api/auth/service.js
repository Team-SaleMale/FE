    // src/api/auth/service.js
    import endpoints from "../endpoints";
    import { get, post, patch, postNoAuth } from "../client";

    export const register = (payload) => postNoAuth(endpoints.AUTH.REGISTER, payload);
    export const login = (payload) => postNoAuth(endpoints.AUTH.LOGIN, payload);
    export const refresh = (payload = {}) => post(endpoints.AUTH.REFRESH, payload);
    export const logout = () => patch(endpoints.AUTH.LOGOUT, {});
    export const me = () => get(endpoints.AUTH.ME);

    export const checkNickname = (nickname) =>
    get(endpoints.AUTH.CHECK_NICK, { value: String(nickname || "").trim() })
        .then((res) => {
        const raw = res?.result?.exists;
        const exists = raw === true || raw === "true" || raw === 1 || raw === "1";
        return { available: !exists };
        });

    export const checkEmail = (email) =>
    get(endpoints.AUTH.CHECK_EMAIL, { value: email }).then((res) => {
        const r = res?.result || {};
        const isDuplicated =
        (typeof r.isDuplicated === "boolean" && r.isDuplicated) ||
        (typeof r.duplicated === "boolean" && r.duplicated) ||
        (typeof r.exists === "boolean" && r.exists) ||
        (typeof r.isExists === "boolean" && r.isExists);
        const available = !isDuplicated;
        if (!Object.keys(r).length && res?.message) {
        const msg = res.message.toLowerCase();
        if (msg.includes("중복") || msg.includes("이미")) return { available: false };
        if (msg.includes("가능")) return { available: true };
        }
        return { available };
    });

    // NOTE(ChatGPT): 인증 없이 본문(JSON)으로 이메일 전송하도록 고정
    export const requestEmailCode = (email) =>
    postNoAuth(endpoints.AUTH.EMAIL_VERIFY_REQUEST, { email });

    export const verifyEmailCode = async (email, code) => {
    const res = await postNoAuth("/auth/email/verify/confirm", { email, code });
    return {
        verified: !!(res?.isSuccess && res?.result?.sessionToken),
        sessionToken: res?.result?.sessionToken || null,
    };
    };

    export async function completeSocialSignup({ signupToken, nickname, regionId }) {
    const qs = new URLSearchParams({
        signupToken,
        nickname,
        regionId: String(regionId),
    }).toString();
    return post(`${endpoints.AUTH.SOCIAL_COMPLETE}?${qs}`);
    }
