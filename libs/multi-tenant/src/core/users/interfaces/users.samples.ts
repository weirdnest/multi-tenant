import { User } from '../entities/user';

export const usersSamples = {
  johnDoe: {
    id: '0c24fc27-0007-49be-a3cc-2849112105ab',
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: 'ou_baeK5',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  janeDoe: {
    id: '7aa4be47-b81c-4f28-a293-8ef7f4e00685',
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
    password: 'Le-j3aj8',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const { johnDoe } = usersSamples;
