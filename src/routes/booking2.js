//https://www.vertabelo.com/blog/technical-articles/a-database-model-to-manage-appointments-and-organize-schedules


//PROJECT POP UP WINDOW
//https://github.com/MFikri94/crud-nodejs-mysql

//https://www.youtube.com/watch?v=-rBV65OqiLg


//https://github.com/sangjs/mysql-crud-nodejs

const express = require('express');
const router = express.Router();
const nodemailer=require('nodemailer');

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');






router.get('/booking', isLoggedIn, async  (req, res) => {

    //const staff = await pool.query('SELECT * FROM staff_s');

    //const days_ava = await pool.query('SELECT * FROM days_ava');

    const services = await pool.query('SELECT * FROM services');


   const schedules_staff = await pool.query('SELECT * from staff_s st LEFT JOIN booking4 b ON b.staff_id = st.staff_id and b.id_slot = "'+req.body.id_slot+'" where b.staff_id is null order by st.staff_id');


    const schedules_times = await pool.query('SELECT * from days_ava da LEFT JOIN booking4 b ON b.id_slot = da.id AND b.staff_id = "'+req.body.staff_id+'" where staff_id is null order by days_available');



  res.render('booking/booking',{schedules_staff,  schedules_times, services});

});



  router.post('/booking', isLoggedIn, async (req, res, next) => {

//const staff_ =  pool.query('SELECT staff_name from staff_s where staff_id = "'+req.body.staff_id+'"');
try{
const staff_ = await pool.query('SELECT staff_name from staff_s where staff_id = "'+req.body.staff_id+'"');



console.log(staff_[0].staff_name);

const vida = (staff_[0].staff_name);

const staff_name = vida;

console.log('staff_name=============', staff_name)

const cabra = await pool.query('SELECT days_available from days_ava where id = "'+req.body.id_slot+'"');
console.log('selected_times-----------', cabra);

const time_ava = (cabra[0].days_available);
console.log('time_ava------', time_ava);

selected_times = time_ava;

} catch (err) {
   next(err);
 }


  const { selected_day, service_title, client_id, staff_id, created_at, id_slot } = req.body;

  //console.log('id-----------', selected_times)

  req.flash('success', 'We\'re almost there');
  //console.log([newBook]);


  res.render('booking/customer_book',{

    selected_day: selected_day,
    selected_times:  selected_times,
    service_title: service_title,
    client_id:  client_id,
    staff_name: staff_name,
    staff_id: staff_id,
    id_slot: id_slot



  }


);
});


//delete booking
router.get('/delete-booking/:id', async(req, res) => {


    const { id } = req.params;
    //pool.query('DELETE FROM ')
    await pool.query('DELETE FROM booking4 WHERE id = ?', [id]);
    req.flash('success', 'Booking Deleted');
    res.redirect('/book-confirmed');
});


router.get('/book-confirmed',  async (req, res) => {

    const booking = await pool.query('SELECT * FROM booking4 WHERE client_id = ?', [req.user.id]);

  res.render('booking/book-confirmed',{booking});
});


router.get('/service-booked', async(req, res) => {

  const booked = await pool.query('SELECT id, selected_day, selected_service, created_at FROM booking4' );

  res.render('booking/service-booked', { booked });

});
/*
router.get('/edit-booking/:id', isLoggedIn, async(req, res) =>{
  const { id } = req.params;
    const booking = await pool.query('SELECT * FROM booking4 WHERE id = ? ', [id]);

  res.render('booking/amigo', {booking: booking[0]});
});

*/


router.get('/edit-booking/:id', isLoggedIn, async (req, res, next) => {

  const { id } = req.params;

  const booking = await pool.query('SELECT * FROM booking4 WHERE id = ? ', [id]);
  //console.log(links[0]);
   const services = await pool.query('SELECT title FROM services');
   console.log('i am here');

   const staff = await pool.query('SELECT staff_name from staff_s ');


    res.render('booking/edita-booking', {booking: booking[0], services: services, staff: staff} );


});


router.post('/edit-booking/:id',  async (req, res) => {
  const { id } = req.params;
  const { selected_day, selected_times, service_title, staff_name } = req.body;

  const editBooking = {

    selected_day,
    selected_times,
    service_title,
    staff_name


  };


  await pool.query('UPDATE booking4 set ? WHERE id = ?', [editBooking, id]);
   req.flash('success', 'Service updated successfully');
  res.redirect('/book-confirmed');

 });

 //confirm email
router.post('/confirm_booking/', async(req, res)=>{
  req.check('email', 'Email is Required').notEmpty();
    req.check('email', 'Email wrong format').isEmail();


  const errors = req.validationErrors();
   if (errors.length > 0) {
     req.flash('message', 'Erro');
     res.redirect('booking',

 {  message: "Email not found.",
  success: null

  }

   );
   }else{


 var transporter=nodemailer.createTransport( {
   service: 'gmail', auth: {
     user: 'matutinolife@gmail.com', pass: 'matutino3030'
   }
 }
);
   var mailOptions= {
     from: '"Barbershop Online Booking" <warlins25@gmail.com>',
     to: req.body.email,
     subject: 'Barbershop Online Booking',



     text: 'You jave a submission from... Name: '+req.body.name+' Email:  '+req.body.email+' Subject:  '+req.body.subject+'  Message: '+req.body.message,

      html: '<h1 sytle="color:#011e1e">Details of your appointment</h1> <ul><li><b>Day:</b> '+req.body.selected_day+' </li> <li><b>Time:</b>  '+req.body.selected_times+' <li><b> Barber:</b> '+req.body.staff_name+' </li> <li><b> Service:</b> '+req.body.service_title+' </li></ul><div>With warm regards,<br>Barbershop Booking Online</div>'


 }


   transporter.sendMail(mailOptions, function(error, info) {
     if(error) {
       return console.log(error);
     }else{
          console.log('Message sent:  '+ info.response);




     const { selected_day, selected_times, service_title, customer_name, client_id, staff_id, id_slot} = req.body;



       console.log('staff_id', staff_id)

     const newBook = {

       selected_day,
       selected_times,
       service_title,
       customer_name,
       client_id,
       staff_id,
       id_slot

     };



      pool.query('INSERT INTO booking4 set ?', [newBook]);

     req.flash('success', 'Message Sent! Thank you for getting in touch!');
     res.redirect('/profile');
   }}
 );
}
}
);





module.exports = router;
