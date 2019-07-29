const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');




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



  router.get('/',  async (req, res) => {
  //  const services = await pool.query('SELECT * FROM services WHERE user_id = ?', [req.user.id]);
        const services = await pool.query('SELECT * FROM services');
    //console.log(services);

    res.render('services/list',  {services } );
  });

  router.get('/amor',  async (req, res) => {
    const services = await pool.query('SELECT * FROM services');
      res.render('services/services_all', {services } );
  });




router.get('/delete/:id', async(req, res) => {
    //console.log(req.params.id);
    //res.send('deleted');

    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    req.flash('success', 'Service removed successfully');
    res.redirect('/services');
});

router.get('/edit/:id',  async (req, res) => {
  const { id } = req.params;
  //console.log(id); res.send('received');
  const services = await pool.query('SELECT * FROM services WHERE id = ? ', [id]);
  //console.log(links[0]);

  res.render('services/edit', {services: services[0]} );
});

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
