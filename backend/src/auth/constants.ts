export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '7D',
};
