const controllers = require('./application.controllers')
const validators = require('./application.validators')


const routes = {
    list: {
        method: 'GET',
        path: '',
        description: 'List all seller',
    },
    approve: {
        method: 'POST',
        path: '/approve/{id}',
        description: 'approve a room',
    },
    archive: {
        method: 'DELETE',
        path: '/{id}',
        description: 'archive an application',
    },
    register: {
        method: 'POST',
        path: '/register',
        description: 'Book room',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        }
    },
  }

function register(app) {
    app.register({
        name: 'application',
        routes,
        validators,
        controllers,
    });
}
module.exports = register;