const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

//get page to add a new service
router.get('/add',  (req, res) => {
  res.render('services/add',  );
  });


router.post('/add', async (req, res) => {
    //console.log('req.body');
  const { title, description, price } = req.body;
      const newService = {
      title,
      description,
      price,
      user_id: req.user.id
    };

    await pool.query('INSERT INTO services set ?', [newService]);
    req.flash('success', 'Service saved successfully');
    res.redirect('/services');
});


//get services list - services/list.hbs
router.get('/',  async (req, res) => {

  const services = await pool.query('SELECT * FROM services');

  res.render('services/list',  {services } );
});

// get services page  - from the navbar services/services_all
router.get('/services_page',  async (req, res) => {
    const services = await pool.query('SELECT * FROM services');
    res.render('services/services_all', {services } );
});

//delete service - services/list.hbs
router.get('/delete/:id', async(req, res) => {
    //console.log(req.params.id);
    //res.send('deleted');

    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    req.flash('success', 'Service removed successfully');
    res.redirect('/services');
});

//get edit service page - when get from the service/list.hbs - open services/edit.hbs

router.get('/edit/:id',  async (req, res) => {
  const { id } = req.params;
  //console.log(id); res.send('received');
  const services = await pool.query('SELECT * FROM services WHERE id = ? ', [id]);
  //console.log(links[0]);

  res.render('services/edit', {services: services[0]} );
});

// edit service  - when get from the service/list.hbs - open services/edit.hbs
router.post('/edit/:id',  async (req, res) => {
  const { id } = req.params;
  const {title, description, price } = req.body;

  const editService = {
    title,
    description,
    price
  };

 await pool.query('UPDATE services set ? WHERE id = ?', [editService, id]);
  req.flash('success', 'Service updated successfully');
 res.redirect('/services');

});


module.exports = router;
