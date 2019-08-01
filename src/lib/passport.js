// config/passport.js

const passport = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const helpers = require('../lib/helpers');
// load all the things we need


const pool = require('../database');


passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) =>{
  //console.log(req.body); console.log(username); console.log(password);

 const rows = await pool.query('SELECT * FROM users_b WHERE email = ?', [email]);
  if(rows.length > 0){
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password);
    if(validPassword){
      done(null, user, req.flash('success', 'Welcome ' + user.email));
    }else{
      done(null, false, req.flash('message', 'Incorret Password'));
    }
  }else{
    return done(null, false, req.flash('message', 'The username does not exist'));
  }

}));

    passport.use('local.signup', new LocalStrategy({


        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async (req, email, password, done) => {

      var d = new Date();
      var n = d.toLocaleString();
      var user_since = n;
      const { fullname } = req.body;
      //var  admin   = 1;

      const newUser = {
        email: email,
        password: password,
        fullname,
        user_since
        //admin: admin



      };
       const rows = await pool.query('SELECT * FROM users_b WHERE email = ?', [email]);


          if (rows.length > 0) {
          return done(null, false, req.flash('message', 'That username is already taken.'));
                } else {


      newUser.password = await helpers.encryptPassword(password);

      const result = await pool.query('INSERT INTO users_b SET ? ', [newUser]);

    //  const client = await pool.query('INSERT INTO clients_ SET ? ', [newUser]);

      newUser.id = result.insertId;
      //console.log(result);
      return done(null, newUser);
}
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users_b WHERE id = ?', [id]);
  done(null, rows[0]);

});
