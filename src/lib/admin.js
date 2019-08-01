
const pool = require('../database');


exports.isAdmin = async function (req, res, next){

// 
  const camila = req.user.email;


  const amor = await pool.query('SELECT email from users_b where admin = 1 and email = "'+camila+'" ');

  console.log('amor------------', amor);

  const avai_id = (amor[0].email);

  const amora = avai_id;

  console.log('amor---------------', amora)


  if(req.isAuthenticated && amora ==  amora){
    next();

  }else{

    res.status(404);
  }
}
