const express = require('express');
const mongoose = require('mongoose');
var cardModel = require('./models/cardModel');
var paymentModel = require('./models/paymentModel');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGODB = 'mongodb://127.0.0.1:27017/test';

mongoose.connect(MONGODB, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.get("/api", (req, res) => {
    res.json({ message : "Hello from server!" });
    console.log("sent message");
  });

app.get("/cards/:id?", (req, res) => {
  if (req.params.id) {
    try {
      cardModel.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, (err, card) => {
        console.log('card info sent !\n');
        res.send(card);
      })
    } catch (err) {
        res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
    }
  } else {
    cardModel.find({}, (err, card) => {
      if (err)
        res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
      else
        res.send(card);
    })
  }
});

app.post("/cards/", (req, res, next) => {
  try {
    cardModel.findOne({card_number: req.body.card_number, expiration_months: req.body.expiration_months,
      expiration_years: req.body.expiration_years, cvc: req.body.cvc, card_name: req.body.card_name}, (err, card) => {
      if (card) res.status(500).send(`Error: Something bad happened, try again!\nCard already exists`);
      else {
        const card_instance = new cardModel({card_number: req.body.card_number, expiration_years: req.body.expiration_years,
          expiration_months: req.body.expiration_months, cvc: req.body.cvc, card_name: req.body.card_name, balance: req.body.balance});
        card_instance.save((err) => {
          if (err) {
          res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
          console.log(err);
          }
          else {
            res.send("Card added.");
            console.log("Card added:\n" + req.body);
          }
        })
      }
    })
  } catch (next) {
      res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
  }
});

app.get("/payments/:cardId", (req, res) => {
  paymentModel.find({card_id: req.params.cardId}, (err, payments) => {
    if (err)
      res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
    else
      res.send(payments);
  })
})

app.post("/payments/", (req, res) => {
  try {
    cardModel.findOne({card_number: req.body.card_number, expiration_months: req.body.expiration_months,
      expiration_years: req.body.expiration_years, cvc: req.body.cvc, card_name: req.body.card_name}, (err, card) => {
      if (!card) res.status(500).send(`Error: Something bad happened, try again!\nWrong card info`);
      else {
        if (card.balance >= req.body.price) {
        card.balance = card.balance - req.body.price;
        card.save((err) => {
           if (err) res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`); // saved!
        });
        const payment_instance = new paymentModel({price: req.body.price, card_id: card._id});
        payment_instance.save((err) => { 
          if (err) res.status(500).send(`Error: Something bad happened, try again!\n${err.message}`);
          else res.send("Payment done.");
        })
        } else res.status(500).send("Balance too low for payment");
      }
    })
  } catch (err) {
    res.status(500).send(`Error: Something bad hhhhhhappened, try again!\n${err.message}`);
  }
});


// QUESTION POUR LE PAIMENT : TRANSACTION DE CARTE A CARTE ? OU JUSTE SOUSTRACTION DU SOLDE D'UNE CARTE

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
