export class ValidationError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'ValidationError';
    this.message = message;
  }
}

export class BodyError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'BodyError';
    this.message = message;
  }
}

export class ParamsError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'ParamsError';
    this.message = message;
  }
}

export class HeadersError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'HeadersError';
    this.message = message;
  }
}
