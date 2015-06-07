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