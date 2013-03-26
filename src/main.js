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