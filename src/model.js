jmvc.Model = function(name, model) {
    jmvc._models[name] = function() {
        this._eventNamespace = 'model.' + name + jmvc._modelID;
        jmvc._modelID += 1;
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