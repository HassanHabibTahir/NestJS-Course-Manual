import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
export class PaginatedPostsResponse {
  @Field(() => [Post])
  items: Post[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}
