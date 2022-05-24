/**========================================================================
 *                           Libraries
 *========================================================================**/
import got from "got";
import { util } from "@basaldev/backend-sdk";
const { StatusCodes } = util;
/**============================================
 *              Helper Functions
 *=============================================**/
import * as utilities from "./utilities.js";
/**============================================
 *             Environment Variables
 *=============================================**/
const AUTH_ENDPOINT = utilities.getEnvironmentVariable(
  "AUTH_ENDPOINT",
  "http://localhost:3001"
);

// You can use this helper function to call any new environment variables and include a default value
// const YOUR_NEW_VAR = utilities.getEnvironmentVariable(
//   "YOUR_NEW_VAR",
//   "DEFAULT_VALUE_FOR_YOUR_NEW_VAR"
// );

/**======================================
 *             Authentication Check
 *====================================**/
export async function authenticationCheck(
  logger,
  { headers, body, query, params, reqInfo, raw }
) {
  // The x-nb-fingerprint is a value created by your frontend
  // it lets you know what unique device the request came from
  if (! headers["x-nb-fingerprint"]) {
    logger.info("The request is not signed is set")
    return StatusCodes.UNAUTHORIZED;
  }
  // the x-nb-token is the requests JWT Token and it will be
  // checked in the auth-service to confirm it belongs to a real user
  if (!headers["x-nb-token"]) {
    logger.info("The request does not contain a token")
    return StatusCodes.UNAUTHORIZED;
  }
  if (headers["x-nb-token"]) {
    logger.info("The request does not contain a token")
    //This is a request to the auth-service /check_token endpoint
    // the expected return should be the userId and a token.
    const result = await got
      .post({
        url: AUTH_ENDPOINT + "/check_token",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fingerprint: headers["x-nb-fingerprint"],
          token: headers["x-nb-token"],
        }),
      })
      .json();
    //Once its return the userId is checked it exists
    if (Boolean(result.userId)) {
      // the next function tells express to continue to the route
      return StatusCodes.OK
    } else {
      // if no users is found the user cant access the route function
      return StatusCodes.NOT_FOUND
    }
  }
}
