import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
