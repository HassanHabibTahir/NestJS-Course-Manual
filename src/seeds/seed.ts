import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { seedUsers, seedPosts } from './seed-data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('🌱 Starting database seeding...\n');

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const postRepository = app.get<Repository<Post>>(getRepositoryToken(Post));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await postRepository.clear();
    await userRepository.clear();
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers: User[] = [];

    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = userRepository.create({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        role: userData.role as UserRole,
      });

      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`   ✅ Created user: ${savedUser.email} (${savedUser.role})`);
    }

    console.log(`\n✅ Created ${createdUsers.length} users\n`);

    // Create posts
    console.log('📝 Creating posts...');
    const createdPosts: Post[] = [];

    for (const postData of seedPosts) {
      const author = createdUsers.find((u) => u.email === postData.authorEmail);

      if (!author) {
        console.warn(`   ⚠️  Author not found for post: ${postData.title}`);
        continue;
      }

      const post = postRepository.create({
        title: postData.title,
        content: postData.content,
        published: postData.published,
        author,
        authorId: author.id,
      });

      const savedPost = await postRepository.save(post);
      createdPosts.push(savedPost);
      console.log(
        `   ✅ Created post: ${savedPost.title} by ${author.firstName} ${author.lastName}`,
      );
    }

    console.log(`\n✅ Created ${createdPosts.length} posts\n`);

    // Summary
    console.log('🎉 Seeding completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   📝 Posts: ${createdPosts.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  john@example.com / password123');
    console.log('   User:  jane@example.com / password123');
    console.log('   User:  bob@example.com / password123\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
