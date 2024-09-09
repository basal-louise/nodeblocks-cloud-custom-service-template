import {
  mongo,
  route,
  BunyanLoggerFactory,
  app as backendSdkApp
} from '@basaldev/blocks-backend-sdk';

interface Todo extends mongo.BaseMongoEntity {
  content: string;
}

// get envvars
// you can access the configs from NBC via process.env as well
const port = process.env.PORT as unknown as number ?? 8080;
const env = process.env.NODE_ENV  as 'production' | 'development' ?? 'production';
const dbUrl = process.env.DATABASE_URL as string;
  
// create logger
const logger = new BunyanLoggerFactory({
  env, 
  name: '<your service name>',
  port,
}).createLogger();
  
// create db connection
const createDbConnection = (dbUrl: string): Promise<mongo.Db> => {
  if (!dbUrl) {
    throw new Error('Database URL is missing');
  }
  const res = mongo.singletonMongoConn(dbUrl)
  return res
}
const db = createDbConnection(dbUrl);
const getTodoRepository = async () => new mongo.MongoRepository<Todo>(await db, 'todos', logger);
  
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
      const todoRepository = await getTodoRepository()
      const res = await todoRepository.find({});
      return {
        data: res,
        status: 200
      }
    },
  }),
  // POST /toods
  route.createRoute({
    method: 'post',
    path: '/todos',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Creating todo...');
      const todoRepository = await getTodoRepository()
      const base = new mongo.BaseMongoEntity()
      const { id } = await todoRepository.create({ ...base, content: context.body.content });
      const todo = await todoRepository.findOne(id);
      return {
        data: todo,
        status: 201
      }
    },
  }),
  // GET /todos/:todoId
  route.createRoute({
    method: 'get',
    path: '/todos/:todoId',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Getting todo...');
      const todoRepository = await getTodoRepository()
      const todo = await todoRepository.findOne(context.params.todoId);
      return {
        data: todo,
        status: 200
      }
    },
  }),
  // PATCH /todos/:todoId
  route.createRoute({
    method: 'patch',
    path: '/todos/:todoId',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Updating todo...');
      const todoRepository = await getTodoRepository()
      const { id } = await todoRepository.update(context.params.todoId, { content: context.body.content });
      const todo = await todoRepository.findOne(id);
      return {
        data: todo,
        status: 200
      }
    },
  }),
  // DELETE /todos/:todoId
  route.createRoute({
    method: 'delete',
    path: '/todos/:todoId',
    validators: [],
    handler: async (logger, context) => {
      logger.info('Deleting todo...');
      const todoRepository = await getTodoRepository()
      const deleted = await todoRepository.delete(context.params.todoId);
      return {
        data: { deleted },
        status: 200
      }
    },
  }),
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