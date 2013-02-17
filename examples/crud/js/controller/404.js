
jmvc.Controller('404', {
    init: function() {
        console.log('this should only be triggered on script load');
    },
    load: function() {
        console.log('this should only be triggered on route load');
    },
    unload: function() {
        console.log('this should only be triggered on route unload');
    }
});