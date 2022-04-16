const User = require("../users/users.controllers");
const Room = {
    async register(db, token, data) {
        var { description, price, room_count, price_negotiable, location } = data;
        const user = await User.User.validateToken(db, token);
        if (user.length === 0) {
            throw { message: "Invalid token please log in and try again", code: 400 };
        }
        const query = `insert into room(seller, description, is_negotiable , room_count, price, location ) 
        values('${user.user_id}', '${description}',${price_negotiable},'${room_count}',${price}, '${location}');`;
        try {
            await db.query(query);
        }
        catch (err) {
            throw { message: "couldn't add room please try again", code: 404 };
        }
        return { message: "room added successfully ", code: 200 };
    }
}
module.exports = {
    Room,
    register: (req) => {
        const token = req.params.token || req.headers.access_token || req.cookies.access_token;
        return Room.register(req.app.db, token, req.payload, req.payload)
    }
}