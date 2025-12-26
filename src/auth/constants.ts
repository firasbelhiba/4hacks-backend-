export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
};

export const refreshTokenConstants = {
  expirationSeconds: Number(process.env.REFRESH_TOKEN_EXPIRATION) || 604800, // 7 days
};

export const authCookiesNames = {
  refreshToken: 'refreshToken',
  accessToken: 'accessToken',
};

export const API_PREFIX = process.env.API_PREFIX || 'api';
export const AUTH_REFRESH_API_PREFIX = `${API_PREFIX}/auth`;

export const verifyEmailRedisTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
export const verifyEmailRedisPrefix = 'verif_em_';

export const passwordResetRedisTTL = 15 * 60 * 1000; // 15 minutes in milliseconds
export const passwordResetRedisPrefix = 'pwd_reset_';

export const twoFactorEnableRedisPrefix = '2fa_enable_';
export const twoFactorDisableRedisPrefix = '2fa_disable_';
export const twoFactorLoginRedisPrefix = '2fa_login_';
export const twoFactorEmailRedisTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
export const changeEmailRedisPrefix = 'change_email_';

export const googleOAuthConstants = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:8080/api/v1/auth/google/callback',
};

export const githubOAuthConstants = {
  clientID: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackURL:
    process.env.GITHUB_CALLBACK_URL ||
    'http://localhost:8080/api/v1/auth/github/callback',
};

export const linkedinOAuthConstants = {
  clientID: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  callbackURL:
    process.env.LINKEDIN_CALLBACK_URL ||
    'http://localhost:8080/api/v1/auth/linkedin/callback',
};

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
