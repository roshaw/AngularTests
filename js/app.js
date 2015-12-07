require.config({
    // alias libraries paths
    paths: {
        angular: '../node_modules/angular/angular.min',
        ngSanitize: '../node_modules/angular-sanitize/angular-sanitize.min',
        ngRoute: '../node_modules/angular-route/angular-route.min',
        angularLocalStorage: '../node_modules/angular-local-storage/dist/angular-local-storage.min',
        kendo: '../lib/kendo/js/kendo.all.min',
        jquery: '../node_modules/jquery/dist/jquery.min',
        bootstrap: '../node_modules/bootstrap/dist/js/bootstrap.min',
        lodash: '../node_modules/lodash/index',
        faker: '../node_modules/faker/build/build/faker'
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        'angular': {
            deps: ['jquery'], //load here because of KendoUI
            exports: 'angular'
        },
        ngRoute: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngSanitize: {
            deps: ['angular'],
            exports: 'angular'
        },
        angularLocalStorage: {
            deps: ['angular'],
            exports: 'angular'
        },
        kendo: {
            deps: ['jquery', 'angular'],
            exports: 'angular'
        },
        bootstrap: {
            deps: ['jquery']
        }
    }
});


define([
    'angular',
    'angularLocalStorage',
    'controllers',
    'services',
    'ngRoute',
    'ngSanitize',
    'kendo',
    'jquery',
    'bootstrap',
    'lodash',
    'faker'
],
    function () {
        "use strict";

        (function (angular) {

            var articlesApp = angular.module('articlesApp', [
                'ngRoute',
                'ngSanitize',
                'articlesApp.controllers',
                'articlesApp.services',
                'kendo.directives',
                'LocalStorageModule'
            ]);

            articlesApp.config([
                '$locationProvider',
                '$routeProvider',
                'localStorageServiceProvider',
                '$httpProvider',
                function ($locationProvider, $routeProvider, localStorageServiceProvider, $httpProvider) {
                    $locationProvider.html5Mode(true);

                    localStorageServiceProvider
                        .setPrefix('articlesApp')
                        .setStorageType('localStorage');

                    $routeProvider
                        .when('/:lang', { //Articles list
                            templateUrl : 'templates/home.html',
                            controller : 'ArticlesListCtrl'
                        })
                        .when('/:lang/articles/:articleId', { //Single article
                            templateUrl : 'templates/article.html',
                            controller : 'ArticleCtrl'
                        })
                        .when('/admin/:lang', { //Article grid in Admin
                            templateUrl : 'templates/admin-articles.html',
                            controller : 'AdminArticlesCtrl'
                        })
                        .when('/admin/:lang/articles/add', { //Add new article in admin
                            templateUrl : 'templates/admin-article-form.html',
                            controller : 'AdminAddArticleCtrl'
                        })
                        .when('/admin/:lang/articles/edit/:articleId', { //Edit article in admin
                            templateUrl : 'templates/admin-article-form.html',
                            controller : 'AdminEditArticleCtrl'
                        })
                        .otherwise({ //Redirect to home MainCtrl will set the corect lang or will set EN
                            redirectTo: '/'
                        });

                }]);

            angular.bootstrap(document, ['articlesApp']);

        })(angular);
    });