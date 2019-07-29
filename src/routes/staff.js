const express = require('express');
const router = express.Router();

const pool = require('../database');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const auth = require('../lib/admin');
var isAdmin = auth.isAdmin;


router.get('/staff_list', async (req, res) => {

    const staff = await pool.query('SELECT * FROM staff_s');
  //const staff = await pool.query('SELECT * FROM staff_s WHERE staff_id = ?', [req.user.id]);


  res.render('staff/staff_list', { staff });
});




router.get('/staff',(req, res) => {

  res.render('staff/add_staff', {user: req.user});
});

router.post('/staff/add_staff/', (req, res) => {

  const{ staff_name, mobile } = req.body;

  const newInfo = {
    staff_name,
    mobile

  };

   pool.query('INSERT INTO staff_s set ?', [newInfo]);
  req.flash('success', 'Staff saved successfully');
  console.log('staff_name', staff_name);
  console.log('mobile', mobile);
  var err
  if(err){
    throw(err);
  }
  res.redirect('/staff_list');
});



//edit customers


router.get('/edit_staff/:staff_id', async (req, res) => {

  const { staff_id }  = req.params;

  const staff = await pool.query('SELECT * FROM staff_s WHERE staff_id = ?', [staff_id]);

  res.render('staff/edit_staff', {staff});

});

router.post('/edit_staff/:staff_id', async (req, res) => {
        console.log('cheguei aqui');
  const { staff_id } = req.params;
  const { staff_name, mobile } = req.body;

  const staff = {

    staff_name,
    mobile

  };


 await pool.query('UPDATE staff_s set ? WHERE staff_id = ?', [staff, staff_id]);
  req.flash('success', 'Staff updated successfully');
      console.log('staff updated');

  res.redirect('/staff_list');

});

//delete staff


router.get('/delete/:id', async(req, res) => {
    //console.log(req.params.id);
    //res.send('deleted');

    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM staff_s WHERE staff_id = ?', [id]);
    req.flash('success', 'Staff removed successfully');
    res.redirect('/staff_list');
});

/*
function isAdmin(req, res, next) {
if (req.isAuthenticated()) {
    if (req.user.local.admin == 1) {
        return next();
    }
}
res.redirect('/signin');
}
*/

module.exports = router;
