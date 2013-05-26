var jmvc = {};

(function($) {
    "use strict";
    
    jmvc._config = {
        'controllers_folder': 'js/controller/',
        'views_folder': 'js/view/',
        'models_folder': 'js/model/',
        'default_element': 'body',
        'default_id_key': 'id',
    };
    jmvc._events = {};
    jmvc._controllers = {};
    jmvc._models = {};
    jmvc._libraries = {};
    jmvc._modelID = 0;
    jmvc.controllers = {
        get: function(controller) {
            return jmvc._controllers[controller];
        }
    };
    
    jmvc.models = {
        load: function(model, cb) {
            if (model in jmvc._models) {
                cb.call(jmvc._controller, new jmvc._models[model]());
            } else {
                $.ajax({
                   url:  jmvc._config.models_folder + model +'.js',
                   dataType: 'script',
                   success: function() {
                        cb.call(jmvc._controller, new jmvc._models[model]());
                   },
                   error: function (err, err2, err3, err4) {
                        console.log(err2);
                   }
                });
            }
        }
    };
    
    jmvc.config = function(config) {
        jmvc._config = $.extend(jmvc._config, config);
    };

    jmvc.registerLibrary = function (name, path) {
        jmvc._libraries[name] = {
            path: path,
            loaded: false
        };
    }//TODO: jmvc.registerLibraries

    jmvc._throwError = function (err) {
        throw "JMVCError: " + err;
    }

})(jQuery);
jmvc.Router = (function() {
  jmvc._routes = {
      '404': '404'
  };
  var hash = "";
  var routes_dom;
  
  function updateHash() {
      hash = window.location.hash.replace(/^#!/, '');
  }
  
  function loadController(controller, initialize) {
      if (jmvc._controller !== undefined) {
          jmvc._controller.unbindEvents();
          if (jmvc._controller.unload !== undefined) {
              jmvc._controller.unload();
          }
      }

      jmvc._controller = jmvc._controllers[controller];
      if (jmvc._controller === undefined) {
        jmvc._throwError("Controller \"" + controller + "\" not found");
      }
      if (initialize === true) {
          var dependency
            , loadDependency;

          loadDependency = function(index) {
              dependency = jmvc._controller.dependencies[index];
              if (dependency !== undefined) {
                  if (jmvc._libraries[dependency].loaded === false) {
                      $.ajax({
                         url:  jmvc._libraries[dependency].path,//TODO: error handling
                         dataType: 'script',
                         success: function() {
                             loadDependency(index + 1);
                         },
                         error: function(a, b, error) {
                             
                         }
                      });
                  }
              } else {
                  jmvc._controller.init();
                  jmvc._controller.load();
              }
          }
          loadDependency(0);
      } else {
          jmvc._controller.load();
      }
  }
  
  function goTo(url) {
      url = (jmvc._routes[url]) ? url : '404';
      var controller = jmvc._routes[url].replace(/\//g, '.');
      if (controller in jmvc._controllers) {
          loadController(controller);
      } else {
          $.ajax({
             url:  jmvc._config.controllers_folder + jmvc._routes[url] +'.js',
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

  function Router(config, routes) {
      if (routes !== undefined) {
          jmvc._config = config;
          jmvc._routes = $.extend(jmvc._routes, routes);
      } else {
          jmvc._routes = $.extend(jmvc._routes, config);
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
jmvc.Controller = (function () {
    function splitEvent(ev) {
        var e = ev.split(' ', 1)[0];
        return [e, ev.replace(new RegExp('^'+e+' '), '')];
    }

    function Controller (name, controller) {
        jmvc._controllers[name] = $.extend({
            element: $(jmvc._config.default_element),
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
                var html = new EJS({url: jmvc._config.views_folder + view + '.ejs'}).render(data);
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
    return Controller;
}());
(function () {
    jmvc.modelAdapters = {};

    jmvc.modelAdapters['rest'] = function (model) {
        var _public = {
            save: function(success, error) {
                var request_type = 'POST';
                var url = model.url;
                if (model.get(model.id_key)) {
                    request_type = 'PUT';
                    url += '/' + model.get(model.id_key);
                }
                $.ajax({
                    type: request_type,
                    url: url,
                    data: model.toJson(),
                    success: function(data, textStatus, jqXHR) {
                        model.set(data);
                        if (success) {
                            success(model, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error(self, textStatus, errorThrown);
                        }
                    }
                });
            },
            fetch: function(data, success, error) {
                var url = model.url;
                if (typeof data === 'string' || typeof data === 'number') {
                    url = url + '/' + data;
                }
                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: function(data, textStatus, jqXHR) {
                        var mc = jmvc.ModelCollection(model, data);
                        if (success) {
                            success(mc, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error(model, textStatus, errorThrown);
                        }
                    }
                });
            },
            fetchOne: function(data, success, error) {
                var url = model.url;
                if (typeof data === 'string' || typeof data === 'number') {
                    url = url + '/' + data;
                }
                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: function(data, textStatus, jqXHR) {
                        model.set(data);
                        if (success) {
                            success(model, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error(model, textStatus, errorThrown);
                        }
                    }
                });
            },
            remove: function(success, error) {
                var url = model.url + '/' + model.get(model.id_key);
                $.ajax({
                    type: "DELETE",
                    url: url,
                    data: model.toJson(),
                    success: function(data, textStatus, jqXHR) {
                        model.set(data);
                        if (success) {
                            success(model, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        if (error) {
                            error(model, textStatus, errorThrown);
                        }
                    }
                });
            }
        };

        return _public;
    };

    jmvc.Model = function(name, model) {
        jmvc._models[name] = function() {
            this._eventNamespace = 'model.' + name + jmvc._modelID;
            jmvc._modelID += 1;
            this.adapter = jmvc.modelAdapters['rest'](this);
            this.init();
        };
        
        jmvc._models[name].prototype = $.extend({
            url: '',
            events: {},
            values: {},
            id_key: jmvc._config.default_id_key,
            init: function() {},
            set: function(key, value) {
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
                    jmvc.eventBus.publish(this._eventNamespace, 'change', [key], this);
                    jmvc.eventBus.publish(this._eventNamespace, 'change:'+key, [key], this);
                }
            },
            get: function(key) {
                return this.values[key];
            },
            toJson: function() {
                return this.values;
            },
            bind: function(event, callback) {
                jmvc.eventBus.subscribe(this._eventNamespace, event, callback);
            },
            save: function(success, error) {
                this.adapter.save(success, error);
            },
            fetch: function(data, success, error) {
                this.adapter.fetch(data, success, error);
            },
            fetchOne: function(data, success, error) {
                this.adapter.fetchOne(data, success, error);
            },
            remove: function(success, error) {
                this.adapter.remove(success, error);
            }
        },model);
    };
}());
jmvc.ModelCollection = function(model, data) {
    var _public = {
        data: data || [],
        model: model,
        url: '',
        events: {},
        set: function(key, value) {
            for (var m in this.data) {
                m.set(key, value);
            }
        },
        get: function(key) {
            var values = [];
            for (var m in this.data) {
                values.push(m.get(key));
            }
            return values;
        },
        toJson: function() {
            var values = [];
            for (var m in this.data) {
                values.push(m.toJson());
            }
            return values;
        },
        bind: function(event, callback) {
            for (var m in this.data) {
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
                        success(self, data, textStatus);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (error) {
                        error(self, textStatus, errorThrown);
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
                        success(self, data, textStatus);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (error) {
                        error(self, textStatus, errorThrown);
                    }
                }
            });
        }
    };

    return _public;
};
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