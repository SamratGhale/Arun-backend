var fs = require('fs')
const User = require("../users/users.controllers");
const Room = {
    async list(db) {
        const res = await db.query('select r.description,u.user_id, u.username,u.phone,r.room_count, r.is_available, r.is_verified, r.is_archived, r.price, r.location, r.room_id ,count(id) as app_count from room r left outer join application a on r.room_id = a.room inner join users u on u.user_id = r.seller  group by r.room_id ');
        console.log(res)
        res.forEach((room, i) => {
            res[i].files = fs.readdirSync(`./room_images/${room.room_id}`);
        })
        return res;
    },

    async applications(db,token) {
        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }
        const res = await db.query(`select * from application where applicant = ${user.user_id} `);
        return res;
    },
    async getById(db, id, token) {
        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }

        const poster = await db.query(`select * from room r inner join users u on r.seller = u.user_id where room_id = ${id};`);

        if (poster.length == 0) {
            throw { message: 'the room dosent exists ', code: 404 };
        }

        poster[0].files = fs.readdirSync(`./room_images/${id}`);

        if (user.user_id == poster[0].seller) {
            const applies = await db.query(`select *, a.is_archived as app_archived from application a inner join users u on a.applicant = u.user_id where room = ${id}`);
            return { room: poster[0], applies }
        } else {
            return { room: poster[0] };
        }

    },
    async register(db, token, data) {
        var { description, price, room_images, room_count, price_negotiable, location } = data;
        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }
        const query = `insert into room(seller, description, is_negotiable , room_count, price, location ) 
        values('${user.user_id}', '${description}',${price_negotiable},'${room_count}',${price}, '${location}');`;
        try {
            const res = await db.query(query);
            console.log('res', res)
            const dir = `./room_images/${res.insertId}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            console.log(dir);
            if (Array.isArray(room_images)) {
                room_images.forEach((image, i) => {
                    const ext = image.hapi.filename.split('.').at(-1);
                    if (!['img', 'jpg', 'png', 'gif'].includes(ext)) {
                        throw { message: "Image format not valid please try again!", code: 404 };
                    }
                    fs.writeFileSync(`${dir}/${image.hapi.filename}`, image._data, err => {
                        throw { message: "couldn't upload image please try again", code: 404 };
                    })
                })
            }
        }
        catch (err) {
            throw { message: "couldn't add room please try again", code: 404 };
        }
        return { message: "room added successfully ", code: 200 };
    },
    async available(db, id, token) {

        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }

        const room = await db.query(`select * from room where room_id = ${id}`);

        if(room.length ===0){
            throw { message: "room dosen't exist", code :404};
        }

        if(!user.is_admin && room[0].seller != user.user_id){
            throw { message: "Only admin can change other's room", code :404};
        }

        const req = await db.query(`update room set is_available =  !is_available where room_id = '${id}';`);
        if (req.changedRows > 0) {
            return { message: "room's availability changed successfully" }
        }
        else {
            throw { message: 'failed to update room', code :404};
        }
    },
    async archive(db, id, token) {

        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }

        const room = await db.query(`select * from room where room_id = ${id}`);

        if(room.length ===0){
            throw { message: "room dosen't exist", code :404};
        }

        if(!user.is_admin && room[0].seller != user.user_id){
            throw { message: "Only admin can archive other's room", code :404};
        }

        const req = await db.query(`update room set is_archived =  !is_archived where room_id = '${id}';`);
        if (req.changedRows > 0) {
            return { message: 'room archived successfully' }
        }
        else {
            throw { message: 'failed to update room', code :404};
        }
    },
}
module.exports = {
    Room,
    list: (req) => Room.list(req.app.db),
    register: (req) => {
        const token = req.params.token || req.headers.access_token;
        return Room.register(req.app.db, token, req.payload, req.payload)
    },
    getById: (req) => {
        const token = req.params.token || req.headers.access_token;
        return Room.getById(req.app.db, req.params.id, token)
    },
    archive: (req) => {
        const token = req.params.token || req.headers.access_token;
        return Room.archive(req.app.db, req.params.id, token)
    },
    available: (req) => {
        const token = req.params.token || req.headers.access_token;
        return Room.available(req.app.db, req.params.id, token)
    },
    applications: (req) => {
        const token = req.params.token || req.headers.access_token;
        return Room.applications(req.app.db,  token)
    }
}