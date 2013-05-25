exports.checkTime = function(){
	
	
	return function (req,res,next){
		console.log("Time1 ");
                userController = require('./routes/user_controller.js');
		if (req.session) {
                 console.log("Time2 ");
			if (req.session.user) {
		
		        var now = new Date().getTime() / 1000;
                if ( now - req.session.user.time > 15 ) {
                	req.session.user = null;
                	req.flash('info','Su sesión ha expirado, vuelva a hacer login');
                } else {
                 	userController.updateTime (req, res);
                 }

			
			
			} 
		}
		next();
	}


}
