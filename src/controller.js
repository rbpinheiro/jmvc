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