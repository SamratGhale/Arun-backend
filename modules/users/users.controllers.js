const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User= {
    async add(db, data) {
        return await this.register(db, data);
    },
    async list(db) {
        return await db.query("select user_id, email, username, is_registered, is_admin, is_archived, phone from users;");
    },
    async findById(db,_id) {
        const res = await db.query(`select * from users where user_id = ${_id} ;`);
        if(res.length==0){
            throw {message: `couldn't find the user with id ${_id}`, code : 400};
        }
        return res[0];
    },

    async update(db, data, id) {

        const { username, email, phone, is_admin } = data;

        const p = await db.query(`select * from users where phone = '${phone}'`);
        if (p.length >0) {
            if(p[0].user_id != id){
                throw { message: "email or phone already exists!", code: 400 };
            }
        }
        const e = await db.query(`select * from users where email = '${email}'`);
        if (e.length >0) {
            if(e[0].user_id != id){
                throw { message: "email or phone already exists!", code: 400 };
            }
        }

        try {
            const res = await db.query(`update users set username = '${username}', is_admin = ${is_admin}, email = '${email}', phone='${phone}' where user_id = ${id};`);
            return { message: 'user updated successfully ' }
        } catch (err) {
            throw { message: "couldn't update user", code: 400 };
        }
    },

    async validateToken(db,token) {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const user = await db.query(`select * from users where email = '${decoded.email}' and is_registered = true and is_archived = false ;`);
        console.log(user);
        if (user.length == 0) {
            throw { message: "Token not correct please login and try again!", code: 400 };
        }
        return  user[0] ;
    },
    async changePassword(db,req) {
        token = req.headers.access_token;
        const { oldPassword, newPassword } = req.payload;
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await db.query(`select * from users where email = '${decoded.email}' ;`);
        if (user.length >0) {
            try {
                const salt = parseInt(process.env.TOKEN_KEY);
                encrypted_password = await bcrypt.hash(newPassword, salt);
                const done = await db.query(`update users set password = '${encrypted_password}' where email = '${user[0].email}' `);
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

    async register(db,data) {
        var { username, phone , email, password, is_admin } = data;

        if (!(username && phone && email && password)) {
            throw "All input is required";
        }

        const p = await db.query(`select * from users where phone = '${phone}';`);
        if (p.length >0) {
            throw { message: "email or phone already exists!", code: 400 };
        }
        const e = await db.query(`select * from users where email = '${email}';`);
        if (e.length >0) {
            throw { message: "email or phone already exists!", code: 400 };
        }

        const salt = process.env.TOKEN_KEY;
        encrypted_password = await bcrypt.hash(password, parseInt(salt));

        const query = `insert into users(username, phone, email,password,  is_admin) values('${username}', '${phone}','${email}', '${encrypted_password}', ${is_admin} );`;
        
        const res = await db.query(query);
        const user = await db.query(`select * from users where email = '${email}'`)

        const token = jwt.sign(
            { user_id: user[0]._id, email, registered: user[0].is_registered},
            salt
        );
        user[0].token = token;
        return user[0];
    },
    async login(db, data) {
        try {
            const { email, password } = data;
            if (!(email && password)) {
                throw "All input is required";
            }
            var user = await db.query(`select * from users where email = '${email}'`);
            if (user.length > 0) {
                if (await bcrypt.compare(password, user[0].password)) {
                    const token = jwt.sign(
                        { user_id: user._id, email },
                        process.env.TOKEN_KEY,
                    );
                    return { user: user[0], token };
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

    async archive(db, id) {
        const user = await db.query(`update users set is_archived =  true where user_id = '${id}';`);
        if(user.changedRows > 0){
            return {message: 'user archived successfully'}
        }
        else{
            return {message: 'user already archived'}
        }
    },
    async approve(db, id) {
        const user = await db.query(`update users set is_registered =  true where user_id = '${id}';`);
        if(user.changedRows > 0){
            return {message: 'user registered successfully'}
        }
        else{
            return {message: 'user already registered '}
        }
    },
}

module.exports = {
    User,
    add:           (req) => User.add(req.app.db, req.payload),
    list:          (req) => User.list(req.app.db),
    register:      (req) => User.register(req.app.db, req.payload),
    login:         (req) => User.login(req.app.db, req.payload),
    archive:       (req) => User.archive(req.app.db, req.params.id),
    approve:       (req) => User.approve(req.app.db, req.params.id),
    findById:      (req) => User.findById(req.app.db, req.params.id),
    validateToken: (req) => User.validateToken(req.app.db,req.params.token),
    update:        (req) => User.update(req.app.db,req.payload, req.params.id),
    changePassword:(req) => User.changePassword(req.app.db,req),
    auth:          (request) => {
        const token =
            request.params.token || request.headers.access_token || request.cookies.access_token;
        User.validateToken(req.db, token)
    },
};