import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput, PaginationInput } from './dto';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

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

  const mockAdminUser: User = {
    ...mockUser,
    id: '2',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserInput: CreateUserInput = {
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'password123',
    };

    it('should successfully create a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserInput);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const paginationInput: PaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return paginated users', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll(paginationInput);

      expect(result.items).toEqual([mockUser]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserInput: UpdateUserInput = {
      firstName: 'Updated',
    };

    it('should successfully update user when user updates own profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserInput,
      });

      const result = await service.update('1', updateUserInput, mockUser);

      expect(result.firstName).toBe('Updated');
    });

    it('should successfully update user when admin updates any profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserInput,
      });

      const result = await service.update('1', updateUserInput, mockAdminUser);

      expect(result.firstName).toBe('Updated');
    });

    it('should throw ForbiddenException when user tries to update another user profile', async () => {
      const differentUser = { ...mockUser, id: '3' };
      mockUserRepository.findOne.mockResolvedValue(differentUser);

      await expect(service.update('3', updateUserInput, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete user when admin deletes', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      const result = await service.remove('1', mockAdminUser);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user tries to delete another user', async () => {
      const differentUser = { ...mockUser, id: '3' };
      mockUserRepository.findOne.mockResolvedValue(differentUser);

      await expect(service.remove('3', mockUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
