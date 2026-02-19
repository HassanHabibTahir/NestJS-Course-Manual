import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Post } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostInput, UpdatePostInput, PostPaginationInput, PostFilterInput } from './dto';
import { PaginatedPostsResponse } from './dto/paginated-posts.response';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostInput: CreatePostInput, author: User): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostInput,
      author,
      authorId: author.id,
    });

    try {
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async findAll(
    paginationInput: PostPaginationInput,
    filterInput?: PostFilterInput,
  ): Promise<PaginatedPostsResponse> {
    const { page = 1, limit = 10 } = paginationInput;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Post> = {};

    // Apply filters
    if (filterInput) {
      if (filterInput.published !== undefined) {
        where.published = filterInput.published;
      }

      if (filterInput.authorId) {
        where.authorId = filterInput.authorId;
      }

      if (filterInput.searchTerm) {
        where.title = Like(`%${filterInput.searchTerm}%`);
      }
    }

    const [items, total] = await this.postRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
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

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return post;
  }

  async findByUser(
    userId: string,
    paginationInput: PostPaginationInput,
  ): Promise<PaginatedPostsResponse> {
    const { page = 1, limit = 10 } = paginationInput;
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { authorId: userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
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

  async update(id: string, updatePostInput: UpdatePostInput, currentUser: User): Promise<Post> {
    const post = await this.findOne(id);

    // Check permissions - only author or admin can update
    if (currentUser.role !== UserRole.ADMIN && post.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Update post
    Object.assign(post, updatePostInput);

    try {
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async remove(id: string, currentUser: User): Promise<boolean> {
    const post = await this.findOne(id);

    // Check permissions - only author or admin can delete
    if (currentUser.role !== UserRole.ADMIN && post.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    try {
      await this.postRepository.remove(post);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  async publishPost(id: string, currentUser: User): Promise<Post> {
    const post = await this.findOne(id);

    // Check permissions - only author or admin can publish
    if (currentUser.role !== UserRole.ADMIN && post.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    post.published = true;

    try {
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException('Failed to publish post');
    }
  }

  async unpublishPost(id: string, currentUser: User): Promise<Post> {
    const post = await this.findOne(id);

    // Check permissions - only author or admin can unpublish
    if (currentUser.role !== UserRole.ADMIN && post.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only unpublish your own posts');
    }

    post.published = false;

    try {
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException('Failed to unpublish post');
    }
  }
}
