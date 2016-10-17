'use strict';

var angular = require('angular'),
    ngTouch = require('angular-touch'),
    ngSanitize = require('angular-sanitize'),
    uiRouter = require('angular-ui-router'),
    mAnimations = require('./animations/_loader'),
    mCtrls = require('./controllers/_loader'),
    mDirectives = require('./directives/_loader'),
    mServices = require('./services/_loader');


/**
 * Register main angular app
 */
angular.module('mApp', [ngTouch, ngSanitize, uiRouter, mAnimations, mCtrls, mDirectives, mServices])
    .config(function ($stateProvider, $urlRouterProvider) {
        'ngInject';

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'tpls/views/home.html',
                controller: 'MyCtrl'
            })
            .state('page1', {
                url: '/page1',
                templateUrl: 'tpls/views/page1.html',
                controller: 'MyCtrl'
            })
            .state('page1.detail', {
                url: '/detail',
                templateUrl: 'tpls/views/detail.html',
                controller: 'DetailCtrl'
            });

        $urlRouterProvider.otherwise('/');
    })

    .directive('contenteditable', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                function read() {
                    ngModel.$setViewValue(element.html());
                }

                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || '');
                };

                element.bind('blur keyup change', function () {
                    scope.$apply(read);
                });
            }
        };
    })


    ;
