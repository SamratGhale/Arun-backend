var fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User= {
    async add(db, data) {
        return await this.register(db, data);
    },
    async list(db) {
        return await db.query("select user_id, u.email, u.username, u.is_registered, u.is_admin, u.is_archived, phone, count(distinct(room_id)) as room_count , count(distinct(id)) app_count from room r left join application a on r.room_id = a.room  right join users u on u.user_id = r.seller group by seller;");
    },
    async findById(db,_id) {
        const res = await db.query(`select * from users where user_id = ${_id} ;`);
        if(res.length==0){
            throw {message: `couldn't find the user with id ${_id}`, code : 400};
        }
        return res[0];
    },

    async update(db, data, id, token) {

        const { username, email, phone} = data;

        const user = await this.validateToken(db, token);

        if(!user.is_admin && (user.user_id == id)){
            throw {message: "Only admin can update different users", code: 404};
        }

        try {
            const res = await db.query(`update users set username = '${username}', is_admin = is_admin, email = '${email}', phone='${phone}' where user_id = ${id};`);
            return { message: 'user updated successfully ' }
        } catch (err) {
            console.log(err);
            throw { message: err.sqlMessage, code: 400 };
        }
    },

    async changeProfilePic(db, token , data) {
        const {image} = data;
        const user = await this.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }
        try{
            const dir =    `./profile_pics/${user.user_id}`;

            if(!fs.existsSync(dir)){
                fs.mkdirSync(dir, {recursive: true});
            }
            else{
                fs.readdirSync(dir).forEach(f => fs.rmSync(`${dir}/${f}`)); 
            }
            const ext = image.hapi.filename.split('.').at(-1);
            if (!['img', 'jpg', 'png', 'gif'].includes(ext)) {
                throw { message: "Image format not valid please try again!", code: 404 };
            }
            fs.writeFileSync(`${dir}/${image.hapi.filename}`, image._data, err => {
                throw { message: "couldn't upload image please try again", code: 404 };
            })
            return {message: "profile picture change successfully"}
        }
        catch(err){
            console.log(err)
            throw {message: "Couldn't add profile pic ", code :404};
        }
    },

    async validateToken(db,token) {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const user = await db.query(`select * from users where email = '${decoded.email}' and is_registered = true and is_archived = false ;`);
        console.log(user);
        if (user.length == 0) {
            throw { message: "Token not correct please login and try again!", code: 400 };
        }
        user[0].profile_pic = fs.readdirSync(`./profile_pics/${user[0].user_id}`);
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
        const user = await db.query(`update users set is_archived =  !is_archived where user_id = '${id}';`);
        if(user.changedRows > 0){
            return {message: 'user archived successfully'}
        }
        else{
            return {message: 'user already archived'}
        }
    },
    async approve(db, id) {
        const user = await db.query(`update users set is_registered = !is_registered where user_id = '${id}';`);
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
    update:        (req) => {
        const token =
            req.params.token || req.headers.access_token;
        return User.update(req.app.db,req.payload, req.params.id, token)
    },
    changePassword:(req) => User.changePassword(req.app.db,req),
    auth:          (req) => {
        const token =
            req.params.token || req.headers.access_token || req.cookies.access_token;
        return User.validateToken(req.app.db, token)
    },
    changeProfilePic:          (req) => {
        const token =
            req.params.token || req.headers.access_token || req.cookies.access_token;
        return User.changeProfilePic(req.app.db, token, req.payload)
    },
};