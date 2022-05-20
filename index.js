/**========================================================================
 *                           Libraries
 *========================================================================**/
import express from "express";
import got from "got";
const app = express();
/**============================================
 *               Helper Functions
 *=============================================**/
import * as utilities from "./utilities.js";
import * as middleware from "./middleware.js";
/**============================================
 *               Environment Variables
 *=============================================**/
// the port the service will run on, node-block default is 8081
const PORT = utilities.getEnvironmentVariable("PORT", 8081);
//The url of the user service
const USER_ENDPOINT = utilities.getEnvironmentVariable(
  "USER_ENDPOINT",
  "http://localhost:3000"
);
// You can use this helper function to call any new environment variables and include a default value
// const YOUR_NEW_VAR = utilities.getEnvironmentVariable(
//   "YOUR_NEW_VAR",
//   "DEFAULT_VALUE_FOR_YOUR_NEW_VAR"
// );

/**========================================================================
 *                           Express Middleware
 *========================================================================**/
// Documentation: https://expressjs.com/en/guide/using-middleware.html
app.use(express.json());
// express.json() is a built-in middleware function in Express. 
// This method is used to parse the incoming requests with JSON payloads and is based upon the bodyparser.
app.use(express.urlencoded({ extended: false }));
// The express.urlencoded() function is a built-in middleware function in Express. 
// It parses incoming requests with urlencoded payloads and is based on body-parser.

/**========================================================================
 *                           Routes
 *========================================================================**/
app.get("/ping", (req, res) => {
  // Ping is a standard route in most APIs
  // its main purpose is an easy way to check the service is running and return version information
  res.send({ version: "1.0.0", name: "service-name" });
});

// This route includes a authenticationCheck middleware that runs before the routes function
// this authenticationCheck will if the user is allowed to access this route and the data on it
app.get("/users/profile", middleware.authenticationCheck, (req, res) => {
  //get current users information
  res.send("user");
});

/**============================================
 *               External APIs
 *=============================================**/
// Documentation: https://api.artic.edu/docs/#quick-start
//This service example uses the Art Institute of Chicago's API as an example of a 3rd party api you can call

app.get("/artwork", async (req, appResp) => {
  //this route requests all artwork from the API
  const allArtworkUrl = `https://api.artic.edu/api/v1/artworks`;
  // the request is wrapped in a try statement to check all errors that might happen
  try {
    const data = await got({
      url: allArtworkUrl,
    }).json();
    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    utilities.log("allArtworkUrl", data);
    appResp.send(data);
  } catch (err) {
    // All the Errors will be logged as well in the same location
    utilities.log("🔥 Error", err);
    // A simple error message will be returned to the requestor
    appResp.send(err.message);
  }
});

app.get("/artwork/:id", async (req, appResp) => {
  //this route requests a single artwork from the API
  // the :id in the route is replaced with the last string in the request url
  // for example: http://localhost:3000/artwork/75644 -> :id AKA req.params.id would equal 75644
  const singleArtworkUrl = `https://api.artic.edu/api/v1/artworks/${req.params.id}?fields=id,title,image_id,alt_image_ids`;

  // the request is wrapped in a try statement to check all errors that might happen
  try {
    const data = await got({
      url: singleArtworkUrl,
    }).json();
    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    utilities.log("singleArtworkUrl", data);
    appResp.send(data);
  } catch (err) {
    // All the Errors will be logged as well in the same location
    utilities.log("🔥 Error", err);
    // A simple error message will be returned to the requestor
    appResp.send(err.message);
  }
});

/**============================================
 *               Start the service
 *=============================================**/
// this function is what starts the app
app.listen(PORT, () => {
  // if you want to run a function every time its starts
  // put that function inside here
  utilities.log(`Example app listening on port ${PORT}`);
});
