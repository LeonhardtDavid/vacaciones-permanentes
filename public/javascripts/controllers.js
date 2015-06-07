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
