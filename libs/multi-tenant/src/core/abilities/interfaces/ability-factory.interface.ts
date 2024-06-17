import { AbilityBuilder, MongoAbility, MongoQuery } from '@casl/ability';
import { AbilityAction } from '../constants';
import { User } from '../../users/entities/user';

export interface IAbilityFactory<T> {
  build: () => MongoAbility<[AbilityAction, T], MongoQuery>;
  createBuilder: (
    user: User,
  ) => AbilityBuilder<MongoAbility<[AbilityAction, T]>>;
}

export const IAbilityFactory = Symbol('IAbilityFactory');
