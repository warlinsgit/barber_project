const express = require('express');
const router = express.Router();
const pool = require('../database');
const nodemailer=require('nodemailer');
const bodyParser = require('body-parser');
const bCrypt = require('bcryptjs');
const helpers = require('../lib/helpers');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');


//get signup page

router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup');
});



//signup form auth/signup.hbs

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {

    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));


//get signin page

router.get('/signin',  (req, res) => {
  res.render('auth/signin');
});

// signin page form


router.post('/signin', isNotLoggedIn,(req, res, next) => {

  req.check('email', 'email is Required').notEmpty();
  req.check('email', 'email is Incorret').isEmail();
  req.check('password', 'Password is Required').notEmpty();

 const errors = req.validationErrors();
  if (errors.length > 0) {
    req.flash('message', errors[0].msg);
    res.redirect('/signin');
  }


  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);

});

//get user profile page if user is authenticated
router.get('/profile', isLoggedIn, async (req, res) => {

//user profile page select user booking history if user made a booking
  const booked = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id order by id desc' );

  res.render('profile', { booked });
  //res.render('profile');
});


// end session  - user logout - redirect to the homepage
router.get('/logout',  (req, res) => {

  req.logout();
  res.redirect('/');
});



/* GET Change Password Page */
router.get('/change-password', isLoggedIn,  (req, res, next) => {
    res.render('auth/change-password');

});


   /* POST Change Password */
router.post('/changes-password', function (req, res, next) {

    let isValidPassword = function (user, password) {
           return bCrypt.compareSync(password, user);
    };

     let createHash = function (password) {
           return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };


     const email = req.body.email;

      pool.query("SELECT * FROM users_b WHERE email = ?;", [email], function (err, rows){

          //If Unexpected Error - Log It & Return It
       if (err || !rows.length || rows === []) {
        console.log("Error: " + err);
        return res.render('auth/change-password', {
        message: "User " + email + " not found.",
        success: null,
        email: req.body.email

        });

        } else {
              //New Password & Confirm Passwords DO NOT match
              if (req.body.newpass !== req.body.confirm) {
                console.log(req.body.email);
                console.log(req.body.confirm);
                   return res.render('auth/change-password', {
                      message: "Passwords Do Not Match.",
                      success: null,
                      email: req.body.email


                  });
              }

              //Oldpass Password & Current Database Passwords DO NOT match
              if (!isValidPassword(rows[0].password, req.body.oldpass)) {
                console.log('current Pass:', req.body.oldpass);
                  console.log('old Pass:', req.body.password);

            return res.render('auth/change-password', {
                      message: "Incorrect Current Password.",
                      success: null,
                        email: req.body.email

                  });
              }

              //Update Password

            pool.query("UPDATE users_b SET password = ? WHERE email = ?;", [createHash(req.body.confirm), email],(err, rows) => {
                console.log(req.body.email);
                console.log(req.body.confirm);

                req.logout();

              res.redirect('/logout');
                //res.render('auth/signin', {
                      //message: null,
                    //  success: "Successfully Updated Password.",


                  });
              };

      });
  });

  //edit user

router.get('/edit-user/:id', async (req, res) => {

  const { id }  = req.params;
  const users = await pool.query('SELECT * FROM users_b WHERE id = ?', [id]);

   res.render('auth/edit-user', {users: users[0]});

});


router.post('/edita-user/:id', async (req, res) => {
          //console.log('cheguei aqui');
  const { id } = req.params;
  const { fullname } = req.body;

  const userDetails = {

      fullname

    };

   await pool.query('UPDATE users_b set ? WHERE id = ?', [userDetails, id]);
    req.flash('success', 'User updated successfully');
        console.log('cheguei aqui');
    res.render('auth/edit-user');

});



  //Delete user profile

router.get('/delete-profile/:id', async(req, res) => {
    console.log(req.params.id);

    const { id } = req.params;

      await pool.query('DELETE FROM users_b WHERE id = ?', [id]);
      req.flash('success', 'Profile removed successfully');
        req.logout();

      res.redirect('/logout');
});

// Page - ask user email to reset password
router.get('/forgot_req_email', async(req, res) => {

    res.render('auth/forgot_req_email');
});

//Page forgot_req_email -   request email from user to recovery password

router.post('/request-pass', async(req, res) =>{

  let createHash = function (password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

   //const email = req.body.email;
  //const amigo = pool.query("UPDATE users_b SET coded = ? WHERE email = ?;", [createHash(req.body.email), email]);
  const email = req.body.email;
  const emailo = req.body.email;


  const emaila_ = await pool.query('SELECT * FROM users_b where email = "'+emailo+'" ');

  console.log('emaila_=========', emaila_);

   const err = '';
    //If Unexpected Error - Log It & Return It
    if (err || !emaila_.length || emaila_ === []) {
        console.log("Error: " + err);
       return res.render('auth/forgot_req_email', {
            message: "Sorry, this email is not registered.",
            success: null



      });

};


  const email_hash = createHash(emailo);


const amigo = pool.query("UPDATE users_b SET coded = ? WHERE email = ?;", [email_hash, email]);


  var transporter=nodemailer.createTransport( {

    service: 'gmail', auth: {
     user: 'matutinolife@gmail.com', pass: ''
    }
  }
);

    var mailOptions= {


      from: '"Barbershop Online Booking" <warlins25@gmail.com><br>',
       to: ''+req.body.email+'', subject: 'Email',

      html: '<h1 sytle="color:#011e1e">Recovery your password using the code below </h1>'+email_hash+'<a href="http://localhost:5000/forgot-pass"><br><b>Recovery Password</b></a>'



  }
    transporter.sendMail(mailOptions, function(error, info) {
      var mailOptions2= {}
      if(error) {
        return console.log(error);
      }

      console.log('email_hash', email_hash);
      console.log('Message sent:  '+ info.response);


      req.flash('success', 'Message Sent! Please check your email!');
      res.redirect('/signin');
    }
  );
}

);

//forgot password

router.get('/forgot-pass', async(req, res) => {

    res.render('auth/forgot-pass');
});

router.post('/forgot-pass', async(req, res) =>{

  let isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user);
    };

    let createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

   const coded = req.body.coded;

   const codeda = await pool.query('SELECT * FROM users_b where coded = "'+coded+'" ');

   //console.log('coded=========', codeda);
    const err = '';
     //If Unexpected Error - Log It & Return It
     if (err || !codeda.length || codeda === []) {
         console.log("Error: " + err);
        return res.render('auth/forgot-pass', {
             message: "Code Incorret.",
             success: null

         });
};

   const email = req.body.email;

     pool.query("SELECT * FROM users_b WHERE email = ?;", [email], function (err, rows){

       //If Unexpected Error - Log It & Return It
       if (err || !rows.length || rows === []) {
           console.log("Error: " + err);
         return res.render('auth/forgot-pass', {
               message: "User " + email + " not found.",
               success: null,
               email: req.body.email

           });
       } else {
           //New Password & Confirm Passwords DO NOT match
           if (req.body.newpass !== req.body.confirm) {
             console.log(req.body.email);
             console.log(req.body.confirm);
                return res.render('auth/forgot-pass', {
                   message: "Passwords Do Not Match.",
                   success: null,
                   email: req.body.email


               });
           }


           //Oldpass Password & Current Database Passwords DO NOT match

               if(rows[0].email === 0) {
         return res.render('auth/forgot-pass', {
                   message: "Incorrect Current Email.",
                   success: null,
                     email: req.body.email

               });
           }

           //Update Password

         pool.query("UPDATE users_b SET password = ? WHERE email = ?;", [createHash(req.body.confirm), email],(err, rows) => {
             //console.log(req.body.email);
             //console.log(req.body.confirm);
          return res.render('auth/signin', {
                   message: null,
                   success: "Password Successfully Updated",


               });
           });
       }
   });
});

module.exports = router;
