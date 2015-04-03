var app = angular.module('vacacionesPermanentes', ['ui.router', 'angularMoment']);

app.controller('MainCtrl', [
    '$scope',
    'auth',
    function ($scope, auth) {

        $scope.isLoggedIn = auth.isLoggedIn;

    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function ($scope, $state, auth) {
        $scope.error = {};
        $scope.user = {};

        $scope.register = function () {
            if ($scope.user.password == $scope.confirm) {
                auth.register($scope.user).error(function (error) {
                    $scope.error = error;
                }).then(function () {
                    $state.go('home');
                });
            } else {
                $scope.error.message = "La contraseña no coincide";
            }
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
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

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('authInterceptor');

        $stateProvider
            .state('home', {
                url: '/home',
                views: {
                    "listView": {
                        templateUrl: "/home.html",
                        controller: 'MainCtrl'
                    },
                    "detailView": {template: ""}
                },
                resolve: {
                    //postPromise: ['posts', function (posts) {
                    //    return posts.getAll();
                    //}]
                }
            })
            .state('login', {
                url: '/login',
                views: {
                    "loginRegisterView": {
                        templateUrl: '/templates/login.html',
                        controller: 'AuthCtrl'
                    }
                },
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                views: {
                    "loginRegisterView": {
                        templateUrl: '/templates/register.html',
                        controller: 'AuthCtrl'
                    }
                },
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });

        $urlRouterProvider.otherwise('home');

    }
]);

app.run([
    '$rootScope',
    '$state',
    'authToken',
    function ($rootScope, $state, authToken) {

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

            var token = authToken.getToken();

            if (token == null && toState.name != 'login') {
                $state.go('login');
                event.preventDefault();
            }

        });

    }
]);
