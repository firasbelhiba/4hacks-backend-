import { HackathonStatus, Provider, UserRole } from 'generated/prisma';

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
  providers: Provider[];
};

export type HackathonMin = {
  id: string;
  title: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  status: HackathonStatus;
  organizationId: string;
  registrationStart: Date;
  registrationEnd: Date;
  judgingStart?: Date;
  judgingEnd?: Date;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    ownerId: string;
  };
};
