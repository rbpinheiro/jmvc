jmvc.Controller('new', {
	dependencies: ['ejs'],
	events: {
		'submit form': 'addMovie'
	},
	load: function () {
		this.render('new');
	},
	addMovie: function (ev) {
		ev.preventDefault();
		var self = this;
		jmvc.models.load('movie', function (movie) {
			movie.set('title', self.$('#title').val());
			movie.set('rating', self.$('#rating').val());
			movie.save(function () {
				window.location = '/';
			});
		});
	}
});