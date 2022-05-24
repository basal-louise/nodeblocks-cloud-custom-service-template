/**========================================================================
 *                           Libraries
 *========================================================================**/
import _ from "lodash";
import { util, app as nodeblocks, mongo } from "@basaldev/backend-sdk";
import got from "got";

// Config
const { StatusCodes } = util;
const SERVICE_NAME = "NODEBLOCKS_CUSTOM_SERVICE";
const VERSION_INFO = "1.0.0";

/**============================================
 *               Helper Functions
 *=============================================**/
// get an Environment Variable and if its not set return the default value
export function getEnvironmentVariable(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  assert(value, `${name} not set`);
  return value;
}

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
// const MONGO_DB = utilities.getEnvironmentVariable(
//   "MONGO_DB",
//   "DEFAULT_MONGO_DB_CONNECTION_STRING"
// );

const app = nodeblocks.createNodeblocksApp();
//const databaseClient = mongo.mongoClient(MONGO_DB)
/**============================================
 *               validators
 *=============================================**/
import * as validators from "./validators.js";
/**============================================
 *               Routes
 *=============================================**/
// this arraay stores all the routes for your custom service
// you can
const ROUTES = [
  {
    path: "/ping",
    method: "get",
    handler: pingRoute,
    validators: [],
  },
  {
    path: "/purchase",
    //method can be  'get' | 'post' | 'delete' | 'patch'
    method: "post",
    handler: createArtworkPurchase,
    //This route includes a validator, easy to use function to help protect routes
    // you can have as many as you like
    // authenticationCheck is in validators.js
    validators: [validators.authenticationCheck],
  },
  {
    path: "/artwork",
    method: "get",
    handler: getAllArtwork,
    validators: [],
  },
  {
    //you can include request params like :id in the line below
    path: "/artwork/:id",
    method: "get",
    handler: getSingleArtwork,
    validators: [],
  },
];

app.use(
  util.createRoutes(ROUTES, {
    // 👇 this is required to run the service, should probably not be or
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

function pingRoute(logger, { headers, body, query, params, reqInfo, raw }) {
  // Ping is a standard route in most APIs
  // its main purpose is an easy way to check the service is running and return version information
  logger.info("Ping Handler", reqInfo);
  return {
    //Status is the response code and the StatusCodes util includes a bunch of useful codes
    // For Example:
    // StatusCodes.OK = 200
    // StatusCodes.INTERNAL_SERVER_ERROR = 500
    // StatusCodes.INTERNAL_SERVER_ERROR = 500
    status: StatusCodes.OK,
    data: { version: VERSION_INFO, name: SERVICE_NAME },
  };
}

async function createArtworkPurchase(
  logger,
  { headers, body, query, params, reqInfo, raw }
) {
  logger("createArtworkPurchase", body);
  // Everything is this route is protected by the validator
  // so online autherized people can for example create database options
  //-----------------------------------------
  // EXAMPLE: create a item in the mongo db
  //-----------------------------------------
  // databaseClient.purchases.insertOne({
  //   item: body.item,
  //   price: body.price,
  //   quantity: body.quantity,
  //   date: new Date(),
  // });
  //-----------------------------------------
  return {
    status: StatusCodes.OK,
    data: body,
  };
}

async function getAllArtwork(
  logger,
  { headers, body, query, params, reqInfo, raw }
) {
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
      data: artwork,
    };
  } catch (error) {
    // All the Errors will be logged as well in the same location
    logger.error(error);
    // A simple error message will be returned to the requestor
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      data: err.message,
    };
  }
}

async function getSingleArtwork(
  logger,
  { headers, body, query, params, reqInfo, raw }
) {
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
        full: `https://www.artic.edu/iiif/2/data.image_id/full/848,/0/default.jpg`,
        small: `https://www.artic.edu/iiif/2/data.image_id/full/150,/0/default.jpg`,
      },
    };

    // Onces the data is found, its "logged" to the console
    // Logs can be viewed by clicking the Three dots and then "View Logs" in Nodeblocks Cloud Studio
    logger.info("singleArtworkUrl", artInformation);
    return {
      status: StatusCodes.OK,
      data: artInformation,
    };
  } catch (err) {
    // All the Errors will be logged as well in the same location
    logger.info("🔥 Error", err);
    // A simple error message will be returned to the requestor
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      data: err.message,
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
