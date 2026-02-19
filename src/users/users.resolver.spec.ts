import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput, PaginationInput } from './dto';
import { PaginatedUsersResponse } from './dto/paginated-users.response';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: UsersService;

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

  const mockPaginatedResponse: PaginatedUsersResponse = {
    items: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserInput: CreateUserInput = {
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'password123',
    };

    it('should create a user', async () => {
      const result = await resolver.createUser(createUserInput);

      expect(usersService.create).toHaveBeenCalledWith(createUserInput);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    const paginationInput: PaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return paginated users', async () => {
      const result = await resolver.findAll(paginationInput);

      expect(usersService.findAll).toHaveBeenCalledWith(paginationInput);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await resolver.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('me', () => {
    it('should return the current user', async () => {
      const result = await resolver.me(mockUser);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    const updateUserInput: UpdateUserInput = {
      firstName: 'Updated',
    };

    it('should update a user', async () => {
      const result = await resolver.updateUser('1', updateUserInput, mockUser);

      expect(usersService.update).toHaveBeenCalledWith('1', updateUserInput, mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('removeUser', () => {
    it('should remove a user', async () => {
      const result = await resolver.removeUser('1', mockUser);

      expect(usersService.remove).toHaveBeenCalledWith('1', mockUser);
      expect(result).toBe(true);
    });
  });
});
