const controllers = require('./room.controllers')
const validators = require('./room.validators')

const routes = {
    list: {
        method: 'GET',
        path: '',
        description: 'List all seller',
    },
    getById: {
        method: 'GET',
        path: '/{id}',
        description: 'Get seller by id',
    },
    register: {
        method: 'POST',
        path: '/register',
        description: 'Add seller',
        uploadPayload: {
            maxBytes: 1000 * 1000 * 100,
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        }
    },
    archive: {
        method: 'DELETE',
        path: '/{id}',
        description: 'Archive seller',
    },
    applications: {
        method: 'GET',
        path: '/applications',
        description: 'Get all applications by me',
    },
    available: {
        method: 'PUT',
        path: '/available/{id}',
        description: 'Change availability seller',
    },
    update: {
        method: 'POST',
        path: '/{id}/update',
        description: 'Update seller',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
}

function register(app) {
    app.register({
        name: 'room',
        routes,
        validators,
        controllers,
    });
}
module.exports = register;