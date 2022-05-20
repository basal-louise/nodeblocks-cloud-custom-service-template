import path from 'path'
import express from 'express'
import got from 'got'
const app = express()

import * as utilities from './utilities.js'
import * as middleware from './middleware.js'

// the computer port that
const PORT = utilities.getEnvironmentVariable("PORT", 3000);
//The url of the user service
const USER_ENDPOINT = utilities.getEnvironmentVariable("USER_ENDPOINT", "http://localhost:3000");
//the url of the authentication service
const AUTH_ENDPOINT = utilities.getEnvironmentVariable("AUTH_ENDPOINT", "http://localhost:3001");

app.use(middleware.authenticationCheck);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join('./', "public")));

//api document
//https://api.artic.edu/docs/#quick-start
//https://iiif.io/api/image/2.0/#size

app.get("/ping", (req, res) => {
  //return some basic information to make sure the server is running
  res.send({ version: '1.0.0', name: 'service-name' });
});

app.get("/users", (req, res) => {
  //get users
  res.send("user");
});

app.get("/users/:id", (req, res) => {
  //get single user
  res.send("Hello World!");
});

//Get Artworks
//https://api.artic.edu/api/v1/artworks/75644?fields=id,title,image_id,alt_image_ids
app.get("/artwork", async (req, appResp) => {
  //List all artwork
  const allArtworkUrl = `https://api.artic.edu/api/v1/artworks`;
  //Fetch a list of all the artwork
  const { data } = await got.get(allArtworkUrl);
  appResp.send(data);
});

app.get("/artwork/:id", async (req, appResp) => {
  //Single Artwork
  // Pass the requested url to the 3rd party api
  // for example: http://localhost:3000/artwork/75644 -> req.params.id would equal 75644
  const singleArtworkUrl = `https://api.artic.edu/api/v1/artworks/${req.params.id}?fields=id,title,image_id,alt_image_ids`;
  // Request the single artwork JSON
  const { data } = await got.get(singleArtworkUrl);
  appResp.send(data);
});

app.listen(PORT, () => {
  utilities.log(`Example app listening on port ${PORT}`);
});
