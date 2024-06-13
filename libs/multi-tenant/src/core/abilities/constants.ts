export enum AbilityAction {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AbilityActionValue = `${AbilityAction}`;

export enum AbilityMessages {
  FORBIDDEN = `Forbidden resource`,
}
