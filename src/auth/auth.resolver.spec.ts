import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput, AuthResponse } from './dto';
import { User, UserRole } from '../users/entities/user.entity';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
    user: mockUser,
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockAuthResponse),
    login: jest.fn().mockResolvedValue(mockAuthResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerInput: RegisterInput = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should call authService.register with correct input', async () => {
      const result = await resolver.register(registerInput);

      expect(authService.register).toHaveBeenCalledWith(registerInput);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.login with correct input', async () => {
      const result = await resolver.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
