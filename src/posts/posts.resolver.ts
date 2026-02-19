import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostInput, UpdatePostInput, PostPaginationInput, PostFilterInput } from './dto';
import { PaginatedPostsResponse } from './dto/paginated-posts.response';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Resolver(() => Post)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Post)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: User,
  ): Promise<Post> {
    return this.postsService.create(createPostInput, user);
  }

  @Public()
  @Query(() => PaginatedPostsResponse, { name: 'posts' })
  async findAll(
    @Args('paginationInput', { nullable: true }) paginationInput?: PostPaginationInput,
    @Args('filterInput', { nullable: true }) filterInput?: PostFilterInput,
  ): Promise<PaginatedPostsResponse> {
    return this.postsService.findAll(paginationInput || { page: 1, limit: 10 }, filterInput);
  }

  @Public()
  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @Query(() => PaginatedPostsResponse, { name: 'myPosts' })
  async findMyPosts(
    @CurrentUser() user: User,
    @Args('paginationInput', { nullable: true }) paginationInput?: PostPaginationInput,
  ): Promise<PaginatedPostsResponse> {
    return this.postsService.findByUser(user.id, paginationInput || { page: 1, limit: 10 });
  }

  @Query(() => PaginatedPostsResponse, { name: 'postsByUser' })
  async findByUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('paginationInput', { nullable: true }) paginationInput?: PostPaginationInput,
  ): Promise<PaginatedPostsResponse> {
    return this.postsService.findByUser(userId, paginationInput || { page: 1, limit: 10 });
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @CurrentUser() user: User,
  ): Promise<Post> {
    return this.postsService.update(id, updatePostInput, user);
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.postsService.remove(id, user);
  }

  @Mutation(() => Post)
  async publishPost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Post> {
    return this.postsService.publishPost(id, user);
  }

  @Mutation(() => Post)
  async unpublishPost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Post> {
    return this.postsService.unpublishPost(id, user);
  }

  @ResolveField(() => User)
  async author(@Parent() post: Post): Promise<User> {
    return this.usersService.findOne(post.authorId);
  }
}
