/**========================================================================
 *                           Libraries
 *========================================================================**/
import _ from "lodash";
import { util, adapter, app as nodeblocks } from "@basaldev/backend-sdk";
import got from "got";

// Config
const { StatusCodes } = util;
const SERVICE_NAME = "NODEBLOCKS_CUSTOM_SERVICE";
const VERSION_INFO = "1.0.0";

const app = nodeblocks.createNodeblocksApp();
/**============================================
 *               Helper Functions
 *=============================================**/
import * as utilities from "./utilities.js";
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

const ROUTES = [
  {
    path: "/ping",
    method: "get",
    handler: pingRoute,
    validators: [],
  },
  {
    path: "/users/:id",
    method: "get",
    handler: getUserRoute,
    validators: [],
  },
  {
    path: "/artwork",
    method: "get",
    handler: getAllArtwork,
    validators: [],
  },
  {
    path: "/artwork/:id",
    method: "get",
    handler: getSingleArtwork,
    validators: [],
  },
];

app.use(
  util.createRoutes(ROUTES, {
    // 👇 this is required to run the service, should probably not be and
    // should be logOptions
    logOpts: {
      version: VERSION_INFO,
      name: SERVICE_NAME,
    },
  })
);

/**========================================================================
 *                           Route Handlers
 *========================================================================**/

function pingRoute(logger, { header, body, query, params, reqInfo, raw}) {
  // Ping is a standard route in most APIs
  // its main purpose is an easy way to check the service is running and return version information
  logger.info("Ping Handler", reqInfo);
  return {
    status: StatusCodes.OK,
    data: { version: VERSION_INFO, name: SERVICE_NAME },
  };
}
async function getUserRoute(logger, { headers, body, query, params, reqInfo, raw }) {
  try {
    const getUser = await got({
      headers,
      url: USER_ENDPOINT + `/users/${params.id}`
    }).json();
    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    return {
      status: StatusCodes.OK,
      data: getUser
    };
  } catch (error) {
    // All the Errors will be logged as well in the same location
    logger.error(error)
    // A simple error message will be returned to the requestor
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      data: error.message
    };
  }
}

async function getAllArtwork(logger, { header, body, query, params, reqInfo, raw}) {
  //this route requests all artwork from the API
  const allArtworkUrl = `https://api.artic.edu/api/v1/artworks`;
  // the request is wrapped in a try statement to check all errors that might happen
  try {
    const artwork = await got({
      url: allArtworkUrl,
    }).json();
    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    logger.info("Get All Artwork: ", artwork.data.length);
    return {
      status: StatusCodes.OK,
      data: artwork
    };
  } catch (error) {
    // All the Errors will be logged as well in the same location
    logger.error(error)
    // A simple error message will be returned to the requestor
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      data: err.message
    };
  }

}

async function getSingleArtwork(logger, { header, body, query, params, reqInfo, raw}) {
  // this route requests a single artwork from the API
  // the :id in the route is replaced with the last string in the request url
  // for example: http://localhost:3000/artwork/75644 -> :id AKA req.params.id would equal 75644
  const singleArtworkUrl = `https://api.artic.edu/api/v1/artworks/${params.id}?fields=id,title,image_id`;

  // the request is wrapped in a try statement to check all errors that might happen
  // and return then to the Nodeblock's Cloud Studio "View logs" page
  try {
    const { data } = await got({
      url: singleArtworkUrl,
    }).json();
    const artInformation = {
      id: data.id,
      title: data.title,
      images: {
        full: utilities.getImageUrl(data.image_id, "full"),
        small: utilities.getImageUrl(data.image_id, "small"),
      },
    };

    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    logger.info("singleArtworkUrl", artInformation);
    return {
      status: StatusCodes.OK,
      data: artInformation
    };
  } catch (err) {
    // All the Errors will be logged as well in the same location
    logger.info("🔥 Error", err);
    // A simple error message will be returned to the requestor
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      data: err.message
    };
  }
}



/**============================================
 *               Start the service
 *=============================================**/
// this function starts the app
app.listen(PORT, () => {
  // if you want to run a function every time its starts
  // put that function inside here
  utilities.log(`Example app listening on port ${PORT}`);
});
