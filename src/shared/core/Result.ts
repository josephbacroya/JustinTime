/**
 * Result pattern for enterprise-grade error handling.
 * Avoids throwing exceptions for expected business logic errors.
 */
export class Result<T, E = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: E | null, value: T | null) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'error' instead.");
    }
    return this._value as T;
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, null, value as U);
  }

  public static fail<U, E>(error: E): Result<U, E> {
    return new Result<U, E>(false, error, null);
  }
}
