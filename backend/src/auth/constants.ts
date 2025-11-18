export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
};

export const refreshTokenConstants = {
  expirationSeconds: Number(process.env.REFRESH_TOKEN_EXPIRATION) || 604800, // 7 days
};
