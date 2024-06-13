import * as _ from 'lodash';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { AbilityAction } from './constants';
import { IAbilityFactory } from './interfaces/ability-factory.interface';
import { User } from '../users/entities/user';

export type AppAbility<T> = MongoAbility<[AbilityAction, T]>;

export interface IPolicyHandler<T> {
  handle(ability: AppAbility<T>): boolean;
}

@Injectable()
export class AbilityFactory<T> implements IAbilityFactory<T> {
  private _builder: undefined | AbilityBuilder<MongoAbility<[AbilityAction, T]>>;
  private get builder() {
    return this._builder;
  }

  createBuilder(user: User) {
    const { can, cannot, build } = (this._builder = new AbilityBuilder<
      MongoAbility<[AbilityAction, T]>
    >(Ability as AbilityClass<AppAbility<T>>));
    // console.log(`AbilityFactory: user:`, user);
    // const tenantId = _.get(user, 'tenant.id', '');
    // if (user.systemRole === SystemRole.Admin) {
    //   can(AbilityAction.Manage, 'all' as any); // read-write access to everything
    // }
    return this.builder;
  }

  build() {
    return this.builder.build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => {
        // console.log(`AbilityFactory.detectSubjectType: item:`, item);
        return item.constructor as ExtractSubjectType<T>;
      },
    });
  }

  createForUser(user: User) {
    this.createBuilder(user);
    return this.build();
    /*
    const { can, cannot, build } = new AbilityBuilder<
      MongoAbility<[AbilityAction, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    // console.log(`AbilityFactory: user:`, user);
    const { companyId } = user?.member || {};

    if (user.systemRole === SystemRole.Admin) {
      can(AbilityAction.Manage, 'all'); // read-write access to everything
    } else {
      // can(AbilityAction.Read, 'all', { companyId: 'abcd' }); // read-only access to everything
      // can(AbilityAction.Read, Membership, { companyId }); // read-only access to everything
      // cannot(AbilityAction.Read, Membership);
      // can(AbilityAction.Read, Membership, { companyId: 'abcd' }); // read-only access to everything
    }
    // can(AbilityAction.Read, 'all'); // read-only access to everything

    // can(AbilityAction.Update, Article, { authorId: user.id });
    // cannot(AbilityAction.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => {
        console.log(`AbilityFactory.detectSubjectType: item:`, item);
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
    */
  }
}
