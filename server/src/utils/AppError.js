export class AppError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message || code);
    this.code = code;
    this.statusCode = statusCode;
  }
}
