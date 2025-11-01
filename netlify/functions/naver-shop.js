// netlify/functions/naver-shop.js  (CommonJS)
const hasEnv = !!process.env.NAVER_CLIENT_ID && !!process.env.NAVER_CLIENT_SECRET;

exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const query = params.get("query") || "";
    const display = params.get("display") || "10";
    const start = params.get("start") || "1";
    const sort = params.get("sort") || "sim";

    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ message: "query is required" }) };
    }
    if (!hasEnv) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: true, message: "Missing NAVER_CLIENT_ID or NAVER_CLIENT_SECRET in env" }),
      };
    }
    // 진단 모드: /naver-shop?query=아이패드&diag=1 로 호출하면 env 상태만 확인
    const qs = new URLSearchParams(event.queryStringParameters || {});
    if (qs.get("diag") === "1") {
    return {
        statusCode: 200,
        body: JSON.stringify({
        envOk: !!process.env.NAVER_CLIENT_ID && !!process.env.NAVER_CLIENT_SECRET,
        idLen: (process.env.NAVER_CLIENT_ID || "").length,
        secretLen: (process.env.NAVER_CLIENT_SECRET || "").length
        }),
    };
    }


    const api =
      `https://openapi.naver.com/v1/search/shop.json?` +
      `query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`;

    const res = await fetch(api, {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
      },
    });

    const data = await res.json();

    // 에러 응답도 그대로 내려주어 디버깅 가능
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: true, message: String(e) }) };
  }
};
