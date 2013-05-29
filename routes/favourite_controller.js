
var models = require('../models/models.js');

var userController = require('./user_controller');

/*
*  Auto-loading con app.param
*/
exports.load = function(req, res, next, id) {

   models.Favourite
        .find({where: {id: Number(id)}})
        .success(function(favourite) {
            if (favourite) {
                req.favourite = favourite;
                next();
            } else {
                req.flash('error', 'No existe el favorito con id='+id+'.');
                next('No existe el favorito con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};


/*
* Comprueba que el usuario logeado es el author.
*/
exports.loggedUserIsAuthor = function(req, res, next) {
    
    if (req.session.user && req.session.user.id == req.favourite.userId) {
        next();
    } else {
        console.log('Operación prohibida: El usuario logeado no es el autor del favorito.');
        res.send(403);
    }
};

// PUT /users/2/favourites/1
exports.star = function(req, res, next) {
    models.Favourite.find({where: {userId: req.session.user.id,
                                   postId: req.post.id }})
        .success(function(favoritoBD) {
            if (!favoritoBD){
            	var favourite = models.Favourite.build(
                    { userId: req.session.user.id,
                      postId: req.post.id
                    });
                
                var validate_errors = favourite.validate();
                if (validate_errors) {
                    console.log("Errores de validación:", validate_errors);

                    req.flash('error', 'Los datos del formulario son incorrectos.');
                    for (var err in validate_errors) {
                        req.flash('error', validate_errors[err]);
                    };

                    res.render('posts/'+postId, {post: req.post,
                                                validate_errors: validate_errors, cont: res.cont});
                    return;
                } 

                favourite.save()
                    .success(function() {
                        req.flash('success', 'El post ha sido marcado como favorito');
                        res.redirect('/posts/' + req.post.id );
                    })
                    .error(function(error) {
                        next(error);
                    });
                }
            });
}

// DELETE /users/2/favourites/3
exports.unstar = function(req, res, next) {


    models.Favourite.find({where: {userId: req.session.user.id,
                                   postId: req.post.id }})
        .success(function(favorito) {
            if (favorito)
    	        favorito.destroy()
                    .success(function() {
                        req.flash('success', 'Favorito eliminado con éxito.');
                        res.redirect('/posts/' + req.post.id );
                    })
                    .error(function(error) {
                        next(error);
                });
            });

}

// GET /users/2/favourites
exports.index = function(req, res, next) {

    var format = req.params.format || 'html';
    format = format.toLowerCase();

    models.Post
        .findAll({order: 'updatedAt DESC',
                    include: [ { model: models.User, as: 'Author' }  , 
                  models.Comment, models.Favourite ]
          })
        .success(function(posts) {

            // Entrega 4

            if ( req.session.user ) {

                for ( var i in posts ){
                  for ( var j in posts[i].favourites) {

                    if ( posts[i].favourites[j].userId == req.session.user.id )

                      posts[i].isFavourite = true;

                    else 

                      posts[i].isFavourite = false;

                  }
                }

            }

            // Entrega 3
            // Obtener el número de comentarios para todos los posts
          
            switch (format) { 
              case 'html':
              case 'htm':
                  res.render('favourites/index', {
                    posts: posts
                    , cont: res.cont
                  });
                  break;
              case 'json':
                  res.send(posts);
                  break;
              case 'xml':
                  res.send(posts_to_xml(posts));
                  break;
              case 'txt':
                  res.send(posts.map(function(post) {
                      return post.title+' ('+post.body+')';
                  }).join('\n'));
                  break;
              default:
                  console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                  res.send(406);
            }

        })
        .error(function(error) {
            next(error);
        });
}