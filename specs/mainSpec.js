describe('main', function () {

	it('should have a default config', function () {
		expect(jmvc._config).toBeDefined();
		expect(jmvc._config.controllers_folder).toBeDefined();
		expect(jmvc._config.views_folder).toBeDefined();
		expect(jmvc._config.models_folder).toBeDefined();
		expect(jmvc._config.default_element).toBeDefined();
		expect(jmvc._config.default_id_key).toBeDefined();
	});

	it('should have the some default variables defined', function () {
		expect(jmvc._events).toBeDefined();
		expect(jmvc._controllers).toBeDefined();
		expect(jmvc._models).toBeDefined();
		expect(jmvc._libraries).toBeDefined();
		expect(jmvc._modelID).toBeDefined();
	});

	describe('controller management', function () {
		var controllerName = 'testController';

		jmvc.Controller(controllerName, {});

		it('should be able to find a pre-defined controller', function () {
			expect(jmvc.controllers.get(controllerName)).toBeDefined();
		});

		it('should be able to find a pre-defined controller', function () {
			expect(jmvc.controllers.get('nope')).toBeUndefined();
		});
	});

	describe('model management', function () {

		//todo
	});
});