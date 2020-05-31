import { ApplicationError } from '../../lib/api'

export const Errors = {
  EMAIL_ALREADY_TAKEN: {
    type: ApplicationError.type.APP_NAME,
    code: 'EMAIL_ALREADY_TAKEN',
    message: 'The given email address is already taken :(',
    statusCode: 400
  },
  AUTH_WEAK_PASSWORD: {
    type: ApplicationError.type.APP_NAME,
    code: 'AUTH_WEAK_PASSWORD',
    message: 'The given password is easy to guess, provide strong password',
    statusCode: 400
  }
}
