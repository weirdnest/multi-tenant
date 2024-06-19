import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  InsertResult,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import {
  IFindManyResponse,
  EntitiesToUpsert,
  IRepository,
  IRepositoryRequestParams,
} from '../interfaces/repository.interface';
import {
  ServiceFindManyOptions,
  ServiceFindOneOptions,
} from '../interfaces/service.interface';

export interface AbstractRepositoryRequestParams
  extends IRepositoryRequestParams {
  entityManager: EntityManager;
}

export abstract class AbstractRepository<Entity>
  implements IRepository<Entity>
{
  private _repository: Repository<Entity>;
  public get repository() {
    return this._repository;
  }

  constructor(repository: Repository<Entity>) {
    this._repository = repository;
  }

  /**
   * returns current repo or one from entityManager
   * @param args
   * @returns Repository<Entity>
   */
  abstract getRepository(...args): Repository<Entity>;

  async create(
    body: DeepPartial<Entity>,
    params?: IRepositoryRequestParams,
  ): Promise<Entity> {
    return await this.getRepository(params).save(this.repository.create(body));
  }

  async save(
    body: DeepPartial<Entity>,
    params?: IRepositoryRequestParams,
  ): Promise<Entity> {
    return await this.getRepository(params).save(body);
  }

  /**
   * Counts available items
   * @param options ServiceFindManyOptions<Entity>
   * @returns Promise<number>
   */
  async count(options?: ServiceFindManyOptions<Entity>) {
    options = this.getFindManyOptions(options);
    return this.repository.count(options);
  }

  /**
   * Finds list of items
   * @param options ServiceFindManyOptions<Entity>
   * @returns Promise<Entity[]>
   */
  async find(options?: ServiceFindManyOptions<Entity>): Promise<Entity[]> {
    options = this.getFindManyOptions(options);
    return await this.repository.find(options);
  }

  /**
   * Finds list of items and counts total
   * @param options ServiceFindManyOptions<Entity>
   * @returns Promise<[Entity[], number]>
   */
  async findAndCount(
    options?: ServiceFindManyOptions<Entity>,
  ): Promise<[Entity[], number]> {
    options = this.getFindManyOptions(options);
    return await this.repository.findAndCount(options);
  }

  /**
   * Returns formatted list of items with metadata
   * @param options ServiceFindManyOptions<Entity>
   * @returns Promise<AbstractFindManyResponse<Entity>>
   */
  async findMany(
    options?: ServiceFindManyOptions<Entity>,
  ): Promise<IFindManyResponse<Entity>> {
    const [data, total] = await this.findAndCount(options);
    return { total, data };
  }

  /**
   * Find single entity
   * @param options ServiceFindOneOptions<Entity>
   * @returns Promise<Entity>
   */
  async findOne(options?: ServiceFindOneOptions<Entity>): Promise<Entity> {
    options = this.getFindOneOptions(options);
    return await this.repository.findOne(options);
  }

  /**
   * Updates one or many entities
   * @param id string | string[]
   * @param body DeepPartial<Entity>
   * @returns Promise<Entity | Entity[]
   */
  async update(
    id: string | string[],
    body: DeepPartial<Entity>,
    params?: AbstractRepositoryRequestParams,
  ): Promise<Entity | Entity[]> {
    const query = this.getFindWhereByIds(id);
    const items = await this.repository.find({ where: query });
    const promises = items.map((item: Entity) => {
      const payload = {
        ...item,
        ...body,
      };
      return this.getRepository(params).save(payload);
    });
    return await Promise.all(promises);
  }

  /**
   * Removes one or many entities
   * @param id string | string[]
   * @returns Promise<Entity | Entity[]
   */
  async remove(
    id: string | string[] | FindOptionsWhere<Entity>,
    params?: AbstractRepositoryRequestParams,
  ): Promise<Entity | Entity[]> {
    let query = {};
    if (typeof id === 'string' || Array.isArray(id)) {
      query = this.getFindWhereByIds(id);
    } else {
      query = id;
    }
    const repository = this.getRepository(params);
    const items = await repository.find({ where: query });
    console.log(`AbstractRepository.remove: query:`, query);
    const promises = items.map((item: Entity) => {
      return repository.remove(item);
    });
    return await Promise.all(promises);
  }

  async upsert(
    entityOrEntities: EntitiesToUpsert<Entity>,
    query: string[],
    params?: AbstractRepositoryRequestParams,
  ): Promise<InsertResult> {
    return await this.getRepository(params).upsert(
      entityOrEntities as any,
      query,
    );
  }

  getFindManyOptions(
    query: ServiceFindManyOptions<Entity>,
    appendWhere?: Partial<Entity>,
  ): FindManyOptions<Entity> {
    const isFindOptions = !!(
      (query as any)?.where || (query as any)?.relations
    );
    const findOptions: FindManyOptions<Entity> = isFindOptions
      ? (query as unknown as FindManyOptions<Entity>) || {}
      : { where: (query as FindOptionsWhere<Entity>) || {} };

    if (appendWhere) {
      findOptions.where = {
        ...(findOptions.where || {}),
        ...(appendWhere || {}),
      };
    }
    return findOptions;
  }

  getFindOneOptions(
    query: ServiceFindOneOptions<Entity>,
    appendWhere?: Partial<Entity>,
  ): FindOneOptions<Entity> {
    const isFindOptions = !!(
      (query as any)?.where || (query as any)?.relations
    );
    const findOptions: FindOneOptions<Entity> = isFindOptions
      ? (query as unknown as FindOneOptions<Entity>)
      : { where: (query as FindOptionsWhere<Entity>) || {} };

    if (appendWhere) {
      findOptions.where = {
        ...(findOptions.where || {}),
        ...(appendWhere || {}),
      };
    }
    return findOptions;
  }

  getFindWhereByIds(
    ids: string | string[],
    appendWhere?: Partial<Entity>,
  ): FindOptionsWhere<Entity> {
    let query: FindOptionsWhere<any> = {};
    if (typeof ids === 'string') {
      query.id = ids;
    } else if (Array.isArray(ids)) {
      query.id = In(ids);
    }
    if (appendWhere) {
      query = {
        ...query,
        ...appendWhere,
      };
    }
    return query;
  }
}
