
jmvc.config({
    'default_element': '#content',
    'default_id_key': '_id'
});

jmvc.registerLibrary('ejs', 'js/libraries/ejs_production.js');

jmvc.Router({
    '/test': 'index',
    '/login': 'auth/login',
    '/name': 'name',
    '/user': 'user'
});