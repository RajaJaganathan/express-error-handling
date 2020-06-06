# Error Handling in express.js

Error handling is an important concept to understand for writing any better application. However often, I have seen error handling is misused or handled wrong way in many different application, especially in express.js application.

In this article, we'll talk about a way to handle the error in a better and scalable way.

Let’s build an user registration API with all functionality like validating user input, handling business validation, save the user's registration etc..,
 
```javascript

app.post(
  "api/user/registration",
  ...
);

```

We will demonstrate 3 approaches such as novice, advanced and pro version of user's registration api.

## Novice approach

In general we will come up with below code snippet without any proper design in place or this may be our first rough cut to build a registration endpoint.

```javascript

app.post("api/user/registration", postRegistration);

function postRegistration(req, res, next) {
  const {
    first_name,
    last_name,
    email,
    password,
    re_password,
    terms_condition,
  } = req.body;

  const errors = [];

  // Required field validation
  if (!first_name) {
    errors.push("first_name is required");
  }
  if (!last_name) {
    errors.push("last_name is required");
  }
  if (!email) {
    errors.push("email is required");
  }
  if (!email) {
    errors.push("email is required");
  }
  if (!password) {
    errors.push("password is required");
  }
  if (!re_password) {
    errors.push("re_password is required");
  }
  if (!terms_condition) {
    errors.push("terms_condition is required");
  }

  // Length validation
  if (password.length > 8) {
    errors.push("Password has to be longer than 8 characters");
  }

  // cross field match validation
  if (password === re_password) {
    errors.push("Password and re_password has to match");
  }

  // Bad request error
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  // Server business logic validation
  const businessErrors = [];
  
  if (email.includes("dummy@gmail.com")) {
    businessErrors.push("EMAIL_ALREADY_TAKEN");
  }

  if (password.includes("qwerty")) {
    businessErrors.push("AUTH_WEAK_PASSWORD");
  }

  if (businessErrors.length > 0) {
    return res.status(400).json({ businessErrors: businessErrors });
  }

  // await UserRegistrationRepo.register(req.body)
  res.json({ error: false, msg: "Registration is successful" });
}

```
Let's try to find the problem with above approach. It's easy to find many problems at a very first glance like code duplication, too many responsibilities for _postRegistration_ function because it does multiple thing such as validating the input, handle business validation and handling database operation etc.., 

Moving on to advanced version.

## Advanced

In this version we will try to rectify the problem that we encountered in novice approach by eliminating the code duplication, split into responsibility, clean logical separations etc..,

```javascript
app.post(
  "api/user/registration",
  validateRegistrationInput,
  validateBusinessRegistration,
  postRegistration
);
```

To avoid code duplication we have created our own util function to validate the different rules such as required, minLength etc..,

_lib/util/validation.js_
 
```javascript
export function validate(input, validationRule) {
  return Object.keys(validationRule).reduce((errors, key) => {
    const currentRule = validationRule[key];
    if (currentRule.required) {
      if (!input[key]) {
        errors.push(`${key} is required field`);
      }
    }

    if (currentRule.minLength) {
      console.log({ errors, key, currentRule, input });
      if (input[key] && input[key].length < currentRule.minLength) {
        errors.push(
          `${key} has to more than ${currentRule.minLength} characters`
        );
      }
    }
    //TODO:cross field match validation
    return errors;
  }, []);
}

```

_controller/registration.js_

Let's see how our registration's controller code looks like

```javascript
import { validate } from './validation'

const validationRule = {
  first_name: {
    required: true,
  },
  last_name: {
    required: true,
  },
  email: {
    required: true,
  },
  password: {
    required: true,
    minLength: 8,
  },
  re_password: {
    required: true,
    ref: "password",
    exactMatch: true,
  },
  terms_condition: {
    required: true,
  },
};

export function validateRegistrationInput(req, res, next) {
  const {
    first_name,
    last_name,
    email,
    password,
    re_password,
    terms_condition,
  } = req.body;

  const errors = validate(req.body, validationRule);

  // Bad request error
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }
  next();
}

export function validateBusinessRegistration(req, res, next) {
  // Server business logic validation
  const { email, password } = req.body;
  const businessErrors = [];

  if (email.includes("dummy@gmail.com")) {
    businessErrors.push("EMAIL_ALREADY_TAKEN");
  }

  if (password.includes("qwerty")) {
    businessErrors.push("AUTH_WEAK_PASSWORD");
  }

  if (businessErrors.length > 0) {
    return res.status(400).json({ errorMessages: businessErrors });
  }

  next();
}

export function postRegistration(req, res, next) {
  // await UserRegistrationRepo.register(req.body)
  res.json({ success: true, data: { message: "Registration is successful" }});
}
```
Let's discuss some of the pros & cons of this advanced version of _api/user/registration_

__Pros:__

 - Reduced code duplication
 - clean separation
 - adhered single responsibility

__Cons:__
 
-  Not leveraging centralize error handling
-  Own implementation of validation (time-consuming to implement and test case to cover the all use-case)
-  Inconsistent error schema structure (How to provide consistent error schema to client ?)
     - _res.status(400).json({ **errorMessages**: businessErrors });_
     - _res.status(400).json({ **errors**: errors });_
-  Inconsistent response schema structure (How to provide consistent response schema to client ?)
     -  _res.json({ **success: true**, data: { message: "Registration is successful" } });_
     -  _res.json({ **error: false**, msg: "Registration is successful" });_

Just want to more emphasis on consistency, because consistency will lead a better, clean and understandable code. Also, which help us to refactor the code though code is messy.

## Pro: Scalable Error handling

In pro version, we will take care of following things

1. Validation with Schema library (Yup/Joi)
2. Unified AppilcationError interface
3. Custom Error creation
4. Central error handling

### Validation with Schema library

I'd like to introduce the schema based validation library such as [Yup](https://github.com/jquense/yup)/[Joi](https://github.com/hapijs/joi) . Let's define the validation schema for our registration endpoint like below. 

Take a look at our _userRegistrationSchema_ function. See how elegantly we are validating against our javascript object without much code to write and also think about readablity perceptive, it has improved a lot and schema based validation is help us to reduce bug too!.

_validation.js_

```javascript
import * as Yup from "yup";

export function userRegistrationSchema() {
  return Yup.object().shape({
    first_name: Yup.string().required(),
    last_name: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string()
      .min(8, "Password has to be longer than 8 characters!")
      .required(),
    re_password: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Re-enter password is a required field"),
    terms_condition: Yup.boolean().oneOf(
      [true],
      "Please accept terms and conditions"
    ),
  });
}

```

### Unified Appilcation Error interface

Let's create our own error class for whole application so that it will provide consistent error interface, error schema structure to the application and clients. 

In other way, we may prefer to create our own custom error class which extends javascript's _Error_ class, like below

```javascript
class ResourceNotFound extend Error { }
```

It's up to us to decide but I felt too many error classes which bring some maintenance, enforce the consistency for error classes seems like it is unnecessary for javascript application. For example, In node.js internally errors are categorized into few type of errors. 

Let's define ApplicationError class

_lib/api/applicationError.js_
```javascript
export class ApplicationError extends Error {
  static type = {
    APP_NAME: "APP_NAME",
    INTERNAL: "INTERNAL",
    NETWORK: "NETWORK",
    UNKNOWN: "UNKNOWN",
  };

  constructor(options, overrides) {
    super();
    Object.assign(options, overrides);

    if (!ApplicationError.type.hasOwnProperty(options.type)) {
      throw new Error(`ApplicationError: ${options.type} is not a valid type.`);
    }

    if (!options.message) {
      throw new Error("ApplicationError: error message required.");
    }

    if (!options.code) {
      throw new Error("ApplicationError: error code required.");
    }

    this.name = "ApplicationError";
    this.type = options.type;
    this.code = options.code;
    this.message = options.message;
    this.errors = options.errors;
    this.meta = options.meta;
    // {
    //   analytics:  {},
    //   context: {}
    // }
    this.statusCode = options.statusCode;
  }
}

```
Great, now we have defined _ApplicationError_ but think a moment about Yup's ValidationError and ApplicationError both are completely different interface.

How do we provide a consistent error interface ?

 Since we are handling the third party exceptions like Yup validation or MongoException, which has the different error schema that will create a problem. We could solve this problem elegantly with the help of __factory function__. so that we can swap the Yup with Joi or something in later point even without knowing or altering too much in existing code.

Our Factory function name called _createError_ that will take care of converting third party exception or any error to ApplicationError exception. Here the errorFactory.js appears below

_lib/api/errorFactory.js_

```javascript
import * as Yup from 'yup'
import { ApplicationError } from './applicationError'

export function createError(error, overrides) {
  const isYupError = error instanceof Yup.ValidationError
  if (isYupError) {
    const yupError = mapYupValidationError(error)
    return new ApplicationError(yupError, overrides)
  }
  return new ApplicationError(error, overrides)
}

function mapYupValidationError(error) {
 
  return {
    type: ApplicationError.type.APP_NAME,
    code: 'VALIDATION_ERROR',
    message: error.message,
    errors: error.inner,
    statusCode: 400,
    meta: {
      context: error.value
    }
  }
}
```

### Custom Error Creation

Return to our registration API, We might encounter the few business exceptions while developing the registration endpoint. Those few exceptions are 

1. if email is already taken (__EMAIL_ALREADY_TAKEN__)
2. if user enters a weak password (__AUTH_WEAK_PASSWORD__)
3. ...

As said, we don't want to create new custom error class for each type of error. then how do we create a custom error with the help of ApplicationError ? 

_controller/registration/error.js_

```javascript

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

```

In later we could use like below

```javascript
new ApplicationError(RegistrationError.EMAIL_ALREADY_TAKEN);
```

one important thing to note, these business validation error.js are co-locating with our registration's controller is good thing.

#### Bonus: Common Errors

I'd like to show some of common errors which helps for REST API development. 

_lib/api/commonError.js_

```javascript
import { ApplicationError } from "./applicationError";

const HTTPError = {
  // Predefined 4xx http errors
  BAD_REQUEST: {
    type: ApplicationError.type.NETWORK,
    code: "BAD_REQUEST",
    message: "Bad request",
    statusCode: 400,
  },
  UNAUTHORIZED: {
    type: ApplicationError.type.NETWORK,
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    statusCode: 401,
  },
  FORBIDDEN: {
    type: ApplicationError.type.NETWORK,
    code: "FORBIDDEN",
    message: "Forbidden",
    statusCode: 403,
  },
  RESOURCE_NOT_FOUND: {
    type: ApplicationError.type.NETWORK,
    code: "RESOURCE_NOT_FOUND",
    message: "Resource not found",
    statusCode: 404,
    meta: {
      translationKey: "app.common.error.RESOURCE_NOT_FOUND",
    },
  },

  // Predefined 5xx http errors
  INTERNAL_SERVER_ERROR: {
    type: ApplicationError.type.NETWORK,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong, Please try again later.",
    statusCode: 500,
    meta: {
      shouldRedirect: true,
    },
  },
  BAD_GATEWAY: {
    type: ApplicationError.type.NETWORK,
    code: "BAD_GATEWAY",
    message: "Bad gateway",
    statusCode: 502,
  },
  SERVICE_UNAVAILABLE: {
    type: ApplicationError.type.NETWORK,
    code: "SERVICE_UNAVAILABLE",
    message: "Service unavailable",
    statusCode: 503,
  },
  GATEWAY_TIMEOUT: {
    type: ApplicationError.type.NETWORK,
    code: "GATEWAY_TIMEOUT",
    message: "Gateway timeout",
    statusCode: 504,
  },
};

export { HTTPError };

```

#### Bonus: Response Schema

In order to send the consistent response schema to the client we may need to define a function, called _sendResponse_, so that we can enforce to use _sendResponse_ instead of _res.json()_

```javascript
import { ApplicationError, createError } from '../error'

export function formatError(error, overrides = {}) {
  // `Error.stack`'s `enumerable` property descriptor is `false`
  // Thus, `JSON.stringify(...)` doesn't enumerate over it.
  const stackTrace = JSON.stringify(error, ['stack'], 4) || {}
  const newError = JSON.parse(JSON.stringify(error))

  // No need to send to client
  newError.statusCode = undefined
  delete newError.meta

  return {
    error: {
      ...newError,
      stack: stackTrace.stack
    },
    success: false,
    ...overrides
  }
}

export function formatResponse(result, override = {}) {
  return {
    data: result,
    success: true,
    ...override
  }
}

export function sendResponse(res, payload, statusCode = 200, context = {}) {
  return res.status(statusCode).json(formatResponse(payload))
}
```

As you can see here, validation.js and error.js are co-locating to registration endpoint would be great again.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/azyjwc3fw095rx4tstuq.png)

### Central error handling

It's time to reveal the core technique of this article that is centralized error handling in express.js application.

> Define error-handling middleware functions in the same way as other middleware functions, except error-handling functions have four arguments instead of three: __(err, req, res, next)__ 

we should define an error-handling middleware last, after other app.use() and routes calls. 

```javascript
app.use("/api", userRegistrationRouter);

app.use(errorHandler);
```

__how it works__

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/rr43hctw9ezrtm3cef01.jpeg)

In general, if error occur in synchronous code inside route handlers and middleware require no extra work. If synchronous code throws an error, then Express will catch and process it. 

The errors returned from asynchronous functions invoked by route handlers and middleware, you must pass them to the __next(error)__ function, where Express will catch and process them.

Like below we need to throw the error or pass the error to express middleware

_controller/registration.js_

```javascript
import { userRegistrationSchema } from "./validation";
import { createError, sendJson, ApplicationError } from "../../lib/api";
import { Errors } from "./error";

export async function validateUserRegistration(req, res, next) {
  try {
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

```

_validationBusinessRule_ we synchronously throwing error hence we need not to call like _next(error)_ and _validateUserRegistration_ asynchronously we are catching the error so pass like next(error) to catch the express middleware.

Here is our __centralized error middleware__ looks like

_lib/errorHandler.js_
```javascript
import { sendResponse, formatError, CommonError } from "../lib/api";

export function errorHandler(err, req, res, next) {
    const { analytics = {} } = err.meta || {};
  // logging for analytics
  console.log({ analytics });
  
  if (err instanceof ApplicationError) {
    const code = err.statusCode || 500
    return res.status(code).json(formatError(err))
  }

  if (err instanceof Error) {
    const newError = createError(err)
    const code = newError.statusCode || 500
    return res.status(code).json(formatError(newError))
  }
  
  const unknownError = new ApplicationError(CommonError.UNKNOWN_ERROR)

  return sendResponse(res, unknownError, statusCode);
}

```

Most importantly, we did not handling errors in every middleware, All error handling moves to centralized error middleware with aim that we have great opportunities to cover other scenario easily such as  

1. Logging error details
2. Send details for analytics
3. Formatting the error for consist error schema

Finally to test our registration endpoint using cURL command like below 

```javascript
curl --location --request POST 'http://localhost:3000/api/user/registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'first_name=raja' \
--data-urlencode 'last_name=jaganathan' \
--data-urlencode 'password=qwerty1234' \
--data-urlencode 're_password=qwerty1234' \
--data-urlencode 'email=dummy@gmail.com' | python -mjson.tool
```
```json
{
    "error": {
        "name": "ApplicationError",
        "type": "APP_NAME",
        "code": "AUTH_WEAK_PASSWORD",
        "message": "The given password is easy to guess, provide strong password"
    },
    "success": false
}
```

That's it. Pretty neat right!!!

You can find the repo here 💌https://github.com/RajaJaganathan/express-error-handling

_Other useful repo_
[https://www.npmjs.com/package/http-errors](https://www.npmjs.com/package/http-errors)
[https://www.npmjs.com/package/celebrate](https://www.npmjs.com/package/celebrate)
[https://express-validator.github.io/docs/](https://express-validator.github.io/docs/)
[https://github.com/aofleejay/express-response-formatter/](https://github.com/aofleejay/express-response-formatter/)

Thanks for reading!

