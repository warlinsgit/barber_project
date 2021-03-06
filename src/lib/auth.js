module.exports = {
  isLoggedIn(req, res, next){
    if(req.isAuthenticated()){

      return next();

    }
    return res.redirect('/signin');
  } ,

  isNotLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
      return next();
    }
    res.redirect('/profile');
  }
};

//user authentication - islogged in or not
