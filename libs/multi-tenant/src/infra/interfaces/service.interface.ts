// import { TenantEntity, UserEntity } from '@libs/app/entities';

// import { Tenant } from '@libs/core/services/tenants/entities/tenant';
import { User } from '../../core/users';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
} from 'typeorm';
import { IFindManyResponse } from './repository.interface';
import { Tenant } from '@w7t/multi-tenant/core/tenants';
export { FindManyOptions, FindOneOptions } from 'typeorm';

export type ServiceFindOneOptions<Entity> =
  | FindOptionsWhere<Entity>
  | FindOneOptions<Entity>;
export type ServiceFindManyOptions<Entity> =
  | FindOptionsWhere<Entity>
  | FindManyOptions<Entity>;

export type ServiceFindResourceOptions<Entity> =
  | string
  | number
  | Date
  | ObjectId
  | string[]
  | number[]
  | Date[]
  | ObjectId[]
  | FindOptionsWhere<Entity>;

export interface ServiceInterface<Entity, CreateEntityDto, UpdateEntityDto> {
  create(
    body: CreateEntityDto,
    context?: ServiceRequestContext,
  ): Promise<Entity>;
  findMany(
    query: ServiceFindManyOptions<Entity>,
    context?: ServiceRequestContext,
  ): Promise<IFindManyResponse<Entity>>;
  findOne(
    query: ServiceFindOneOptions<Entity>,
    context?: ServiceRequestContext,
  ): Promise<Entity>;
  update(
    id: string | string[],
    payload: UpdateEntityDto,
    context?: ServiceRequestContext,
  ): Promise<Entity | Entity[]>;
  remove(
    id: string | string[],
    context?: ServiceRequestContext,
  ): Promise<Entity | Entity[]>;
}

export interface ServiceRequestContext {
  user?: User;
  tenant?: Tenant;
  entityManager?: EntityManager;
}

// export interface AppServiceRequestContext {
//   user?: UserEntity;
//   tenant?: TenantEntity;
//   entityManager?: EntityManager;
// }
