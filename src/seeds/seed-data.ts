export const seedUsers = [
  {
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'admin123',
    role: 'admin',
  },
  {
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
    role: 'user',
  },
  {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'password123',
    role: 'user',
  },
  {
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    password: 'password123',
    role: 'user',
  },
];

export const seedPosts = [
  {
    title: 'Welcome to Our Platform',
    content: 'This is the first post on our platform. We are excited to have you here!',
    published: true,
    authorEmail: 'admin@example.com',
  },
  {
    title: 'Getting Started with GraphQL',
    content:
      'GraphQL is a query language for APIs and a runtime for executing those queries. It provides a complete and understandable description of the data in your API.',
    published: true,
    authorEmail: 'admin@example.com',
  },
  {
    title: 'NestJS Best Practices',
    content:
      'NestJS is a framework for building efficient, scalable Node.js server-side applications. Here are some best practices to follow when building your applications.',
    published: true,
    authorEmail: 'john@example.com',
  },
  {
    title: 'My Journey with TypeScript',
    content:
      'TypeScript is a strongly typed programming language that builds on JavaScript. Here is my experience learning and using TypeScript in production.',
    published: false,
    authorEmail: 'jane@example.com',
  },
  {
    title: 'Understanding Authentication',
    content:
      'Authentication is the process of verifying who someone is. In this post, we will explore different authentication methods and their trade-offs.',
    published: true,
    authorEmail: 'john@example.com',
  },
  {
    title: 'Database Design Principles',
    content:
      'Good database design is crucial for building scalable applications. Learn about normalization, indexing, and other important concepts.',
    published: true,
    authorEmail: 'admin@example.com',
  },
  {
    title: 'REST vs GraphQL',
    content:
      'Both REST and GraphQL are popular approaches to building APIs. Let us compare them and understand when to use each.',
    published: false,
    authorEmail: 'bob@example.com',
  },
  {
    title: 'Docker for Beginners',
    content:
      'Docker is a platform for developing, shipping, and running applications in containers. This post will help you get started.',
    published: true,
    authorEmail: 'jane@example.com',
  },
];
