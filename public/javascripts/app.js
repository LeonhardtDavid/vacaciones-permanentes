var app = angular.module('vacacionesPermanentes', ['ui.router', 'ui.bootstrap', 'ui.bootstrap.datetimepicker',
    'google.places']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.interceptors.push('authInterceptor');

        $stateProvider
            .state('viajes', {
                url: '/viajes',
                views: {
                    "listView": {
                        templateUrl: "/templates/viajes/list.html",
                        controller: 'ViajesCtrl'
                    },
                    "detailView": {template: ""}
                },
                resolve: {
                    viajesPromise: ['viajes', function (viajes) {
                        return viajes.getAll();
                    }]
                }
            })
            .state('viajes.nuevo', {
                url: '/nuevo',
                views: {
                    "detailView@": {
                        templateUrl: "/templates/viajes/new.html",
                        controller: 'ViajesCtrl'
                    }
                },
                resolve: {
                    viajePromise: ['viajes', function (viajes) {
                        return viajes.get(0);
                    }]
                }
            })
            .state('viajes.detalles', {
                url: '/:id',
                views: {
                    "detailView@": {
                        templateUrl: "/templates/viajes/detalle.html",
                        controller: 'ViajesCtrl'
                    }
                },
                resolve: {
                    viajePromise: ['viajes', '$stateParams', function (viajes, $stateParams) {
                        return viajes.get($stateParams.id);
                    }]
                }
            })
            .state('viajes.edit', {
                url: '/:id/edit',
                views: {
                    "detailView@": {
                        templateUrl: "/templates/viajes/edit.html",
                        controller: 'ViajesCtrl'
                    }
                },
                resolve: {
                    viajePromise: ['viajes', '$stateParams', function (viajes, $stateParams) {
                        return viajes.get($stateParams.id);
                    }]
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
                        $state.go('viajes');
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
                        $state.go('viajes');
                    }
                }]
            });

        $urlRouterProvider.otherwise('viajes');

    }
]);

app.run([
    '$rootScope',
    '$state',
    'authToken',
    function ($rootScope, $state, authToken) {

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

            var token = authToken.getToken();
            var stateName = toState.name;

            if (token === null && stateName != 'login' && stateName != 'register') {
                $state.go('login');
                event.preventDefault();
            }

        });

    }
]);

app.controller('ViajesCtrl', [
    '$scope',
    '$state',
    '$modal',
    'viajes',
    'auth',
    function ($scope, $state, $modal, viajes, auth) {

        $scope.isLoggedIn = auth.isLoggedIn;

        $scope.viajes = viajes.viajes;
        $scope.viaje = viajes.viaje;

        var goViajes = function (res) {
            $state.go('viajes', {}, {reload: true});
        };

        $scope.crearViaje = function () {
            viajes.create($scope.viaje);
        };

        $scope.actualizarViaje = function () {
            viajes.update($scope.viaje).then(goViajes);
        };

        $scope.remove = function(id) {
            viajes.remove(id).then(goViajes);
        };

        $scope.modalEliminarViaje = function (id) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    id: function () {
                        return id;
                    }
                }
            });

            modalInstance.result.then(function (text) {
                $scope.remove(id);
            });

        };

    }
]);

app.controller('DestinoCtrl', [
    '$scope',
    '$modal',
    function ($scope, $modal) {

        $scope.$on( 'g-places-autocomplete:select', function (event, data) {
            console.log(data);
            $scope.destino.ciudad = data.name;
        });

        $scope.cityOptions = { types: ['(cities)'] };

        $scope.agregarDestino = function () {
            if (!$scope.viaje.destinos) $scope.viaje.destinos = [];
            $scope.viaje.destinos.push({});
        };

        $scope.eliminarDestino = function (index) {
            $scope.viaje.destinos.splice(index, 1);
        };

        $scope.modalEliminarDestino = function (index) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    id: function () {
                        return index;
                    }
                }
            });

            modalInstance.result.then(function (text) {
                $scope.eliminarDestino(index);
            });

        };

    }
]);

app.controller('HospedajeCtrl', [
    '$scope',
    function ($scope) {

        $scope.$on( 'g-places-autocomplete:select', function (event, data) {
            console.log(data);
            $scope.destino.hospedaje.nombre = data.name;
            $scope.destino.hospedaje.coordenadas = [
                data.geometry.location.lng(),
                data.geometry.location.lat()
            ];
        });

        $scope.hotelOptions = { types: ['establishment'] };

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
                    $state.go('viajes');
                });
            } else {
                $scope.error.message = "La contraseña no coincide";
            }
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('viajes');
            });
        };
    }
]);

app.controller('ModalInstanceCtrl', [
    '$scope',
    '$modalInstance',
    'id',
    function ($scope, $modalInstance) {

        $scope.remove = function () {
            $modalInstance.close('delete');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }
]);

app.directive('vpOpen', [function () {
    return {
        link: function postLink(scope, element, attrs) {
            element.on('click', function () {
                var className = 'selected';
                $('.' + className).removeClass(className);
                element.addClass(className);
            });
        }
    };
}]);
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
            if (id === 0) return;
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