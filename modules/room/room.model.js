const { number } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const schema = {
  seller: { type: String, joi: Joi.string().optional().description("Seller Username") },
  description: { type: String, joi: Joi.string().email().optional().description("Seller email") },
  is_available: { type: Boolean, required: true, default: true },
  is_archived: { type: Boolean, required: true, default : false },
  price: { type: Number, required: true },
  is_verified: { type: Boolean, required: true, default : false },
  room_count: { type: Number, required: true },
  price_negotiable: { type: Boolean, required: true },
  location: { type: String, required: true },
};

const SellerSchema = mongoose.Schema(schema, {
  collection: 'Room',
});

module.exports = mongoose.model('Room', SellerSchema);