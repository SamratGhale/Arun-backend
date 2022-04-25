const controllers = require('./users.controllers');
const validators = require('./users.validators');

const routes = {
    list: {
        method: 'GET',
        path: '',
        description: 'List all seller',
    },
    login: {
        method: 'POST',
        path: '/login',
        description: 'Login using username and password',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
    auth: {method: 'GET', path: '/auth/{token}', description: 'Get the token data'},
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
    approve: {
        method: 'PUT',
        path: '/approve/{id}',
        description: 'approve seller',
        is_admin: true,
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
    findById: {
        method: 'GET',
        path: '/{id}',
        description: 'Get seller by id',
    },
    changeProfilePic: {
        method: 'POST',
        path: '/changeprofile',
        description: 'Add or change profile picture',
        uploadPayload: {
            output: 'stream',
            parse: true,
            multipart: true,
            allow: 'multipart/form-data',
        },
    },
};

function register(app) {
    app.register({
        name: 'users',
        routes,
        validators,
        controllers,
    });
}

module.exports = register;