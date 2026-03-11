const COOKIE_NAME = "admin_session";

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || "shadow@gmail.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "Abhay@7832";

  const emailOk = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  const passOk = password === expectedPassword;

  return emailOk && passOk;
}

function getSessionSecret() {
  return process.env.ADMIN_AUTH_SECRET || "dev-admin-secret";
}

// For simplicity and Edge-compatibility, the session token is just the secret itself.
// It is stored in an httpOnly cookie, so it is not accessible from client-side JS.
export function createAdminSessionToken() {
  return getSessionSecret();
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false;
  return token === getSessionSecret();
}

