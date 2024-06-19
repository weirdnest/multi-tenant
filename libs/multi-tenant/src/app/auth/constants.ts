export enum AuthMessage {
  OK = `Success`,
  CREATED = `Authorized`,
  REGISTERED = `Successfully registered`,
  UNAUTHORIZED = `Wrong credentials provided`,
  MISSING_TOKEN = `Token not available in payload`,
  MISSING_CONTEXT_USER = `User context error`,
  TENANT_LOGIN_FAILED = `Tenant login failed`,

  // validation errors copied from ClassValidator output
  EMAIL_FORMAT_ERROR = `email must be an email`,
  PASSWORD_TYPE_ERROR = `password must be a string`,
  PASSWORD_FORMAT_ERROR = `password must be longer than or equal to 6 characters`,
  NAME_EMPTY_ERROR = `name should not be empty`,
  NAME_TYPE_ERROR = `name must be a string`,
}
