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