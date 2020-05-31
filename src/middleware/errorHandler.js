import { sendJson } from "../lib/api";

export function errorHandler(err, req, res, next) {
  console.error("Central Error ::" + JSON.stringify(err, null, 2));

  const { statusCode = 500 } = err || {};
  const { analytics = {} } = err.meta || {};
  // send for analytics
  console.log({ analytics });

  return sendJson(res, err, statusCode);
}
