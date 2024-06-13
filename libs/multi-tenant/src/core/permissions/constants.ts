export const PERMISSIONS_UPSERT_LIMIT = 64;

export enum PermissionsMessage {
  PERMISSIONS_UPSERT_LIMIT_EXCEEDED = `Exceeded limit of permissions to upsert: 64`,
  PERMISSION_KEY_MISSING = `Missing permission key`,
}
