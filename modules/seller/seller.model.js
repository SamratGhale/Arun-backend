const { number } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const schema = {
  username: { type: String, joi: Joi.string().optional().description("Seller Username") },
  email: { type: String, joi: Joi.string().email().optional().description("Seller email") },
  password: { type: String, required: true },
  phone: {type: Number, required: true},
  registered: { type: Boolean, required: true },
  is_archived: { type: Boolean, required: true },
  is_admin: {type: Boolean, required: true, default: false}
};

const SellerSchema = mongoose.Schema(schema, {
  collection: 'Seller',
});

SellerSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}

SellerSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Seller', SellerSchema);