import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { LoginDto } from '../src/auth/dto/login.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate main.ts setup
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    // Assuming default prefix 'api' as per main.ts fallback
    app.setGlobalPrefix('api');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.users.delete({
      where: {
        email: 'test@example.com',
      },
    });
    await app.close();
  });

  it('/api/auth/register (POST)', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password@123',
      name: 'Test User',
      username: 'testuser',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto)
      .expect(201);

    const bodyResponse = response.body;

    expect(bodyResponse.data.email).toBe(registerDto.email);
    expect(bodyResponse.data.username).toBe(registerDto.username);
    expect(bodyResponse.data.name).toBe(registerDto.name);
  });

  // let accessToken: string;
  // let refreshTokenCookie: string;

  // it('/api/auth/login (POST)', async () => {
  //   const loginDto: LoginDto = {
  //     identifier: 'test@example.com',
  //     password: 'password123',
  //   };

  //   const response = await request(app.getHttpServer())
  //     .post('/api/auth/login')
  //     .send(loginDto)
  //     .expect(201);

  //   accessToken = response.body.token;

  //   const cookies = response.headers['set-cookie'];
  //   expect(cookies).toBeDefined();

  //   const refreshTokenCookieRaw = cookies.find((cookie: string) =>
  //     cookie.startsWith('refreshToken'),
  //   );
  //   expect(refreshTokenCookieRaw).toBeDefined();

  //   // We can use the raw cookie string for subsequent requests
  //   refreshTokenCookie = refreshTokenCookieRaw;

  //   expect(accessToken).toBeDefined();
  // });

  // it('/api/auth/me (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/api/auth/me')
  //     .set('Authorization', `Bearer ${accessToken}`)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.email).toEqual('test@example.com');
  //     });
  // });

  // it('/api/auth/refresh (POST)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .post('/api/auth/refresh')
  //     .set('Cookie', [refreshTokenCookie])
  //     .expect(201);

  //   expect(response.body.token).toBeDefined();
  //   accessToken = response.body.token; // Update access token

  //   // Refresh token might be rotated
  //   const cookies = response.headers['set-cookie'];
  //   if (cookies) {
  //     const newRefreshTokenCookie = cookies.find((cookie: string) =>
  //       cookie.startsWith('refreshToken'),
  //     );
  //     if (newRefreshTokenCookie) {
  //       refreshTokenCookie = newRefreshTokenCookie;
  //     }
  //   }
  // });

  // it('/api/auth/logout (POST)', () => {
  //   return request(app.getHttpServer())
  //     .post('/api/auth/logout')
  //     .set('Cookie', [refreshTokenCookie])
  //     .expect(201);
  // });
});
