'use strict';

describe("AuthCtrl", function () {

    var scope, state, auth, deferred, httpBackend, errorMsg, controller;

    beforeEach(module('vacacionesPermanentes'));

    beforeEach(inject(function ($controller, $rootScope, $q, $injector) {
        httpBackend = $injector.get('$httpBackend');

        httpBackend.whenGET("/viajes").respond([]);
        httpBackend.whenGET("/templates/viajes/list.html").respond([]);
        httpBackend.flush();

        scope = $rootScope.$new();

        state = {
            go: function (state) {
            }
        };

        auth = {
            isLoggedIn: function () {
                return true;
            },
            currentUser: function () {
                return 'TestUser';
            },
            logOut: function () {
            },
            logIn: function (user) {
            }
        };

        deferred = $q.defer();

        errorMsg = {error: 'ERROR'};

        spyOn(auth, 'logIn').and.callFake(function () {
            deferred = $q.defer();
            return {
                error: function (x) {
                    x(errorMsg);
                    return deferred.promise
                }
            };
        });

        spyOn(state, 'go').and.callThrough();

        controller = $controller('AuthCtrl', {$scope: scope, $state: state, auth: auth});
    }));

    it("empty initial state", function () {
        expect(scope.error).toEqual({});
        expect(scope.user).toEqual({});
    });

    it("define some methods", function () {
        expect(typeof scope.register).toEqual('function');
        expect(typeof scope.logIn).toEqual('function');
    });

    it("logIn call auth.logIn and set $scope.error on error", function () {
        scope.user = {username: 'david', password: 'ddd'};
        scope.logIn();
        deferred.reject(errorMsg);
        scope.$apply();
        expect(auth.logIn.calls.mostRecent().args).toEqual([scope.user]);
        expect(auth.logIn).toHaveBeenCalled();
        expect(scope.error).toEqual(errorMsg);
    });

    it("logIn call auth.logIn and then go /viajes", function () {
        scope.user = {username: 'david', password: 'ddd'};
        scope.logIn();
        deferred.resolve();
        scope.$apply();
        expect(state.go.calls.mostRecent().args).toEqual(['viajes']);
        expect(state.go).toHaveBeenCalled();
    });

});