
jmvc.Controller('user', {
    events: {
        'submit #addUserForm': 'addUser',
        'click .btn-add-user': 'openPopup',
        'click .close-popup': 'closePopup'
        
    },
    dependencies: ['ejs'],
    init: function() {
        this.screenlocker = $('#screenlocker');
    },
    load: function() {
        /*
        jmvc.models.loadCollection('user', function(userColection) {
            
        });
        */
        this.render('user/index');
    },
    openPopup: function(ev) {
        this.popup = $('#' + $(ev.target).data('popup'));
        this.screenlocker.fadeIn();
        this.popup.fadeIn('slow');
    },
    closePopup: function(ev) {
        if (ev) {
            $(ev.target).parents('form').get(0).reset();
        }
        this.popup.fadeOut();
        this.screenlocker.fadeOut();
    },
    addUser: function(ev) {
        ev.preventDefault();
        var self = this;
        jmvc.models.load('user', function(user) {
            user.set(self.$('#addUserForm').serialize());
            user.save(
            function(user) {
                console.log(user);
                //window.location.reload();
            });
        });
    }
});