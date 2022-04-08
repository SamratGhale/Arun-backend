const controllers = require('./seller.controllers');
const validators = require('./seller.validators');

const routes = {
    list: {
        method: 'GET',
        path: '',
        description: 'List all seller',
    },
    login: {
        method: 'POST',
        path: '',
        description: 'Login using username and password',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
    auth: ['GET', '/auth/{token}', 'Get the token data'],
    register: {
        method: 'POST',
        path: '/register',
        description: 'Add seller',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
    changePassword: {
        method: 'PUT',
        path: '/changepassword/{token}',
        description: 'Change Seller password',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
    archive: {
        method: 'DELETE',
        path: '/{id}',
        description: 'Archive seller',
    },
    update: {
        method: 'POST',
        path: '/{id}/update',
        description: 'Update seller',
    },
    findById: {
        method: 'GET',
        path: '/{id}',
        description: 'Get seller by id',
    },
};

function register(app) {
    app.register({
        name: 'seller',
        routes,
        validators,
        controllers,
    });
}

module.exports = register;