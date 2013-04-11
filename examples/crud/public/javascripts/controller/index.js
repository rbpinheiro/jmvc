jmvc.Controller('index', {
	//this maps the events to controller functions
	events: {
		//inside the first string we have the event and then the selector separated by an space
		//the second string is the name of the function to be called
		'submit form': 'saveName'
	},
	//declares a list of dependencies to be loaded before the controller
	dependencies: ['ejs'],
	//this will be called only the first time this route is loaded
	init: function () {

	},
	//this will be called every time this route is loaded
	load: function () {
		//renders the view with the name "index"
		jmvc.models.load('movie', function(movieCollection) {
			movieCollection.fetch({}, function(movies) {
				console.log(movies);
			});
		});
		this.render('index');
	},
	//this will be called every time this route is unloaded (other route is loaded)
	unload: function () {

	}
});