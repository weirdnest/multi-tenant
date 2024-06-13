export abstract class AbstractDto<T> {
  constructor(partial: T) {
    Object.assign(this, partial);
  }
}
