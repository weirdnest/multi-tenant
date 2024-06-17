import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../entities/user';
import { IUsersRepository } from '../interfaces/users-repository.interface';
import { johnDoe } from '../interfaces/users.samples';
import {
  MockType,
  mockRepoFactory,
} from '@w7t/multi-tenant/infra/abstract/specs';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: MockType<IUsersRepository>;

  const userId = johnDoe.id;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        UsersService,
        {
          provide: IUsersRepository,
          useFactory: mockRepoFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    mockRepo = module.get(IUsersRepository);
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: requests repository', async () => {
    const payload = {
      email: johnDoe.email,
      password: johnDoe.password,
      name: johnDoe.name,
    };
    await service.create(payload);
    expect(mockRepo.create).toHaveBeenCalledWith(payload);
  });

  it('findMany: requests repository', async () => {
    const payload = { name: 'abc' };
    await service.findMany(payload);
    expect(mockRepo.findMany).toHaveBeenCalledWith(payload);
  });

  it('findOne: requests repository', async () => {
    const payload = { name: 'abc' };
    await service.findOne(payload);
    expect(mockRepo.findOne).toHaveBeenCalledWith(payload);
  });

  it('update: requests repository', async () => {
    const payload = { name: 'abc' };
    await service.update(userId, payload);
    expect(mockRepo.update).toHaveBeenCalledWith(userId, payload);
  });

  it('remove: requests repository', async () => {
    await service.remove(userId);
    expect(mockRepo.remove).toHaveBeenCalledWith(userId);
  });

  /** keep it to skip scenarios quicker */
});
