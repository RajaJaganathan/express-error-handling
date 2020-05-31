import express from "express";

import {
  validateUserRegistration,
  postRegistration,
} from "../controller/registration";

const userRegistrationRouter = express.Router();

userRegistrationRouter.post(
  "/user/registration",
  validateUserRegistration,
  postRegistration
);

export { userRegistrationRouter };
