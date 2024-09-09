import {
  route,
  BunyanLoggerFactory,
  app as backendSdkApp
} from '@basaldev/blocks-backend-sdk';

// get envvars
// you can access the configs from NBC via process.env as well
const port = process.env.PORT as unknown as number ?? 8080;
const env = process.env.NODE_ENV  as 'production' | 'development' ?? 'production';
  
// create logger
const logger = new BunyanLoggerFactory({
  env, 
  name: '<your service name>',
  port,
}).createLogger();
  
// create db connection
const todos = [
  { id: 1, content: 'entry 1' },
  { id: 2, content: 'entry 2' },
  { id: 3, content: 'entry 3' }
 ];
  
// create nodeblocks app
const app = backendSdkApp.createNodeblocksApp({});

// create routes
// https://docs.nodeblocks.dev/docs/how-tos/customization/customizing-adapters#adding-new-api-endpoints
const routes = [
  // List todos
  route.createRoute({
    method: 'get',
    path: '/todos',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Getting todos...');
      return {
        data: todos,
        status: 200
      }
    },
  }),
  // GET /todos/:todoId
  // POST /toods
  // PATCH /todos/:todoId
  // DELETE /todos/:todoId
];

const options = {
  adapterName: '',
  loggerFactory: new BunyanLoggerFactory({
    env, 
    name: '<your service name>',
    port,
  }),
}
  
// register routes
app.use(
  route.createRoutes(routes, options)
);

 // start service
logger.info('🔄 Starting…');
const server = app.listen(port, () => {
  logger.info(`🚀 Now listening on port ${port}`);
});
process.on('SIGINT', () => {
  logger.info('🚪 Shutting down…');
  process.exit();
});