const controllers = require('./room.controllers')
const validators = require('./room.validators')

const routes = {
    register: {
        method: 'POST',
        path: '/register',
        description: 'Add seller',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        }
    }
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