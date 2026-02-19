import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput, PaginationInput } from './dto';
import { PaginatedUsersResponse } from './dto/paginated-users.response';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const { email, password } = createUserInput;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserInput,
      password: hashedPassword,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(paginationInput: PaginationInput): Promise<PaginatedUsersResponse> {
    const { page = 1, limit = 10 } = paginationInput;
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput, currentUser: User): Promise<User> {
    // Check if user exists
    const user = await this.findOne(id);

    // Check permissions - only admin or the user themselves can update
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // If email is being changed, check for duplicates
    if (updateUserInput.email && updateUserInput.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserInput.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    }

    // Only admin can change roles
    if (updateUserInput.role && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    // Hash password if provided
    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10);
    }

    // Update user
    Object.assign(user, updateUserInput);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string, currentUser: User): Promise<boolean> {
    // Check if user exists
    const user = await this.findOne(id);

    // Check permissions - only admin or the user themselves can delete
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    // Prevent users from deleting themselves unless they're admin
    if (currentUser.id === id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    try {
      await this.userRepository.remove(user);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
