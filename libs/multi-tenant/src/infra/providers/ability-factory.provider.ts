import { IAbilityFactory } from '@w7t/multi-tenant/core/abilities/interfaces/ability-factory.interface';
import { AbilityFactory } from '@w7t/multi-tenant/core/abilities/ability.factory';

export const AbilityFactoryProvider = {
  provide: IAbilityFactory,
  useClass: AbilityFactory,
};
