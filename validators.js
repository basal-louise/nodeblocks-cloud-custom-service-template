/**========================================================================
 *                           Libraries
 *========================================================================**/
import got from "got";
import { util } from "@basaldev/backend-sdk";
const { StatusCodes } = util;

/**======================================
 *             Authentication Check
 *====================================**/
export async function authenticationCheck(
  logger,
  { headers, body, query, params, reqInfo, raw }
) {
  // Here is an example validator
  // validators can be used to protect routes with additional requirements
  if (headers["x-nb-token"]) {
    logger.info("The request contains a token");
    //-----------------------------------------
    // EXAMPLE: Check the auth service to see if the user exists
    //-----------------------------------------
    // const result = await got
    //   .post({
    //     url: AUTH_ENDPOINT + "/check_token",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       fingerprint: headers["x-nb-fingerprint"],
    //       token: headers["x-nb-token"],
    //     }),
    //   })
    //   .json();
    return StatusCodes.OK;
  } else {
    // if no users is found the user cant access the route function
    return StatusCodes.UNAUTHORIZED;
  }
}
