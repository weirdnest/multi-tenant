import { ServiceFindManyOptions } from "@w7t/multi-tenant/infra/interfaces/service.interface";
import { Tenant } from "../../tenants/entities/tenant";
import { User } from "../../users/entities/user";
import { AbilityAction, AbilityActionValue } from "../constants";
import { AbilityBuilder, MongoAbility, MongoQuery } from "@casl/ability";


export interface SetAbilitiesContext {
  user?: User;
  tenant?: Tenant;
}

export type SetAbilitiesOptions<T> = AbilityBuilder<
  MongoAbility<[AbilityAction, T]>
>;

export interface IAbilitiesService {
  createAbility: (
    context: SetAbilitiesContext,
    classConstructor: any,
    setAbilities: (
      context: SetAbilitiesContext,
      opts: SetAbilitiesOptions<any>,
    ) => Promise<void>,
  ) => Promise<MongoAbility<[AbilityAction, any], MongoQuery>>;
  configure: (
    setAbilities: (
      context: SetAbilitiesContext,
      opts: SetAbilitiesOptions<any>,
    ) => Promise<void>,
  ) => void;
  allow: (
    actions: AbilityAction | AbilityActionValue[],
    classConstructor: any,
    context: SetAbilitiesContext,
    payload: any,
  ) => Promise<void>;

  getQueryFilter: (
    query: ServiceFindManyOptions<unknown>,
    actions: AbilityAction | AbilityActionValue[],
    classConstructor: any,
    context: SetAbilitiesContext,
  ) => Promise<any>;
}

export const IAbilitiesService = Symbol('IAbilitiesService');
