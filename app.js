const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'live', //sandbox or live
    'client_id': 'AfLh-4ZZeXSDfhphq_uy1U435R1rXHEr1VgqM-FwJ6hEA2wzGhou3YWdNVapxlllhU8KquSSuOxSUkH8',
    'client_secret': 'EBj3xAI52GmhRbzlcvymzaH3AZVfic9m2NpWtDRytWaoysOXjmnAwUtHFR4ui7HaHUd-Js61aJOn8y7E'
  });




const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "0.02",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "0.02"
        },
        "description": "Hat for the best team ever"
    }]
};

// gateway.paymentMethod.find("token", function (err, paymentMethod) {console.log(paymentMethod,"viswa")});
paypal.payment.create(create_payment_json, function (error, payment) {
    console.log(payment);
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "0.02"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));