var jmvc = {};

(function($) {
    "use strict";
    var controller;
    function splitEvent(ev) {
        var e = ev.split(' ', 1)[0];
        return [e, ev.replace(new RegExp('^'+e+' '), '')];
    }
    
    var config = {
        'controllers_folder': 'js/controller/',
        'views_folder': 'js/view/',
        'models_folder': 'js/model/',
        'default_element': 'body',
        'default_id_key': 'id',
    };
    var events = {};
    var controllers = {};
    var models = {};
    var libraries = {};
    var modelID = 0;
    jmvc.controllers = {
        get: function(controller) {
            return controllers[controller];
        }
    };
    jmvc.models = {
        load: function(model, cb) {
            if (model in models) {
                cb.call(controller, new models[model]());
            } else {
                $.ajax({
                   url:  config.models_folder + model +'.js',
                   dataType: 'script',
                   success: function() {            
                       cb.call(controller, new models[model]());
                   }
                });
            }
        }
    };
    
    jmvc.config = function(_config) {
        config = $.extend(config, _config);
    };

    jmvc.registerLibrary = function (name, path) {
        libraries[name] = {
            path: path,
            loaded: false
        };
    }//TODO: jmvc.registerLibraries

    jmvc.Router = (function() {
        
        var routes = {
            '404': '404'
        };
        var hash = "";
        var routes_dom;
        
        function updateHash() {
            hash = window.location.hash.replace(/^#!/, '');
        }
        
        function loadController(_controller, initialize) {
            if (controller !== undefined) {
                controller.unbindEvents();
                if (controller.unload !== undefined) {
                    controller.unload();
                }
            }
            controller = controllers[_controller];
            if (initialize === true) {
                var dependency
                  , loadDependency;

                loadDependency = function(index) {
                    dependency = controller.dependencies[index];
                    if (dependency !== undefined) {
                        if (libraries[dependency].loaded === false) {
                            $.ajax({
                               url:  libraries[dependency].path,//TODO: error handling
                               dataType: 'script',
                               success: function() {
                                   loadDependency(index + 1);
                               },
                               error: function(a, b, error) {
                                   
                               }
                            });
                        }
                    } else {
                        controller.init();
                        controller.load();
                    }
                }
                loadDependency(0);
            } else {
                controller.load();
            }
        }
        
        function goTo(url) {
            url = (routes[url]) ? url : '404';
            var controller = routes[url].replace(/\//g, '.');
            if (controller in controllers) {
                loadController(controller);
            } else {
                $.ajax({
                   url:  config.controllers_folder + routes[url] +'.js',
                   dataType: 'script',
                   success: function() {
                       loadController(controller, true);
                   },
                   error: function(a, b, error) {
                       console.log(error);
                   }
                });
            }
        }

        function Router(_config, _routes) {
            if (_routes !== undefined) {
                config = _config;
                routes = $.extend(routes, _routes);
            } else {
                routes = $.extend(routes, _config);
            }
            
            updateHash();
            goTo(hash);
        }
        
        
        $(window).bind('hashchange', function() {
            updateHash();
            goTo(hash);
        });


        return Router;
    })();
    
    jmvc.Controller = function(name, controller) {
        controllers[name] = $.extend({
            element: $(config.default_element),
            events: {},
            dependencies: [],
            init: function() {},
            load: function() {},
            unload: function() {},
            bindEvents: function() {
                var ev;
                for (var e in this.events) {
                    var self = this;
                    this.bind(e, this.events[e]);
                    
                }
            },
            unbindEvents: function() {
                var ev;
                for (var e in this.events) {
                    var self = this;
                    ev = e.split(' ');
                    this.element.find(ev[1]).unbind(ev[0]);
                }
            },
            render: function(element, view, data) {
                if (data === undefined) {
                    var data = view;
                    var view = element;
                    var element = this.element;
                }
                var html = new EJS({url: config.views_folder + view + '.ejs'}).render(data);
                this.element.html(html);
                this.bindEvents();
            },
            $: function(selector) {
                return this.element.find(selector);
            },
            bind: function(ev, handler) {
                var e = splitEvent(ev);
                var self = this;
                this.events[ev] = handler;
                this.$(e[1]).bind(e[0], function(ev) {
                    self[handler].call(self, ev);
                });
                
            }
        },controller);
    };
    
    jmvc.Model = function(name, model) {
        models[name] = function() {
            this._eventNamespace = 'model.' + name + modelID;
            modelID += 1;
            this.init();
        };
        
        models[name].prototype = $.extend({
            url: '',
            events: {},
            values: {},
            id_key: config.default_id_key,
            init: function() {},
            set: function(key, value) {
                //console.log(key, value);
                if (typeof key === 'object') {
                    for (var k in key) {
                        this.set(k, key[k]);
                    }
                } if (typeof key === 'string' && value === undefined) {
                    var values = key.split('&');
                    for (var v=0; v<values.length; v++) {
                        value = values[v].split('=');
                        if (value[1] !== undefined) {
                            this.set(value[0], value[1]);
                        }
                    }
                } else {
                    this.values[key] = value;
                    eventBus.publish(this._eventNamespace, 'change', [key], this);
                    eventBus.publish(this._eventNamespace, 'change:'+key, [key], this);
                }
            },
            get: function(key) {
                return this.values[key];
            },
            toJson: function() {
                return this.values;
            },
            bind: function(event, callback) {
                eventBus.subscribe(this._eventNamespace, event, callback);
            },
            save: function(success, error) {
                var self = this;
                var request_type = 'POST';
                var url = this.url;
                if (this.get(this.id_key)) {
                    request_type = 'PUT';
                    url += '/' + this.get(this.id_key);
                }
                $.ajax({
                    type: request_type,
                    url: url,
                    data: this.toJson(),
                    success: function(data, textStatus, jqXHR) {
                        self.set(data);
                        if (success) {
                            success.call(self, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error.call(self, textStatus, errorThrown);
                        }
                    }
                });
            },
            fetch: function(data, success, error) {
                var url = this.url;
                if (typeof data === 'string' || typeof data === 'number') {
                    url = url + '/' + data;
                }
                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: function(data, textStatus, jqXHR) {
                        this.set(data);
                        if (success) {
                            success.call(self, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error.call(self, textStatus, errorThrown);
                        }
                    }
                });
            },
            delete: function(success, error) {
                var url = this.url + '/' + this.get(this.id_key);
                $.ajax({
                    type: "DELETE",
                    url: url,
                    data: this.toJson(),
                    success: function(data, textStatus, jqXHR) {
                        this.set(data);
                        if (success) {
                            success.call(self, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error.call(self, textStatus, errorThrown);
                        }
                    }
                });
            }
        },model);
    };
    
    jmvc.ModelCollection = function() {};
    
    jmvc.ModelCollection.prototype = {
        url: '',
        events: {},
        modelObjects: {},
        set: function(key, value) {
            for (var m in this.modelObjects) {
                m.set(key, value);
            }
        },
        get: function(key) {
            var values = [];
            for (var m in this.modelObjects) {
                values.push(m.get(key));
            }
            return values;
        },
        toJson: function() {
            var values = [];
            for (var m in this.modelObjects) {
                values.push(m.toJson());
            }
            return values;
        },
        bind: function(event, callback) {
            for (var m in this.modelObjects) {
                values.bind(event, callback);
            }
        },
        save: function(success, error) {
            
        },
        fetch: function(data, success, error) {
            var url = this.url;
            $.ajax({
                type: "GET",
                url: url,
                data: data,
                success: function(data, textStatus, jqXHR) {
                    //this.set(data);
                    if (success) {
                        success.call(self, data, textStatus);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (error) {
                        error.call(self, textStatus, errorThrown);
                    }
                }
            });
        },
        delete: function(success, error) {
            var url = this.url + '/' + this.get(this.id_key);
            $.ajax({
                type: "DELETE",
                url: url,
                data: this.toJson(),
                success: function(data, textStatus, jqXHR) {
                    this.set(data);
                    if (success) {
                        success.call(self, data, textStatus);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (error) {
                        error.call(self, textStatus, errorThrown);
                    }
                }
            });
        }
    };
    
    var eventBus = {
		subscribe: function(namespace, event, callback) {
		    if (!(namespace in events)) {
		        events[namespace] = {};
		    }
			if (!(event in events[namespace])) {
				events[namespace][event] = [];
			}
			events[namespace][event].push(callback);
		},
		publish: function(namespace, event, args, thisArg) {
		    if (events[namespace] && events[namespace][event]) {
		        var event = events[namespace][event];
    			for (var i=0; i< event.length; i++) {
    				event[i].apply(thisArg, args);
    			}
		    }
		}
	};
})(jQuery);