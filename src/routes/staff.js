const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const auth = require('../lib/admin');
var isAdmin = auth.isAdmin;

//get all staff -  staff/staff_list
router.get('/staff_list', isAdmin, async (req, res) => {

    const staff = await pool.query('SELECT * FROM staff_s');
  //const staff = await pool.query('SELECT * FROM staff_s WHERE staff_id = ?', [req.user.id]);
  res.render('staff/staff_list', { staff });
});

// get page to add a new staff -  staff/add_staff
router.get('/staff', isAdmin,(req, res) => {

  res.render('staff/add_staff', {user: req.user});
});

//  add a new staff form -  staff/add_staff
router.post('/staff/add_staff/',isAdmin, (req, res) => {

  const{ staff_name, mobile } = req.body;
  //var date_commenced = new Date();
  var d = new Date();
  var n = d.toLocaleString();
  var date_commenced = n;

  const newInfo = {
    staff_name,
    mobile,
    date_commenced

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

//edit staff page  - staff/edit_staff.hbs

router.get('/edit_staff/:staff_id', isAdmin, async (req, res) => {

  const { staff_id }  = req.params;

  const staff = await pool.query('SELECT * FROM staff_s WHERE staff_id = ?', [staff_id]);

  res.render('staff/edit_staff', {staff});

});

//edit staff form  - staff/edit_staff.hbs
router.post('/edit_staff/:staff_id', isAdmin, async (req, res) => {
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

//delete staff - staff/staff_lists


router.get('/delete/:id', isAdmin, async(req, res) => {
    //console.log(req.params.id);
    //res.send('deleted');

    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM staff_s WHERE staff_id = ?', [id]);
    req.flash('success', 'Staff removed successfully');
    res.redirect('/staff_list');
});


module.exports = router;
