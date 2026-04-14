import axios from "axios";

/**
 * =========================
 * TOKEN CACHE (MEMÓRIA VERCEL)
 * =========================
 */
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * REFRESH TOKEN
 */
async function refreshAccessToken() {
  const res = await axios.post("https://api.rd.services/auth/token", {
    refresh_token: process.env.RD_REFRESH_TOKEN,
    client_id: process.env.RD_CLIENT_ID,
    client_secret: process.env.RD_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const { access_token, expires_in } = res.data;

  cachedToken = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000 - 60000;

  return access_token;
}

/**
 * GET VALID TOKEN
 */
async function getAccessToken() {
  const valid = cachedToken && Date.now() < tokenExpiresAt;

  if (valid) return cachedToken;

  return await refreshAccessToken();
}

/**
 * SEND EVENT TO RD (WITH RETRY)
 */
export async function sendToRD(payload) {
  const token = await getAccessToken();

  try {
    return await axios.post(
      "https://api.rd.services/platform/events",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    const isInvalid = err.response?.data?.error?.error === "invalid_token";

    if (isInvalid) {
      await refreshAccessToken();

      const newToken = cachedToken;

      return await axios.post(
        "https://api.rd.services/platform/events",
        payload,
        {
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw err;
  }
}
