import { Test, TestingModule } from '@nestjs/testing';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';
import { Post } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostInput, UpdatePostInput, PostPaginationInput, PostFilterInput } from './dto';
import { PaginatedPostsResponse } from './dto/paginated-posts.response';

describe('PostsResolver', () => {
  let resolver: PostsResolver;
  let postsService: PostsService;
  let usersService: UsersService;

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

  const mockPaginatedResponse: PaginatedPostsResponse = {
    items: [mockPost],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const mockPostsService = {
    create: jest.fn().mockResolvedValue(mockPost),
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findOne: jest.fn().mockResolvedValue(mockPost),
    findByUser: jest.fn().mockResolvedValue(mockPaginatedResponse),
    update: jest.fn().mockResolvedValue(mockPost),
    remove: jest.fn().mockResolvedValue(true),
    publishPost: jest.fn().mockResolvedValue(mockPost),
    unpublishPost: jest.fn().mockResolvedValue(mockPost),
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue(mockAuthor),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
    postsService = module.get<PostsService>(PostsService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('createPost', () => {
    const createPostInput: CreatePostInput = {
      title: 'New Post',
      content: 'New Content',
    };

    it('should create a post', async () => {
      const result = await resolver.createPost(createPostInput, mockAuthor);

      expect(postsService.create).toHaveBeenCalledWith(createPostInput, mockAuthor);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    const paginationInput: PostPaginationInput = {
      page: 1,
      limit: 10,
    };

    const filterInput: PostFilterInput = {
      published: true,
    };

    it('should return all posts with filters', async () => {
      const result = await resolver.findAll(paginationInput, filterInput);

      expect(postsService.findAll).toHaveBeenCalledWith(paginationInput, filterInput);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const result = await resolver.findOne('1');

      expect(postsService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('findMyPosts', () => {
    const paginationInput: PostPaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return current user posts', async () => {
      const result = await resolver.findMyPosts(mockAuthor, paginationInput);

      expect(postsService.findByUser).toHaveBeenCalledWith(mockAuthor.id, paginationInput);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findByUser', () => {
    const paginationInput: PostPaginationInput = {
      page: 1,
      limit: 10,
    };

    it('should return posts by user id', async () => {
      const result = await resolver.findByUser('1', paginationInput);

      expect(postsService.findByUser).toHaveBeenCalledWith('1', paginationInput);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('updatePost', () => {
    const updatePostInput: UpdatePostInput = {
      title: 'Updated Title',
    };

    it('should update a post', async () => {
      const result = await resolver.updatePost('1', updatePostInput, mockAuthor);

      expect(postsService.update).toHaveBeenCalledWith('1', updatePostInput, mockAuthor);
      expect(result).toEqual(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const result = await resolver.deletePost('1', mockAuthor);

      expect(postsService.remove).toHaveBeenCalledWith('1', mockAuthor);
      expect(result).toBe(true);
    });
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      const result = await resolver.publishPost('1', mockAuthor);

      expect(postsService.publishPost).toHaveBeenCalledWith('1', mockAuthor);
      expect(result).toEqual(mockPost);
    });
  });

  describe('unpublishPost', () => {
    it('should unpublish a post', async () => {
      const result = await resolver.unpublishPost('1', mockAuthor);

      expect(postsService.unpublishPost).toHaveBeenCalledWith('1', mockAuthor);
      expect(result).toEqual(mockPost);
    });
  });

  describe('author', () => {
    it('should return the author of a post', async () => {
      const result = await resolver.author(mockPost);

      expect(usersService.findOne).toHaveBeenCalledWith(mockPost.authorId);
      expect(result).toEqual(mockAuthor);
    });
  });
});
