import {
  route,
  BunyanLoggerFactory,
  app as backendSdkApp,
  util
} from '@basaldev/blocks-backend-sdk';

/**
 * Retrieve environment variables
 * 
 * You can access the configs from NBC via process.env as well
 */
const port = Number(process.env.PORT ?? 8080);
const env = process.env.NODE_ENV  as 'production' | 'development' ?? 'production';
  
/**
 * Create a logger
 */
const loggerFactory = new BunyanLoggerFactory({
  env, 
  name: '<your service name>',
  port,
})
const logger = loggerFactory.createLogger();

/**
 * Create a nodeblocks app
 */
const app = backendSdkApp.createNodeblocksApp({});

/**
 * Define routes
 * 
 * https://docs.nodeblocks.dev/docs/how-tos/customization/customizing-adapters#adding-new-api-endpoints
 */
const routes = [
  /**
   * Define a route to list entries
   * GET /todos
   * 
   * You can define other routes like:
   * - GET /todos/:todoId
   * - POST /todos
   * - PATCH /todos/:todoId
   * - DELETE /todos/:todoId
   */
  route.createRoute({
    method: 'get',
    path: '/todos',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Getting todos...');
      return {
        data: [
          { id: 1, content: 'entry 1' },
          { id: 2, content: 'entry 2' },
          { id: 3, content: 'entry 3' }
        ],
        status: util.StatusCodes.OK
      }
    },
  }),
];

/**
 * Register routes
 */
app.use(
  route.createRoutes(routes, {
    adapterName: 'NONE',
    loggerFactory
  })
);

/**
 * Start the server
 */
logger.info('🔄 Starting…');
app.listen(port, () => {
  logger.info(`🚀 Now listening on port ${port}`);
});

/**
 * Handle shutdown
 */
process.on('SIGINT', () => {
  logger.info('🚪 Shutting down…');
  process.exit();
});
