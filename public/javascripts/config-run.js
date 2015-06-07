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
