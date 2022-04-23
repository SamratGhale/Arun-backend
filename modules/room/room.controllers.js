var fs = require('fs')
const User = require("../users/users.controllers");
const Room = {
    async list(db) {
        const res = await db.query('select * from room r inner join users u on r.seller = u.user_id where r.is_archived = false');
        console.log(res)
        res.forEach((room, i) => {
            res[i].files = fs.readdirSync(`./room_images/${room.room_id}`);
        })
        return res;
    },
    async getById(db, id, token) {
        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }

        const poster = await db.query( `select * from room r inner join users u on r.seller = u.user_id where room_id = ${id};`);

        if(poster.length ==0){
            throw {message: 'the room dosent exists ', code :404};
        }

        poster[0].files = fs.readdirSync(`./room_images/${id}`);

        if(user.user_id == poster[0].seller){
            const applies = await db.query(`select * from application a inner join users u on a.applicant = u.user_id where room = ${id}`);
            return {room: poster[0], applies}
        }else{
            return {room: poster[0]};
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
    }
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
    }
}