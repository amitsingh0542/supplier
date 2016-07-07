'use strict';

angular.module('tpsecom', ['ngAnimate'])
.service('tpsecom', ['$rootScope', function ($rootScope) {
    this.pop = function (type, title, body, timeout, bodyOutputType) {
        this.tps = {
            type: type,
            title: title,
            body: body,
            timeout: timeout,
            bodyOutputType: bodyOutputType
        };
        $rootScope.$broadcast('tpsuser-newTps');
    };

    this.clear = function () {
        $rootScope.$broadcast('tpsuser-clearTps');
    };
}])
.constant('tpsuserConfig', {
    'limit': 0,                   // limits max number of tpss 
    'tap-to-dismiss': true,
    'newest-on-top': true,
    //'fade-in': 1000,            // done in css
    //'on-fade-in': undefined,    // not implemented
    //'fade-out': 1000,           // done in css
    // 'on-fade-out': undefined,  // not implemented
    //'extended-time-out': 1000,    // not implemented
    'time-out': 5000, // Set timeOut and extendedTimeout to 0 to make it sticky
    'icon-classes': {
        error: 'tps-error',
        info: 'tps-info',
        success: 'tps-success',
        warning: 'tps-warning'
    },
    'body-output-type': '', // Options: '', 'trustedHtml', 'template'
    'body-template': 'tpsuserBodyTmpl.html',
    'icon-class': 'tps-info',
    'position-class': 'tps-bottom-left',
    'title-class': 'tps-title',
    'message-class': 'tps-message'
})
.directive('tpsuserContainer', ['$compile', '$timeout', '$sce', 'tpsuserConfig', 'tpsecom',
function ($compile, $timeout, $sce, tpsuserConfig, tpsecom) {
    return {
        replace: true,
        restrict: 'EA',
        link: function (scope, elm, attrs) {

            var id = 0;

            var mergedConfig = tpsuserConfig;
            if (attrs.tpsuserOptions) {
                angular.extend(mergedConfig, scope.$eval(attrs.tpsuserOptions));
            }

            scope.config = {
                position: mergedConfig['position-class'],
                title: mergedConfig['title-class'],
                message: mergedConfig['message-class'],
                tap: mergedConfig['tap-to-dismiss']
            };

            scope.configureTimer = function configureTimer(tps) {
                var timeout = typeof (tps.timeout) == "number" ? tps.timeout : mergedConfig['time-out'];
                if (timeout > 0)
                    setTimeout(tps, timeout);
            };

            function addtps(tps) {
                tps.type = mergedConfig['icon-classes'][tps.type];
                if (!tps.type)
                    tps.type = mergedConfig['icon-class'];

                id++;
                angular.extend(tps, { id: id });

                // Set the tps.bodyOutputType to the default if it isn't set
                tps.bodyOutputType = tps.bodyOutputType || mergedConfig['body-output-type']
                switch (tps.bodyOutputType) {
                    case 'trustedHtml':
                        tps.html = $sce.trustAsHtml(tps.body);
                        break;
                    case 'template':
                        tps.bodyTemplate = tps.body || mergedConfig['body-template'];
                        break;
                }

                scope.configureTimer(tps);

                if (mergedConfig['newest-on-top'] === true) {
                    scope.tpsusers.unshift(tps);
                    if (mergedConfig['limit'] > 0 && scope.tpsusers.length > mergedConfig['limit']) {
                        scope.tpsusers.pop();
                    }
                } else {
                    scope.tpsusers.push(tps);
                    if (mergedConfig['limit'] > 0 && scope.tpsusers.length > mergedConfig['limit']) {
                        scope.tpsusers.shift();
                    }
                }
            }

            function setTimeout(tps, time) {
                tps.timeout = $timeout(function () {
                    scope.removetps(tps.id);
                }, time);
            }

            scope.tpsusers = [];
            scope.$on('tpsuser-newTps', function () {
                addtps(tpsecom.tps);
            });

            scope.$on('tpsuser-clearTps', function () {
                scope.tpsusers.splice(0, scope.tpsusers.length);
            });
        },
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            $scope.stopTimer = function (tps) {
                if (tps.timeout) {
                    $timeout.cancel(tps.timeout);
                    tps.timeout = null;
                }
            };

            $scope.restartTimer = function (tps) {
                if (!tps.timeout)
                    $scope.configureTimer(tps);
            };

            $scope.removetps = function (id) {
                var i = 0;
                for (i; i < $scope.tpsusers.length; i++) {
                    if ($scope.tpsusers[i].id === id)
                        break;
                }
                $scope.tpsusers.splice(i, 1);
            };

            $scope.remove = function (id) {
                if ($scope.config.tap === true) {
                    $scope.removetps(id);
                }
            };
        }],
        template:
        '<div  id="tps-container" ng-class="config.position">' +
            '<div ng-repeat="tpsuser in tpsusers" class="tps" ng-class="tpsuser.type" ng-click="remove(tpsuser.id)" ng-mouseover="stopTimer(tpsuser)"  ng-mouseout="restartTimer(tpsuser)">' +
              '<div ng-class="config.title">{{tpsuser.title}}</div>' +
              '<div ng-class="config.message" ng-switch on="tpsuser.bodyOutputType">' +
                '<div ng-switch-when="trustedHtml" ng-bind-html="tpsuser.html"></div>' +
                '<div ng-switch-when="template"><div ng-include="tpsuser.bodyTemplate"></div></div>' +
                '<div ng-switch-default >{{tpsuser.body}}</div>' +
              '</div>' +
            '</div>' +
        '</div>'
    };
}]);
