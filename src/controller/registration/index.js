import { userRegistrationSchema } from "./validation";
import { createError, sendJson, ApplicationError } from "../../lib/api";
import { Errors } from "./error";

export async function validateUserRegistration(req, res, next) {
  try {
    console.log("req.body :: " + JSON.stringify(req.body, null, 2));
    await userRegistrationSchema().validate(req.body, { abortEarly: false });
  } catch (e) {
    return next(createError(e));
  }
  next();
}

export function validationBusinessRule(req, res, next) {
  const { email, password } = req.body;

  if (email.includes('dummy@gmail.com')) {
    throw new ApplicationError(Errors.EMAIL_ALREADY_TAKEN);
  }
  
  if (password.includes('qwerty')) {
    throw new ApplicationError(Errors.AUTH_WEAK_PASSWORD);
  }
  next()
}
export function postRegistration(req, res, next) {
  // await UserRegistrationRepo.register(req.body)
  sendJson(res, { message: "Registration is successful" });
}


// Bonus Tips - use await-to-js npm package
// exception: email already taken, weak password
// Schema based validation: ignore null checks

// export async function validateUserRegistration(req, res, next) {
//   const [err, result] = await to(getUserRegistrationSchema()).validate(req.body, {abortEarly: false});

//   if (err) {
//     return next(createError(e));
//   }
//   next();
// }
