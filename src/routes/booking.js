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



router.post('/search', async (req, res) => {


      const seca = req.body.search;

      const search = await pool.query('SELECT * from booking4 where customer_name = "'+seca+'" ' );



        if(search.length < 1){
          console.log('nothing-----------',search.length);
            req.flash('message', 'Nothing found');

         res.redirect("service-booked");


        }else{

              res.render("booking/service-booked2", {search: search});
}

});




router.get('/booking', isLoggedIn, async (req, res) => {


    const services = await pool.query('SELECT * FROM services');

  res.render('booking/booking',{services});

});

router.post('/booking2', isLoggedIn, async (req, res, next) => {

    const staff = await pool.query('SELECT * FROM staff_s');

    const { selected_day, service_title, client_id, staff_id, created_at } = req.body;

  res.render('booking/booking2',{

    selected_day: selected_day,
    service_title: service_title,
    client_id:  client_id,
    staff

}
);
});

router.post('/booking3', isLoggedIn, async (req, res, next) => {

  //const days_ava = await pool.query('SELECT * FROM days_ava');

  const staff_ = await pool.query('SELECT staff_id from staff_s where staff_name = "'+req.body.staff_name+'"');


  console.log(staff_[0].staff_id);

  const vida = (staff_[0].staff_id);

  const staff_id = vida;

//  console.log('staff_name=============', staff_name);

    console.log('staff_id=============', staff_id);

  const days_ava = await pool.query('select * from days_ava da LEFT JOIN booking4 b ON b.id_slot = da.id AND b.staff_id = "'+staff_id+'" AND selected_day = "'+req.body.selected_day+'" where staff_id is null');





          const { selected_day, service_title, client_id, staff_name, created_at } = req.body;

  res.render('booking/booking3',{

    selected_day: selected_day,
    service_title: service_title,
    client_id:  client_id,
    staff_id: staff_id,
    staff_name: staff_name,
    days_ava


}
);
});



router.post('/booking4', isLoggedIn, async (req, res) => {


// selected times

const cabra = await pool.query('SELECT id from days_ava where days_available = "'+req.body.selected_times+'"');

console.log('cabra===============', cabra);

console.log(cabra[0].id);

const avai_id = (cabra[0].id);

const id_slot = avai_id;


    const { selected_day, service_title, client_id, staff_id, created_at, staff_name, selected_times } = req.body;

    //console.log('id_slot--------------', req.body.id_slot);



console.log('id_slot--------------',  id_slot);

  res.render('booking/customer_book',{

    selected_day: selected_day,
    service_title: service_title,
    selected_times : selected_times,
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



// book confirmed search

  router.post('/book-confirmed-search', async (req, res) =>{

      const chipa = req.body.sica;

      console.log('chipa', chipa);

      const book_confirm_search = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id where b.customer_name = "'+req.body.sica+'" order by selected_day desc ');



          res.render('booking/book-confirmed2', {book_confirm_search: book_confirm_search


          });
    });


router.get('/book-confirmed', async (req, res) => {
  const user = req.user;
  const user_admin = user.admin;
if(user_admin){
    const staffa = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id' );

//console.log('staffa=========', staffa);

  res.render('booking/book-confirmed',{staffa}); }

  else{
      const staffa = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id WHERE b.client_id = ?', [req.user.id]  );
    res.render('booking/book-confirmed',{staffa});
  }
});

// All booking service to be done - future
router.get('/service-booked', async(req, res) => {

  const booked = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id order by selected_day desc' );

  res.render('booking/service-booked', { booked });

});


// All booking service  done - passed
router.get('/service-booked-done', async(req, res) => {

  const booked = await pool.query('SELECT * FROM booking4 b LEFT JOIN staff_s st ON st.staff_id = b.staff_id order by selected_day desc' );

  res.render('booking/service-booked', { booked });

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
     user: 'matutinolife@gmail.com', pass: ''
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




     const { selected_day, service_title, selected_times, customer_name, client_id, staff_id, id_slot} = req.body;





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
