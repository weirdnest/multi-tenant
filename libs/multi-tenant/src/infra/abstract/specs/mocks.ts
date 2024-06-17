import { Repository } from 'typeorm';
import { AbstractRepository } from '../abstract.repository';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

class MockRepository<Entity> extends AbstractRepository<Entity> {
  getRepository(...args: any[]): Repository<Entity> {
    return this as any;
  }
}

const repoHelper = new MockRepository({} as any);

export const mockRepoFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  create: jest.fn((entity) => entity),
  upsert: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
  findMany: jest.fn((entity) => entity),
  find: jest.fn((entity) => entity),
  findAndCount: jest.fn((entity) => entity),
  update: jest.fn((entity) => entity),
  remove: jest.fn((entity) => entity),
  getFindManyOptions: jest.fn((query, append) =>
    repoHelper.getFindManyOptions(query, append),
  ),
  getFindOneOptions: jest.fn((query, append) =>
    repoHelper.getFindOneOptions(query, append),
  ),
  getFindWhereByIds: jest.fn((query, append) =>
    repoHelper.getFindWhereByIds(query, append),
  ),
}));

export const mockServiceFactory: () => MockType<any> = jest.fn(() => ({
  create: jest.fn((entity) => entity),
  upsert: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
  findMany: jest.fn((entity) => entity),
  update: jest.fn((entity) => entity),
  remove: jest.fn((entity) => entity),
}));

export const mockRepoData = (
  mockRepo: MockType<Repository<unknown>>,
  entities: any[],
) => {
  const [firstEntity] = entities;
  const numEntities = entities.length;
  mockRepo.findOne.mockImplementation(() => firstEntity);
  mockRepo.findAndCount.mockImplementation(() => [entities, numEntities]);
  mockRepo.find.mockImplementation(() => entities);
  mockRepo.save.mockImplementation(() => firstEntity);
};
