import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
