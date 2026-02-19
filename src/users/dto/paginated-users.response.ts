import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class PaginatedUsersResponse {
  @Field(() => [User])
  items: User[];

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
