jmvc.Model('person', {
    attributes: {
        'name': 'string'
    },
    init: function() {
        this.set('name', 'Rafael');
    },
    load: function() {
        console.log('this should only be triggered on route load');
    },
    unload: function() {
        console.log('this should only be triggered on route unload');
    }
});