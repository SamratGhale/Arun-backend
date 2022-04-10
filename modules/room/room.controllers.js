const Seller = require("../seller/seller.controllers");
const RoomModel = require("./room.model")

const Room = {
    async register(data) {
        var { token, description, price, room_count, price_negotiable, location } = data;
        const user = await Seller.Seller.validateToken(token);
        if (!user) {
            throw { message: "seller dosen't exist" };
        }
        console.log(data)
        data.seller = user._id;
        delete data.token;
        return await RoomModel.create(data);
    }
}
module.exports = {
    Room,
    register: (req) => Room.register(req.payload)
}