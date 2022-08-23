const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    price: { type: Number, required: true },
    card_id: { type: String, required: true}
  });
  
  const paymentModel = mongoose.model('paymentModel', paymentSchema);

  module.exports = paymentModel;