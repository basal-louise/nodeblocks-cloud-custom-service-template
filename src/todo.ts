import assert from 'assert';
import {
  mongo,
  route,
  BunyanLoggerFactory,
  app as backendSdkApp,
  util,
  NBError,
  BaseErrorCode,
} from '@basaldev/blocks-backend-sdk';

interface TodoSchema {
  content: string;
}

export class TodoEntity extends mongo.BaseMongoEntity implements TodoSchema {
  public content: string;
  constructor(entity: TodoSchema) {
    super();
    this.content = entity.content;
  }
  validate() {
    const errors = [];
    if (typeof this.content !== 'string') {
      errors.push('field:content should be a string');
    }
    return errors;
  }
}

type TodoRepository = mongo.MongoRepository<TodoEntity>;

/**
 * A validator to check todo request body
 */
function checkTodoRequestBody() {
  return async (logger, context) => {
    try {
      const errors = new TodoEntity(context.body).validate();
      if (errors.length === 0) {
        return util.StatusCodes.OK;
      }
      const errorMsg = errors.join(', ');
      throw new NBError({
        code: BaseErrorCode.schemaMismatchError,
        httpCode: util.StatusCodes.BAD_REQUEST,
        message: `Request body is invalid: ${errorMsg}`,
      });
    } catch (error) {
      if (error instanceof NBError) {
        throw error;
      }
      throw new NBError({
        code: BaseErrorCode.internalServerError,
        httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to check todo request body',
        details: [error],
      });
    }
  }
}

/**
 * A validator to check if a todo exists
 * 
 */
function checkTodoExist(todoRepository: TodoRepository) {
  return async (logger, context) => {
    try {
      const todo = await todoRepository.findOne(context.params.todoId);
      if (todo) {
        return util.StatusCodes.OK;
      }
      throw new NBError({
        code: BaseErrorCode.notFound,
        httpCode: util.StatusCodes.NOT_FOUND,
        message: 'Todo not found',
      });
    } catch (error) {
      if (error instanceof NBError) {
        throw error;
      }
      throw new NBError({
        code: BaseErrorCode.internalServerError,
        httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to check if todo exists',
        details: [error],
      });
    }
  }
}

/**
 * Define routes
 * 
 * https://docs.nodeblocks.dev/docs/how-tos/customization/customizing-adapters#adding-new-api-endpoints
 */
function createRoutes(todoRepository: TodoRepository) {
  /**
   * Define a route to list entries
   * GET /todos
   */
  const getTodos = route.createRoute({
    method: 'get',
    path: '/todos',
    validators: [],
    handler: async (logger, context) => {
      try {
        logger.info('Getting todos...');
        const res = await todoRepository.find({});
        return {
          data: res,
          status: util.StatusCodes.OK
        }
      } catch (error) {
        throw new NBError({
          code: BaseErrorCode.internalServerError,
          httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to get todos',
          details: [error],
        });
      }
    },
  });

  /**
   * Define a route to create an entry
   * POST /todos
   */
  const createTodo = route.createRoute({
    method: 'post',
    path: '/todos',
    validators: [checkTodoRequestBody()],
    handler: async (logger, context) => {
      try {
        logger.info('Creating todo...');
        const content = context.body.content as string;
        const entity = new TodoEntity({ content });
        const { id } = await todoRepository.create(entity);
        const todo = await todoRepository.findOne(id);
        return {
          data: todo,
          status: util.StatusCodes.CREATED
        }
      } catch (error) {
        throw new NBError({
          code: BaseErrorCode.internalServerError,
          httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to create a todo',
          details: [error],
        });
      }
    },
  });

  /**
   * Define a route to get an entry
   * GET /todos/:todoId
   */
  const getTodo = route.createRoute({
    method: 'get',
    path: '/todos/:todoId',
    validators: [checkTodoExist(todoRepository)],
    handler: async (logger, context) => {
      try {
        logger.info('Getting todo by id...');
        const todo = await todoRepository.findOne(context.params.todoId);
        return {
          data: todo,
          status: util.StatusCodes.OK
        }
      } catch (error) {
        throw new NBError({
          code: BaseErrorCode.internalServerError,
          httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to get todo by id',
          details: [error],
        });
      }
    },
  });

  /**
   * Define a route to update an entry
   * PATCH /todos/:todoId
   */
  const updateTodo = route.createRoute({
    method: 'patch',
    path: '/todos/:todoId',
    validators: [
      checkTodoExist(todoRepository),
      checkTodoRequestBody()
    ],
    handler: async (logger, context) => {
      try {
        logger.info('Updating todo by id...');
        const { id } = await todoRepository.update(context.params.todoId, { content: context.body.content });
        const todo = await todoRepository.findOne(id);
        return {
          data: todo,
          status: util.StatusCodes.OK
        }
      } catch (error) {
        throw new NBError({
          code: BaseErrorCode.internalServerError,
          httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to update todo by id',
          details: [error],
        });
      }
    },
  });

  /**
   * Define a route to delete an entry
   * DELETE /todos/:todoId
   */
  const deleteTodo = route.createRoute({
    method: 'delete',
    path: '/todos/:todoId',
    validators: [checkTodoExist(todoRepository)],
    handler: async (logger, context) => {
      try {
        logger.info('Deleting todo by id...');
        const deleted = await todoRepository.delete(context.params.todoId);
        return {
          data: { deleted },
          status: util.StatusCodes.OK
        }
      } catch (error) {
        throw new NBError({
          code: BaseErrorCode.internalServerError,
          httpCode: util.StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to delete todo by id',
          details: [error],
        });
      }
    },
  });
  
  return [
    getTodos,
    createTodo,
    getTodo,
    updateTodo,
    deleteTodo,
  ];
}

/**
 * Entry point
 */
async function main() {
  /**
   * Retrieve environment variables
   * 
   * You can access the configs from NBC via process.env as well
   */
  assert(process.env.DATABASE_URL, 'DATABASE_URL is required');
  const port = Number(process.env.PORT ?? 8080);
  const env = process.env.NODE_ENV  as 'production' | 'development' ?? 'production';
  const dbUrl = process.env.DATABASE_URL as string;

  /**
   * Create a logger
   */
  const loggerFactory = new BunyanLoggerFactory({
    env, 
    name: 'TODO_APP',
    port,
  });
  const baseLogger = loggerFactory.createLogger();

  /**
   * Create a database connection
   */
  const db = await mongo.singletonMongoConn(dbUrl);
  const todoRepository = new mongo.MongoRepository<TodoEntity>(db, 'todos', baseLogger);
    
  /**
   * Create a nodeblocks app
   */
  const app = backendSdkApp.createNodeblocksApp({});

  /**
   * Create routes
   */
  const routes = createRoutes(todoRepository);

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
  baseLogger.info('🔄 Starting…');
  const server = app.listen(port, () => {
    baseLogger.info(`🚀 Now listening on port ${port}`);
  });
  process.on('SIGINT', () => {
    baseLogger.info('🚪 Shutting down…');
    process.exit();
  });
  return server;
}

void main();