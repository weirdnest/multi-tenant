export { HttpStatus } from '@nestjs/common';

export enum HttpStatusMessage {
  OK = `OK`,
  CREATED = `Created`,
  INTERNAL_SERVER_ERROR = `Internal server error`,
  UNAUTHORIZED = `Unauthorized`,
  AUTHORIZED = `Authorized`,
  BAD_REQUEST = `Bad Request`,
  FORBIDDEN = `Forbidden`,
}

export enum PgErrorCode {
  UNEXPECTED_DATA = '23502',
  DUPLICATED_UNIQUE = '23505',
  UNDEFINED_TABLE = '42P01',
  FOREIGN_KEY_VIOLATION = '23503',
  COLUMN_DOES_NOT_EXIST = '42703',
  INVALID_TEXT_REPRESENTATION = '22P02',
}
export enum PgErrorMessage {
  UNEXPECTED_DATA = `Unexpected format of data`,
  DUPLICATED_UNIQUE = `Duplicate unique data`,
  MISSING_ID = `Resource ID is missing`,
  UNDEFINED_TABLE = `Database error`,
  FOREIGN_KEY_VIOLATION = `Foreign key violation`,
  COLUMN_DOES_NOT_EXIST = 'Database error',
  INVALID_TEXT_REPRESENTATION = 'Invalid text representation',
}
