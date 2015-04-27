var app = angular.module('vpFactories', ['ui.router', 'ui.bootstrap']);

//servicio para viajes
app.factory('viajes', ['$http',
    function ($http) {
        var v = {
            viajes: [],
            viaje: {}
        };

        v.getAll = function () {
            return $http.get('/viajes')
                .success(function (data) {
                    angular.copy(data, v.viajes);
                });
        };

        v.get = function (id) {
            if (id == 0) return angular.copy({translados: [{desde: {}}]}, v.viaje);
            return $http.get('/viajes/' + id)
                .success(function (data) {
                    angular.copy(data, v.viaje);
                });
        };

        v.create = function (viaje) {
            return $http.post('/viajes', viaje)
                .success(function (data) {
                    v.viajes.push(data);
                });
        };

        v.update = function (viaje) {
            return $http.put('/viajes/' + viaje._id, viaje);
        };

        v.remove = function(id) {
            return $http.delete('/viajes/' + id);
        };

        return v;
    }
]);

app.factory('authInterceptor', [
    '$q',
    '$window',
    '$injector',
    'authToken',
    function ($q, $window, $injector, authToken) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                var token = authToken.getToken();
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            response: function (response) {
                return $q.when(response);
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    // handle the case where the user is not authenticated
                    authToken.logOut();

                    // use $injector to get $state to avoid circular dependency
                    var stateService = $injector.get('$state');
                    stateService.go('login');
                }
                return $q.reject(rejection); // use only promise api here, or all would be a success
            }
        };
    }
]);

app.factory('authToken', [
    '$window',
    function ($window) {
        var authToken = {};

        authToken.saveToken = function (token) {
            $window.localStorage['app-token'] = token;
        };

        authToken.getToken = function () {
            return $window.localStorage['app-token'];
        };

        authToken.removeToken = function () {
            $window.localStorage.removeItem('app-token');
        };

        return authToken;
    }
]);

app.factory('auth', [
    '$http',
    '$window',
    '$state',
    'authToken',
    function ($http, $window, $state, authToken) {
        var auth = {};

        auth.isLoggedIn = function () {
            var token = authToken.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = authToken.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function (user) {
            return $http.post('/register', user).success(function (data) {
                authToken.saveToken(data.token);
            });
        };

        auth.logIn = function (user) {
            return $http.post('/login', user).success(function (data) {
                authToken.saveToken(data.token);
            });
        };

        auth.logOut = function () {
            authToken.removeToken();
            $state.go('login');
        };

        return auth;
    }
]);
