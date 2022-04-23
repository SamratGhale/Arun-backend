const User = require("../users/users.controllers");
const Room = require("../room/room.controllers");
const { escape } = require('sqlstring')

const Application={
  async list(db){
    return await db.query('select * from application');
  },
  async approve(db, id){
    try{
      await db.query(`update application set sold = !sold where id =${id}`);
      return {message:"Approved application ", code: 404};
    }catch(err){
      console.log(err);
      throw {message:"couldn't approve application", code:404};
    }
  },
  async register(db, token, data){
    var {room, query} = data;
    const user = await User.User.validateToken(db, token);
    query = query ? escape(query) :""
    if (user.length === 0) {
      throw { message: "Invalid token please log in and try again", code: 400 };
    }

    const is_booked = await db.query(`select * from application where room = ${room} and applicant=${user.user_id}`);
    if(is_booked.length >0){
      throw { message: 'You have already booked this room!', code: 400 };
    }

    const q= `insert into application(room, query, applicant) values(${room},${query}, ${user.user_id})`;
    try{
      await db.query(q)
      return {message: 'Booked room successfully please stay updated'};
    }catch(err){
      console.log(err);
      throw { message: 'Couldnt apply for the room please try again', code: 400 };
    }
  }
}

module.exports={
  Application,
  list: (req)=>Application.list(req.app.db),
  approve: (req)=>Application.approve(req.app.db, req.params.id),
  register:(req)=>{
    console.log(req.headers)
    const token = req.params.token || req.headers.access_token;
    return Application.register(req.app.db, token, req.payload, req.payload);
  }
}