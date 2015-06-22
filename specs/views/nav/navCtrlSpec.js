'use strict';

describe("NavCtrl", function () {

    var scope, auth, controller;

    beforeEach(function () {
        module('vacacionesPermanentes')
    });

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        auth = {
            isLoggedIn: function () {
                return true;
            },
            currentUser: function () {
                return 'TestUser';
            },
            logOut: function () {
            }
        };
        controller = $controller('NavCtrl', {$scope: scope, auth: auth});
    }));

    it("fills the scope", function () {
        expect(scope.isLoggedIn).toEqual(auth.isLoggedIn);
        expect(scope.currentUser).toEqual(auth.currentUser);
        expect(scope.logOut).toEqual(auth.logOut);
    });

});