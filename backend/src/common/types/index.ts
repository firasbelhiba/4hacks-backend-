import { UserRole } from 'generated/prisma';

export type JwtPayload = {
  sub: string;
  username?: string;
  email: string;
  role: string;
  createdAt: string;
  iat?: number;
  exp?: number;
};

export type UserFromJWT = {
  id: string;
  username?: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type UserMin = {
  id: string;
  username?: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
};
