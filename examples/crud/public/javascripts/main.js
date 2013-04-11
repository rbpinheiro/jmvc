
jmvc.config({
    'default_element': '#content', //element where the views will be loaded, defaults to body
    'default_id_key': '_id', //id key used on models
    'controllers_folder': '/javascripts/controller/',
    'views_folder': '/javascripts/view/',
    'models_folder': '/javascripts/model/'
});

jmvc.registerLibrary('ejs', '/javascripts/libraries/ejs_production.js');

jmvc.Router({
    '': 'index',
    '/new': 'new'
});