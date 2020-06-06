app.post("api/user/registration", validateRegistration, postRegistration);

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

function validate(input, validationRule) {
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

function validateRegistrationRequest(req, res, next) {
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

function validateBusinessRegistration(req, res, next) {
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
    return res.status(400).json({ businessErrors: businessErrors });
  }

  next();
}

function postRegistration(req, res, next) {
  res.json({ message: "Registration is successful" });
}
