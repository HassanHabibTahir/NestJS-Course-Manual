import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostInput, UpdatePostInput, PostPaginationInput, PostFilterInput } from './dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<Post>;

  const mockAuthor: User = {
    id: '1',
    email: 'author@example.com',
    firstName: 'Author',
    lastName: 'User',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [],
  };

  const mockAdminUser: User = {
    ...mockAuthor,
    id: '2',
    role: UserRole.ADMIN,
  };

  const mockPost: Post = {
    id: '1',
    title: 'Test Post',
    content: 'Test Content',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockAuthor,
    authorId: mockAuthor.id,
  };

  const mockPostRepository = {
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
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPostInput: CreatePostInput = {
      title: 'New Post',
      content: 'New Content',
      published: false,
    };

    it('should successfully create a post', async () => {
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostInput, mockAuthor);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const paginationInput: PostPaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return paginated posts', async () => {
      mockPostRepository.findAndCount.mockResolvedValue([[mockPost], 1]);

      const result = await service.findAll(paginationInput);

      expect(result.items).toEqual([mockPost]);
      expect(result.total).toBe(1);
    });

    it('should apply filters when provided', async () => {
      const filterInput: PostFilterInput = {
        published: true,
        searchTerm: 'Test',
      };
      mockPostRepository.findAndCount.mockResolvedValue([[mockPost], 1]);

      const result = await service.findAll(paginationInput, filterInput);

      expect(result.items).toEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should return a post if found', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    const paginationInput: PostPaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return posts by user', async () => {
      mockPostRepository.findAndCount.mockResolvedValue([[mockPost], 1]);

      const result = await service.findByUser('1', paginationInput);

      expect(result.items).toEqual([mockPost]);
    });
  });

  describe('update', () => {
    const updatePostInput: UpdatePostInput = {
      title: 'Updated Title',
    };

    it('should successfully update post when author updates own post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        ...updatePostInput,
      });

      const result = await service.update('1', updatePostInput, mockAuthor);

      expect(result.title).toBe('Updated Title');
    });

    it('should successfully update post when admin updates', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        ...updatePostInput,
      });

      const result = await service.update('1', updatePostInput, mockAdminUser);

      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException when user tries to update another user post', async () => {
      const differentUser = { ...mockAuthor, id: '3' };
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      await expect(service.update('1', updatePostInput, differentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete post when author deletes', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(mockPost);

      const result = await service.remove('1', mockAuthor);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user tries to delete another user post', async () => {
      const differentUser = { ...mockAuthor, id: '3' };
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      await expect(service.remove('1', differentUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        published: true,
      });

      const result = await service.publishPost('1', mockAuthor);

      expect(result.published).toBe(true);
    });
  });

  describe('unpublishPost', () => {
    it('should unpublish a post', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        published: false,
      });

      const result = await service.unpublishPost('1', mockAuthor);

      expect(result.published).toBe(false);
    });
  });
});
