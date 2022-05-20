/**========================================================================
 *                           Libraries
 *========================================================================**/
import got from "got";
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
export async function authenticationCheck(req, res, next) {
  // The x-nb-fingerprint is a value created by your frontend
  // it lets you know what unique device the request came from
  if (!req.headers["x-nb-fingerprint"]) {
    res.send("The request is not signed is set");
  }
  // the x-nb-token is the requests JWT Token and it will be
  // checked in the auth-service to confirm it belongs to a real user
  if (!req.headers["x-nb-token"]) {
    res.send("The request doesnt contain a token");
  }
  if (req.headers["x-nb-token"]) {
    //This is a request to the auth-service /check_token endpoint
    // the expected return should be the userId and a token.
    const result = await got
      .post({
        url: AUTH_ENDPOINT + "/check_token",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: req.headers["x-nb-token"],
          fingerprint: req.headers["x-nb-fingerprint"],
        }),
      })
      .json();
    //Once its return the userId is checked it exists
    if(Boolean(result.userId)){
    // the next function tells express to continue to the route
        next();
    } else {
    // if no users is found the user cant access the route function
        res.send("No user found for that token");
    }
  }
}
