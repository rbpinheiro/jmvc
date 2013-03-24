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