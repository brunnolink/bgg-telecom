export class AppError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode ?? 400
    this.name = 'AppError'
  }
}
