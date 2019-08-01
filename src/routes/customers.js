// Add - Edit - Delete Customers

const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
router.get('/customers', (req, res) => {

  res.render('customers/add');
});

/*
router.post('/customers/add/', async (req, res) => {

  const{ address, mobile, city,age, userc_id } = req.body;
  const newInfo = {

    address,
    mobile,
    city,
    age,
    userc_id
    //user_id: req.user.id

  };
  await pool.query('INSERT INTO customers set ?', [newInfo]);
  req.flash('success', 'Customers details saved successfully');


});
*/

router.get('/list-customers', isLoggedIn, async (req, res) => {
  //const customer = await pool.query('SELECT * FROM customers WHERE userc_id = ?', [req.user.id]);


const customer = await pool.query('SELECT * FROM users_b');

res.render('customers/list-customers',{ customer });

});


//edit customers


router.get('/edit-customer/:id', async (req, res) => {
  console.log('i m here');
  const { id } = req.params;


  const cavalo = req.user.email;
  console.log('cavalo ===========', cavalo);

    console.log('fullname===========', req.body.fullname);

  const customer = await pool.query('SELECT * FROM users_b WHERE email = ? ', [cavalo]);
  //console.log(links[0]);

  console.log('cusstomer doidao>>>>>>>>>>>>>>>', [customer])

   res.render('customers/edit-customer', {customer: customer[0]} );
});


// Edit user details  profile page
router.post('/edit-customer/:id', async (req, res) => {
        console.log('cheguei aqui');
  const { id } = req.params;
  const { address, city, mobile, age} = req.body;

  const user_email_p = req.user.email;
    console.log('user_email_p  ===========', user_email_p );

  const customer = {

    address, city, mobile, age

};


 await pool.query('UPDATE users_b set ? WHERE email = ?', [customer, user_email_p ]);
  req.flash('success', 'Profile updated successfully');
      console.log('customer updated');
  //res.render('customers/edit-customer');
  res.redirect('/profile');

});

//Delete user profile  - Delete user account
router.get('/delete-customer/:id',  async(req, res) => {
    //console.log(req.params.id);
    //res.send('deleted');

    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM users_b WHERE id = ?', [id]);
    req.flash('success', 'Customer removed successfully');
    res.redirect('/list-customers');
});

module.exports = router;
