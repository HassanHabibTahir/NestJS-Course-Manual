# NestJS GraphQL Authentication API

A complete, production-ready NestJS application with GraphQL, TypeORM, PostgreSQL, JWT authentication, and role-based access control.

## ✨ Features

- **🔐 Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (Admin/User)
  - Protected routes with Guards

- **📊 GraphQL API**
  - Code-first approach
  - Auto-generated GraphQL schema
  - GraphQL Playground for testing
  - Proper error handling

- **💾 Database**
  - PostgreSQL with TypeORM
  - Entity relationships
  - Database migrations support
  - Seed data for development

- **📦 Posts Management (CRUD)**
  - Create, Read, Update, Delete operations
  - Pagination support
  - Filtering and search
  - Authorization for modifications

- **🧪 Testing**
  - Unit tests for services and resolvers
  - Jest testing framework
  - High test coverage

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-graphql-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE nestjs_graphql_auth;
   ```

5. **Run database seeds (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

7. **Access the application**
   - API: http://localhost:3000
   - GraphQL Playground: http://localhost:3000/graphql

## 📁 Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data Transfer Objects
│   ├── strategies/        # Passport JWT strategy
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── users/                 # Users module
│   ├── dto/
│   ├── entities/
│   ├── users.module.ts
│   ├── users.resolver.ts
│   └── users.service.ts
├── posts/                 # Posts module
│   ├── dto/
│   ├── entities/
│   ├── posts.module.ts
│   ├── posts.resolver.ts
│   └── posts.service.ts
├── common/                # Shared resources
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Auth & Role guards
│   ├── filters/           # Exception filters
│   └── interceptors/      # Logging interceptor
├── config/                # Configuration files
├── database/              # Database configuration
├── seeds/                 # Seed data
├── app.module.ts          # Root module
└── main.ts               # Application entry point
```

## 🔑 Authentication

### Register
```graphql
mutation {
  register(registerInput: {
    email: "user@example.com"
    firstName: "John"
    lastName: "Doe"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

### Login
```graphql
mutation {
  login(loginInput: {
    email: "user@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

> 🔑 **Next:** Copy the `accessToken` from the response and [add it to HTTP Headers](#-how-to-use-jwt-token-in-graphql-playground) to make authenticated requests.

---

## 🔑 How to Use JWT Token in GraphQL Playground

After logging in or registering, you'll receive an `accessToken`. To make authenticated requests, you need to add this token to the **HTTP Headers** in GraphQL Playground.

### Step 1: Login to Get Token
```graphql
mutation {
  login(loginInput: {
    email: "admin@example.com"
    password: "admin123"
  }) {
    accessToken
    user {
      id
      email
      role
    }
  }
}
```

### Step 2: Add Token to HTTP Headers

Click on **"HTTP HEADERS"** tab at the bottom of GraphQL Playground and add:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

**Example:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 💡 **Tip:** The token is automatically decoded by the server to identify the current user.

### Step 3: Make Authenticated Queries

Now you can call protected queries and mutations:

```graphql
# Get current logged-in user info
query {
  me {
    id
    email
    firstName
    lastName
    role
  }
}

# Create a new post (requires authentication)
mutation {
  createPost(createPostInput: {
    title: "My First Post"
    content: "This is my post content"
    published: true
  }) {
    id
    title
    content
    createdAt
  }
}

# Get my posts
query {
  myPosts(paginationInput: { page: 1, limit: 10 }) {
    items {
      id
      title
      published
    }
  }
}
```

---

## 📊 GraphQL Queries & Mutations

### Users

#### Get All Users (Paginated)
```graphql
query {
  users(paginationInput: { page: 1, limit: 10 }) {
    items {
      id
      email
      firstName
      lastName
      role
      createdAt
    }
    total
    page
    limit
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
```

#### Get User by ID
```graphql
query {
  user(id: "user-id") {
    id
    email
    firstName
    lastName
    role
    posts {
      id
      title
      published
    }
  }
}
```

#### Get Current User
```graphql
query {
  me {
    id
    email
    firstName
    lastName
    role
  }
}
```

#### Create User (Admin only)
```graphql
mutation {
  createUser(createUserInput: {
    email: "newuser@example.com"
    firstName: "New"
    lastName: "User"
    password: "password123"
    role: USER
  }) {
    id
    email
    firstName
    lastName
    role
  }
}
```

#### Update User
```graphql
mutation {
  updateUser(
    id: "user-id"
    updateUserInput: {
      firstName: "Updated"
      lastName: "Name"
    }
  ) {
    id
    email
    firstName
    lastName
  }
}
```

#### Delete User (Admin only)
```graphql
mutation {
  removeUser(id: "user-id")
}
```

### Posts

#### Get All Posts (Paginated & Filtered)
```graphql
query {
  posts(
    paginationInput: { page: 1, limit: 10 }
    filterInput: { published: true, searchTerm: "GraphQL" }
  ) {
    items {
      id
      title
      content
      published
      createdAt
      author {
        id
        firstName
        lastName
      }
    }
    total
    page
    limit
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
```

#### Get Post by ID
```graphql
query {
  post(id: "post-id") {
    id
    title
    content
    published
    createdAt
    updatedAt
    author {
      id
      firstName
      lastName
    }
  }
}
```

#### Get My Posts
```graphql
query {
  myPosts(paginationInput: { page: 1, limit: 10 }) {
    items {
      id
      title
      content
      published
      createdAt
    }
    total
    page
    limit
  }
}
```

#### Get Posts by User
```graphql
query {
  postsByUser(
    userId: "user-id"
    paginationInput: { page: 1, limit: 10 }
  ) {
    items {
      id
      title
      content
      published
      author {
        firstName
        lastName
      }
    }
    total
  }
}
```

#### Create Post (Authenticated)
```graphql
mutation {
  createPost(createPostInput: {
    title: "My New Post"
    content: "This is the content of my post."
    published: true
  }) {
    id
    title
    content
    published
    createdAt
    author {
      id
      firstName
      lastName
    }
  }
}
```

#### Update Post (Author or Admin)
```graphql
mutation {
  updatePost(
    id: "post-id"
    updatePostInput: {
      title: "Updated Title"
      content: "Updated content"
    }
  ) {
    id
    title
    content
    updatedAt
  }
}
```

#### Delete Post (Author or Admin)
```graphql
mutation {
  deletePost(id: "post-id")
}
```

#### Publish/Unpublish Post
```graphql
mutation {
  publishPost(id: "post-id") {
    id
    title
    published
  }
}

mutation {
  unpublishPost(id: "post-id") {
    id
    title
    published
  }
}
```

## 🛡️ Role-Based Access Control

### Roles
- `ADMIN`: Full access to all resources
- `USER`: Limited access, can only manage own resources

### Permissions Matrix

| Operation | Admin | User |
|-----------|-------|------|
| Create Post | ✅ | ✅ |
| Read All Posts | ✅ | ✅ |
| Read Own Posts | ✅ | ✅ |
| Update Any Post | ✅ | ❌ |
| Update Own Post | ✅ | ✅ |
| Delete Any Post | ✅ | ❌ |
| Delete Own Post | ✅ | ✅ |
| Create User | ✅ | ❌ |
| Read All Users | ✅ | ✅ |
| Update Any User | ✅ | ❌ |
| Update Own Profile | ✅ | ✅ |
| Delete Any User | ✅ | ❌ |
| Delete Own Account | ❌ | ❌ |

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Coverage
- Auth Service
- Auth Resolver
- Users Service
- Users Resolver
- Posts Service
- Posts Resolver

## 🌱 Seed Data

Default users created by seed script:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| john@example.com | password123 | USER |
| jane@example.com | password123 | USER |
| bob@example.com | password123 | USER |

Run seeds:
```bash
npm run seed
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | password |
| `DB_DATABASE` | Database name | nestjs_graphql_auth |
| `PORT` | Application port | 3000 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRATION` | JWT expiration time | 1d |
| `GRAPHQL_PLAYGROUND` | Enable GraphQL Playground | true |
| `GRAPHQL_DEBUG` | Enable GraphQL debug mode | true |
| `GRAPHQL_INTROSPECTION` | Enable schema introspection | true |

## 📜 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Build application
npm run start:prod         # Start production build

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run E2E tests

# Database
npm run seed               # Run database seeds
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration

# Linting & Formatting
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Input validation with class-validator
- ✅ SQL injection protection via TypeORM
- ✅ Role-based access control
- ✅ Environment variable configuration
- ✅ CORS enabled

## 📖 Complete NestJS Concepts Guide

This section provides a comprehensive guide to NestJS concepts used in this project, from fundamentals to advanced topics.

---

### 📚 Table of Contents

1. [NestJS Architecture Overview](#1-nestjs-architecture-overview)
2. [Modules](#2-modules)
3. [Controllers vs Resolvers](#4-controllers-vs-resolvers)
4. [Services & Providers](#3-services--providers)
5. [Dependency Injection](#5-dependency-injection)
6. [Middleware](#6-middleware)
7. [Guards](#7-guards)
8. [Interceptors](#8-interceptors)
9. [Exception Filters](#9-exception-filters)
10. [Pipes](#10-pipes)
11. [Custom Decorators](#11-custom-decorators)
12. [Configuration Management](#12-configuration-management)
13. [Production Best Practices](#13-production-best-practices)

---

### 1. NestJS Architecture Overview

NestJS is a progressive Node.js framework built with TypeScript that uses modern JavaScript and implements design patterns like **Dependency Injection**, **SOLID principles**, and **Object-Oriented Programming**.

#### Core Architecture Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Middleware → Guards → Interceptors → Pipes → Handler   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Controller/Resolver                    │
│                   (Request Handler)                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Service/Provider                      │
│                  (Business Logic)                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository/Database                    │
└─────────────────────────────────────────────────────────┘
```

**Key Concepts:**
- **Modular Design**: Application is divided into modules
- **Providers**: Injectable classes (services, repositories)
- **Controllers/Resolvers**: Handle incoming requests
- **Middleware**: Process requests before they reach handlers
- **Guards**: Control access to routes
- **Interceptors**: Transform request/response flow
- **Pipes**: Validate and transform data

---

### 2. Modules

Modules are the **fundamental building blocks** of a NestJS application. They organize related components (controllers, services, etc.) together.

#### Module Structure

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule],     // Other modules to import
  controllers: [AppController],            // Controllers (REST)
  providers: [AppService],                 // Services, Repositories
  exports: [AppService],                   // Providers to export
})
export class AppModule {}
```

#### Module Types

| Type | Description | Example |
|------|-------------|---------|
| **Feature Module** | Encapsulates specific feature | `AuthModule`, `UsersModule` |
| **Shared Module** | Reusable across modules | `CommonModule` |
| **Global Module** | Available everywhere | `@Global()` decorator |
| **Dynamic Module** | Configured at runtime | `ConfigModule.forRoot()` |

#### Our Project's Module Hierarchy

```
AppModule (Root)
├── ConfigModule (Global - env variables)
├── TypeOrmModule (Database connection)
├── GraphQLModule (GraphQL configuration)
├── AuthModule
│   ├── JwtModule
│   ├── PassportModule
│   └── User entity repository
├── UsersModule
│   └── User entity repository
└── PostsModule
    └── Post entity repository
```

**Example - Feature Module:**
```typescript
// auth/auth.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Register User entity
    PassportModule,
    JwtModule.registerAsync({...}),    // Async configuration
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService],              // Make available to other modules
})
export class AuthModule {}
```

---

### 3. Services & Providers

**Providers** are the core of NestJS. They can be injected as dependencies. The most common type is a **Service**.

#### What is a Provider?

A provider is any class annotated with `@Injectable()` that can be injected into other classes.

```typescript
@Injectable()
export class AuthService {
  // Business logic here
}
```

#### Service Pattern

Services contain **business logic** and are separated from controllers/resolvers:

```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    // 1. Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerInput.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(registerInput.password, 10);

    // 3. Create and save user
    const user = this.userRepository.create({
      ...registerInput,
      password: hashedPassword,
    });
    
    return this.userRepository.save(user);
  }
}
```

#### Provider Registration

```typescript
// Option 1: Short form
@Module({
  providers: [AuthService],
})

// Option 2: With custom token
@Module({
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
})

// Option 3: Factory provider
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (config: ConfigService) => {
        return createConnection(config.get('database'));
      },
      inject: [ConfigService],
    },
  ],
})
```

---

### 4. Controllers vs Resolvers

#### REST Controllers (Traditional)

Controllers handle **HTTP requests** and return HTTP responses:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

#### GraphQL Resolvers (This Project)

Resolvers handle **GraphQL operations** (queries, mutations, subscriptions):

```typescript
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Query - fetching data
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  // Query with parameters
  @Query(() => User, { name: 'user' })
  findOne(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Mutation - modifying data
  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }
}
```

#### Comparison

| Aspect | REST Controllers | GraphQL Resolvers |
|--------|-----------------|-------------------|
| Protocol | HTTP | GraphQL over HTTP |
| Operations | GET, POST, PUT, DELETE | Query, Mutation, Subscription |
| Data Shape | Fixed response structure | Client specifies exact fields |
| Endpoints | Multiple URLs | Single endpoint (`/graphql`) |
| Decorators | `@Get()`, `@Post()` | `@Query()`, `@Mutation()` |

---

### 5. Dependency Injection

**Dependency Injection (DI)** is a design pattern where classes receive their dependencies from external sources rather than creating them internally.

#### Why Use DI?

1. **Loose Coupling**: Classes don't depend on concrete implementations
2. **Testability**: Easy to mock dependencies in tests
3. **Reusability**: Same service can be used in multiple places
4. **Maintainability**: Changes in one place don't break others

#### How DI Works in NestJS

```typescript
@Injectable()
export class AuthService {
  // Dependencies are injected automatically
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
}
```

NestJS handles the instantiation:
```
1. Creates UserRepository instance
2. Creates JwtService instance  
3. Creates AuthService instance with above dependencies
```

#### Injection Patterns

**Constructor Injection (Recommended):**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
}
```

**Property Injection:**
```typescript
@Injectable()
export class UsersService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
}
```

**Custom Provider Injection:**
```typescript
@Injectable()
export class MyService {
  constructor(
    @Inject('CUSTOM_TOKEN')
    private customService: CustomService,
  ) {}
}
```

#### DI Container Flow

```
┌──────────────────────────────────────────┐
│         Application Bootstrap             │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│      Parse Module Dependencies            │
│  (Build dependency graph)                 │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│      Resolve Dependencies                 │
│  (Create instances in order)              │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│      Inject into Constructors             │
│  (Pass instances to classes)              │
└──────────────────────────────────────────┘
```

---

### 6. Middleware

**Middleware** is a function that executes **before** the route handler. It has access to the request and response objects.

#### When to Use Middleware

- Logging/Analytics
- Authentication check
- CORS handling
- Request parsing
- Rate limiting

#### Creating Middleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`${method} ${originalUrl} - ${res.statusCode} - ${duration}ms`);
    });

    next(); // Pass control to next middleware/handler
  }
}
```

#### Applying Middleware

```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Apply to all routes
      // .forRoutes(UsersController); // Apply to specific controller
      // .exclude({ path: 'auth/login', method: RequestMethod.POST }) // Exclude paths
  }
}
```

#### Functional Middleware

For simple cases, use functions:

```typescript
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}

// Apply
consumer.apply(logger).forRoutes('*');
```

---

### 7. Guards

**Guards** determine whether a request should be handled by the route handler. They implement **authorization** logic.

#### Guard Execution Flow

```
Request → Middleware → Guards → Interceptors → Pipes → Handler
              │
              ▼
        ┌─────────────┐
        │   Guard     │ ──No──→ Throw Exception (401/403)
        │ (canActivate)│
        └─────────────┘
              │Yes
              ▼
        Continue to Handler
```

#### Creating a Guard

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    // Get user from request
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

#### Using Guards

**Method-level:**
```typescript
@Resolver(() => Post)
export class PostsResolver {
  
  @Mutation(() => Post)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)  // Custom decorator
  deletePost(@Args('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

**Controller/Resolver-level:**
```typescript
@Resolver(() => Post)
@UseGuards(JwtAuthGuard)  // All methods protected
export class PostsResolver { }
```

**Global-level:**
```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // Applies to all routes
    },
  ],
})
```

#### Our Project's Guards

| Guard | Purpose | Usage |
|-------|---------|-------|
| `JwtAuthGuard` | Validate JWT token | Global + specific routes |
| `RolesGuard` | Check user roles | Combined with `@Roles()` decorator |

---

### 8. Interceptors

**Interceptors** intercept incoming requests and outgoing responses. They can:
- Transform responses
- Add extra logic before/after method execution
- Cache responses
- Handle timeouts
- Log requests

#### Interceptor Interface

```typescript
export interface NestInterceptor<T = any, R = any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<R> | Promise<Observable<R>>;
}
```

#### Creating an Interceptor

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const start = Date.now();

    // Code executed BEFORE handler
    this.logger.log(`Incoming: ${info.parentType.name}.${info.fieldName}`);

    return next.handle().pipe(
      // Code executed AFTER handler
      tap((data) => {
        const duration = Date.now() - start;
        this.logger.log(`${info.fieldName} completed in ${duration}ms`);
      }),
    );
  }
}
```

#### Using Interceptors

**Method-level:**
```typescript
@Query(() => User)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
findOne(@Args('id') id: string) {
  return this.usersService.findOne(id);
}
```

**Controller/Resolver-level:**
```typescript
@Resolver(() => User)
@UseInterceptors(LoggingInterceptor)
export class UsersResolver { }
```

**Global-level:**
```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
```

#### Transform Interceptor Example

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
        status: 'success',
      })),
    );
  }
}
```

---

### 9. Exception Filters

**Exception Filters** handle exceptions thrown by your application and format the response sent to the client.

#### Built-in HTTP Exceptions

```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Please login');
throw new ForbiddenException('Access denied');
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new InternalServerErrorException('Something went wrong');
```

#### Creating Custom Exception Filter

```typescript
@Catch()  // Catch all exceptions
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    // Determine error details
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      code = this.getErrorCode(status);
    }

    // Log the error
    this.logger.error(
      `${info.parentType.name}.${info.fieldName}: ${message}`,
      exception.stack,
    );

    // Return formatted error
    return {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: `${info.parentType.name}.${info.fieldName}`,
    };
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED: return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN: return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND: return 'NOT_FOUND';
      default: return 'INTERNAL_SERVER_ERROR';
    }
  }
}
```

#### Using Exception Filters

**Method-level:**
```typescript
@Query(() => User)
@UseFilters(GraphQLExceptionFilter)
findOne(@Args('id') id: string) {
  return this.usersService.findOne(id);
}
```

**Global-level:**
```typescript
// app.module.ts
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
  ],
})
```

---

### 10. Pipes

**Pipes** transform input data and validate it before it reaches the handler.

#### Built-in Pipes

| Pipe | Purpose |
|------|---------|
| `ValidationPipe` | Validate and transform DTOs |
| `ParseIntPipe` | Parse string to integer |
| `ParseBoolPipe` | Parse string to boolean |
| `ParseArrayPipe` | Parse to array |
| `DefaultValuePipe` | Set default value |

#### Global Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip properties without decorators
    forbidNonWhitelisted: true, // Throw error for extra properties
    transform: true,           // Transform to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

#### DTO with Validation

```typescript
export class CreateUserInput {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
```

#### Custom Pipe

```typescript
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('Invalid ObjectId');
    }
    return value;
  }
}

// Usage
@Get(':id')
findOne(@Param('id', ParseObjectIdPipe) id: string) {
  return this.service.findOne(id);
}
```

---

### 11. Custom Decorators

**Decorators** add metadata to classes, methods, or parameters.

#### Creating Custom Decorators

**Metadata Decorator:**
```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Usage
@Roles(UserRole.ADMIN)
@Mutation(() => User)
deleteUser(@Args('id') id: string) { }
```

**Parameter Decorator:**
```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext().req.user;
  },
);

// Usage
@Query(() => User)
me(@CurrentUser() user: User) {
  return user;
}
```

**Method Decorator:**
```typescript
// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Usage in Guard
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  context.getHandler(),
  context.getClass(),
]);

if (isPublic) return true;
```

---

### 12. Configuration Management

NestJS provides the `ConfigModule` for environment-based configuration.

#### Setup

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,              // Available everywhere
      envFilePath: '.env',         // Load from .env file
      load: [appConfig, dbConfig], // Load configuration objects
    }),
  ],
})
```

#### Configuration Files

```typescript
// config/app.config.ts
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  graphql: {
    playground: process.env.GRAPHQL_PLAYGROUND === 'true',
    debug: process.env.GRAPHQL_DEBUG === 'true',
  },
}));

// config/database.config.ts
export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}));
```

#### Using Configuration

```typescript
// Using ConfigService
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return this.configService.get<number>('app.port');
    // Or: this.configService.get('PORT');
  }
}

// Async module configuration
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    // ...
  }),
  inject: [ConfigService],
}),
```

---

### 13. Production Best Practices

#### Security Checklist

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS with specific origins
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
  });

  // 2. Helmet for security headers
  app.use(helmet());

  // 3. Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // 4. Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 5. Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}
```

#### Performance Optimization

```typescript
// Enable compression
app.use(compression());

// Use fastify adapter for better performance
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
```

#### Logging

```typescript
// Custom logger
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log'],
});

// Winston for production
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
```

#### Health Checks

```typescript
// Install: npm install @nestjs/terminus
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

#### Environment-Based Configuration

```typescript
// app.module.ts
const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: !isProduction,
      playground: !isProduction,
      introspection: !isProduction,
    }),
  ],
})
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [TypeORM Documentation](https://typeorm.io/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Support

If you encounter any issues or have questions:
1. Check the documentation above
2. Review the code comments
3. Open an issue in the repository
