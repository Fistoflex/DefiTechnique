const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  card_number: { type: Number, required: true },
  expiration_months: { type: Number, required: true, min: 1, max: 12 },
  expiration_years: { type: Number, required: true },
  cvc: { type: Number, required:true },
  card_name: { type: String, required: true},
  balance: {type: Number, required: true, default: 1000, min: 0}
});

const cardModel = mongoose.model('cardModel', cardSchema);

module.exports = cardModel;