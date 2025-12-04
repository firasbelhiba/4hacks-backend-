import { UserRole } from '@prisma/client';

export type Profile = {
  id: string;
  name?: string;
  username: string;
  email: string;
  role: UserRole;
  bio?: string;
  image?: string;
  profession?: string;
  location?: string;
  skills: string[];
  website?: string;
  github?: string;
  linkedin?: string;
  otherSocials: string[];
};
