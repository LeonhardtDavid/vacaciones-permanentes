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

app.controller('DestinoAutocompleteCtrl', [
    '$scope',
    function ($scope) {

        $scope.$on( 'g-places-autocomplete:select', function (event, data) {
            $scope.destino.ciudad = data.name;
        });

        $scope.cityOptions = { types: ['(cities)'] };

    }
]);

app.controller('HospedajeAutocompleteCtrl', [
    '$scope',
    function ($scope) {

        $scope.$on( 'g-places-autocomplete:select', function (event, data) {
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

app.controller('MapsCtrl', [
    '$scope',
    function ($scope) {
        var coordenadas = $scope.viaje.destinos[0].hospedaje.coordenadas;
        $scope.map = { center: { latitude: coordenadas[1], longitude: coordenadas[0] }, zoom: 3 };
        $scope.markers = [];

        for (var i = 0; i < $scope.viaje.destinos.length; i++) {
            var coords = $scope.viaje.destinos[i].hospedaje.coordenadas;
            $scope.markers.push({ latitude: coords[1],  longitude: coords[0], icon: '/images/hotel.png' });
        }

        $scope.path = [$scope.markers];

        $scope.stroke = {
            color: 'green',
            weight: 3
        };

    }
]);

app.controller('CalendarCtrl', [
    '$scope',
    'viajes',
    function ($scope, viajes) {

        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/ar__es%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Buenos_Aires' // an option!
        };

        $scope.uiConfig = {
            calendar:{
                height: 450,
                editable: true,
                header:{
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            }
        };

    }
]);
