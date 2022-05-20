import * as utilities from "./utilities.js";
import got from "got";

//the url of the authentication service
const AUTH_ENDPOINT = utilities.getEnvironmentVariable(
  "AUTH_ENDPOINT",
  "http://localhost:3001"
);

export async function authenticationCheck(req, res, next) {
  //Check the users token is valid
  if (!req.headers["x-nb-fingerprint"]) {
    res.send("The request is not signed is set");
  }
  if (!req.headers["x-nb-token"]) {
    res.send("The request doesnt contain a token");
  }
  if (req.headers["x-nb-token"]) {
    const body = {
      token: req.headers["x-nb-token"],
      fingerprint: req.headers["x-nb-fingerprint"],
    };
    const result = await got
      .post({
        url: AUTH_ENDPOINT + "/check_token",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      .json();
    if(Boolean(result.userId)){
        next();
    } else {
        res.send("No user found for that token");
    }
  }
}
