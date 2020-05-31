import express from "express";
import bodyParser from "body-parser";

import { errorHandler } from "./middleware/errorHandler";
import { userRegistrationRouter } from "./route/userRegistration";

const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => res.send(`<h1>Error handling in express.js</h1>`));
app.use("/api", userRegistrationRouter);

app.use(errorHandler);

app.listen(port, () =>
  console.log(`Error handling app listening at http://localhost:${port}`)
);
