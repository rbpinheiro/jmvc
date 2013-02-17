
jmvc.Controller('index', {
    events: {
        'submit form': 'saveName'
    },
    init: function() {
        console.log('this should only be triggered on script load');
    },
    load: function() {
        this.render('test', {'name': 'Rafael'});
        console.log('this should only be triggered on route load');
    },
    unload: function() {
        console.log('this should only be triggered on route unload');
    },
    saveName: function(ev) {
        ev.preventDefault();
        var name = this.$('#name').val();
        this.render('test', {'name': name});
    }
});