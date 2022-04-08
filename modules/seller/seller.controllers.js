const SellerModel = require('./seller.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Seller = {
    async add(data) {
        return await this.register(data);
    },
    async list() {
        return await SellerModel.find();
    },
    async getById(_id) {
        return SellerModel.findOne({ _id, is_archived: false });
    },

    async update(request) {
        const res = await SellerModel.findOneAndUpdate({ _id: request.params.id }, request.payload);
        return res;
    },

    async validateToken(token) {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await SellerModel.findOne({ email: decoded.email, registered: true, is_archived: false });
        if (!user) {
            throw { message: "Token not correct please login and try again!", code: 400 };
        }
        return { user };
    },
    async auth(request) {
        try {
            const token =
                request.params.token || request.headers.access_token || request.cookies.access_token;
            const { user } = await Seller.validateToken(token);

            delete user.password;
            return {
                user,
            };
        } catch (e) {
            throw Error(`ERROR: ${e}`);
        }
    },
    async changePassword(req) {
        token = req.headers.access_token;
        const { oldPassword, newPassword } = req.payload;
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await SellerModel.findOne({ email: decoded.email });
        if (user) {
            try {
                //const res = await this.login({email: user.email, password: oldPassword});
                const salt = parseInt(process.env.TOKEN_KEY);
                encrypted_password = await bcrypt.hash(newPassword, salt);
                const done = await SellerModel.findOneAndUpdate({ email: decoded.email }, { password: encrypted_password });
                if (done) {
                    return { message: "Password change successfully" };
                }
            } catch (err) {
                throw err;
            }
        } else {
            throw { message: "Token not correct please login and try again!", code: 400 };
        }
    },
    async findById(id) {
        return await SellerModel.findOne({ _id: id, is_archived: false }).select('-password');
    },

    async register(data) {
        var { username, email, password, is_admin } = data;

        if (!(username && email && password)) {
            throw "All input is required";
        }

        const u = await SellerModel.findOne({ email: email, username: username });
        if (u) {
            throw { message: "email or username already exists!", code: 400 };
        }
        const salt = process.env.TOKEN_KEY;
        encrypted_password = await bcrypt.hash(password, parseInt(salt));

        const user = await SellerModel.create({
            email: email.toLowerCase(),
            password: encrypted_password,
            username: username,
            registered: false,
            is_archived: false,
            is_admin: is_admin
        });
        const token = jwt.sign(
            { user_id: user._id, email,  registered: user.registered },
            salt
        );
        user.token = token;
        return user;
    },
    async login(data) {
        try {
            const { email, password } = data;
            if (!(email && password)) {
                throw "All input is required";
            }
            var user = await SellerModel.findOne({ email });
            if (user) {
                if (await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign(
                        { user_id: user._id, email},
                        process.env.TOKEN_KEY,
                    );
                    return { user, token };
                }
                else {
                    throw { message: "Invalid password", code: 400 };
                }
            }
            else {
                throw { message: "Invalid Email or password", code: 400 };
            }

        } catch (err) {
            throw err;
        }
    },

    async archive(id) {
        return SellerModel.findOneAndUpdate({ _id: id, is_archived: false }, { is_archived: true });
    },
    async approve(id) {
        return SellerModel.findOneAndUpdate({ _id: id, registered: true }, { is_archived: true });
    },
}

module.exports = {
    Seller,
    add: (req) => Seller.add(req.payload),
    list: () => Seller.list(),
    getById: (req) => Seller.getById(req.params.id),
    register: (req) => Seller.register(req.payload),
    login: (req) => Seller.login(req.payload),
    archive: (req) => Seller.archive(req.params.id),
    findById: (req) => Seller.findById(req.params.id),
    validateToken: (req) => Seller.validateToken(req.params.token),
    update: (req) => Seller.update(req),
    changePassword: (req) => Seller.changePassword(req),
    auth: (req) => Seller.auth(req),
};