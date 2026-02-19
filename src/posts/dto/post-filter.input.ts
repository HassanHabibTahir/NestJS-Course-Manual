import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

@InputType()
export class PostFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorId?: string;
}
