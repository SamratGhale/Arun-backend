const Hapi = require('@hapi/hapi');
const inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const HapiMysql = require('hapi-plugin-mysql')
const app = require('./app');
const modules = require('./modules/routes');

require('dotenv').config();

function registerFeats() {
  Object.keys(modules).forEach((mdl) => {
    modules[mdl](app);
  });
}


const port = 4001;
const server = new Hapi.Server({
  port,
  router: {
    stripTrailingSlash: true,
  },
  routes: {
    cors:
    {
      origin:["*"],
      additionalHeaders: ['cache-control', 'x-requested-with', 'X_AUTH_TOKEN','access_token']
    },
    validate: {
      failAction: async (request, h, err) => {
          // In prod, log a limited error message and throw the default Bad Request error.
          return h
            .response({
              statusCode: 400,
              error: 'Bad Request',
              message: err.message,
            })
            .code(400)
            .takeover();
        }
        // During development, log and respond with the full error.
    },
  },
});
app.connectServer(server)

const swaggerOptions = {
  info: {
    title: "room API",
    version: process.env.npm_package_version,
    description: process.env.npm_package_description,
  },
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'access_token',
      in: 'header',
    },
  },
  security: [{ jwt: [] }],
  grouping: 'tags',
};

/**
 * Starts the server.
 */
async function startServer() {
  registerFeats();
  await server.register([
    inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    {
      plugin: HapiMysql,
      options: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      }
    }
  ]);

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: (request, h) => {
      const { param } = request.params;
      if (param.includes('.')) {
        return h.file(param);
      }
      return h.file('index.html');
    },
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

let isStopping = false;
async function shutDown() {
  if (!isStopping) {
    isStopping = true;
    const lapse = process.env.STOP_SERVER_WAIT_SECONDS ? process.env.STOP_SERVER_WAIT_SECONDS : 5;
    await server.stop({
      timeout: lapse * 1000,
    });
  }
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

async function start() {
  await startServer();
}

start();