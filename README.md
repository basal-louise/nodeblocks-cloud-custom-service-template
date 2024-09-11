<p align="center"><img width="300px" src="docs/logo.png" />
</p>
<h1 align="center">Nodeblocks Custom Service Template</h1>
<p align="center">A template for creating custom services in nodeblock cloud service</p>

---

## ✨ Features

This template provides the following features:

- Custom service template by using Nodeblocks backend SDK
- Built with [TypeScript](https://www.typescriptlang.org/)
- Run the service locally
- Example code with a simple todo feature

## ⚙️ Setup

### Install Node.js

This project requires Node.js to be installed on your machine. Install the latest [Node.js](https://nodejs.org/en/download/) 18+ LTS version directly, or through [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

### Prepare NPM Auth Token

This project depends on npm packages hosted in a private npm registry.
You will need a `npm auth token` in order to access these packages.
Please prepare this token using the steps below before continuing with setup.

1. Ask Nodeblocks team for a valid `npm auth token`.
1. Add the token as `BASALDEV_AUTH_TOKEN` to your local environment - `.zshrc` `.bashrc` etc

```bash
export BASALDEV_AUTH_TOKEN=__INSERT_YOUR_TOKEN_HERE__
```

### Create .env file

Create a `.env` file in the root of the project by copying the `.env.default` file. Update the values in the `.env` file with the actual values.

```bash
cp .env.default .env
```

### Install Dependencies

Run the following commands to install the required dependencies:

```bash
npm ci
```

The dependencies includes `@basaldev/blocks-backend-sdk` which make easy to create the custom services.

## 💡 Usage

### Development

Run the following command to start the application in development mode:

```bash
npm run dev
```

This command will start the application in development mode with hot reloading enabled. The application will automatically restart when you make changes to the code.

### Building the service for the release

Run the following command to build the code:

```bash
npm run build
```

You need to build the code before to convert TypeScript code to runnable JavaScript. The transpiled code will be generated in the `dist` folder.

### Running the service

Run the following command to start the application:

```bash
npm start
```

