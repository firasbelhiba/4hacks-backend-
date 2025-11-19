export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
};

export const refreshTokenConstants = {
  expirationSeconds: Number(process.env.REFRESH_TOKEN_EXPIRATION) || 604800, // 7 days
};

export const authCookiesNames = {
  refreshToken: 'refreshToken',
};

export const API_PREFIX = process.env.API_PREFIX || 'api';
export const AUTH_REFRESH_API_PREFIX = `${API_PREFIX}/auth`;

export const verifyEmailRedisTTL = 5 * 60; // 5 minutes in seconds
export const verifyEmailRedisPrefix = 'verif_em_';
