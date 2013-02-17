

jmvc.Controller('name', {
    events: {
        'submit form': 'saveName'
    },
    init: function() {
        console.log('this should only be triggered on script load');
    },
    load: function() {
        console.log('this should only be triggered on route load');
        jmvc.models.load('person', this.personLoaded);
    },
    unload: function() {
        console.log('this should only be triggered on route unload');
    },
    saveName: function(ev) {
        ev.preventDefault();
        var name = this.$('#name').val();
        this.person.set('name', name);
    },
    personLoaded: function(person) {
        this.person = person;
        this.render('test', this.person.toJson());
        
        var self = this;
        this.person.bind('change:name', function() {
            self.nameChanged(this.get('name'));
        });
    },
    nameChanged: function(name) {
        this.$('.name').html(name);
    }
});