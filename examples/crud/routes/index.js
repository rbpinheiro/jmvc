
/*
 * GET home page.
 */
var movies = [],
	cid = 1;


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.getMovies = function(req, res) {
	res.send(movies);
};

exports.saveMovie = function(req, res) {
	var movie = {
		_id: cid,
		title: req.body['title'],
		rating: req.body['rating']
	};
	movies.push(movie);
	cid += 1;
	res.send(movie);
};