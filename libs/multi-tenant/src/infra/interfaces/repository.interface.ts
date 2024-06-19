import { ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  ServiceFindManyOptions,
  ServiceFindOneOptions,
} from './service.interface';

export interface IFindManyResponse<Entity> {
  total: number;
  data: Entity[];
}

export interface IRepositoryRequestParams {
  entityManager?: any;
}

export type EntitiesToUpsert<Entity> =
  | QueryDeepPartialEntity<ObjectLiteral extends Entity ? unknown : Entity>
  | QueryDeepPartialEntity<ObjectLiteral extends Entity ? unknown : Entity>[];

export interface IRepository<Entity> {
  getRepository(entity: unknown, params?: IRepositoryRequestParams): unknown;
  create(body: any, params?: IRepositoryRequestParams): Promise<Entity>;
  save(body: any, params?: IRepositoryRequestParams): Promise<Entity>;
  count(query?: any): Promise<number>;
  findAndCount(query?: any): Promise<[Entity[], number]>;
  findOne(query?: any): Promise<Entity>;
  findMany(query?: any): Promise<IFindManyResponse<Entity>>;
  find(query?: any): Promise<Entity[]>;
  update(
    id: string | string[],
    body?: any,
    params?: IRepositoryRequestParams,
  ): Promise<Entity | Entity[]>;
  remove(
    id: string | string[],
    params?: IRepositoryRequestParams,
  ): Promise<Entity | Entity[]>;
  upsert(
    entityOrEntities: EntitiesToUpsert<Entity>,
    query: string[],
    params?: IRepositoryRequestParams,
  ): Promise<any>;

  getFindManyOptions(
    query: ServiceFindManyOptions<Entity>,
    appendWhere?: Partial<Entity>,
  ): any;
  getFindOneOptions(
    query: ServiceFindOneOptions<Entity>,
    appendWhere?: Partial<Entity>,
  ): any;
  getFindWhereByIds(ids: string | string[], appendWhere?: Partial<Entity>): any;
}
