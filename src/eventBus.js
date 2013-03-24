jmvc.eventBus = {
	subscribe: function(namespace, event, callback) {
	    if (!(namespace in jmvc._events)) {
	        jmvc._events[namespace] = {};
	    }
		if (!(event in jmvc._events[namespace])) {
			jmvc._events[namespace][event] = [];
		}
		jmvc._events[namespace][event].push(callback);
	},
	publish: function(namespace, event, args, thisArg) {
	    if (jmvc._events[namespace] && jmvc._events[namespace][event]) {
	        var event = jmvc._events[namespace][event];
			for (var i=0; i< event.length; i++) {
				event[i].apply(thisArg, args);
			}
	    }
	}
};