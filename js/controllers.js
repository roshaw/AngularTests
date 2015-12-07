
define(['angular', 'angularLocalStorage'], function () {
    "use strict";
    var articlesAppControllers = angular.module('articlesApp.controllers', []);

    articlesAppControllers.controller('MainCtrl',
        [
            '$scope',
            'localStorageService',
            '$location',
            '$routeParams',
            function ($scope, localStorageService, $location, $routeParams) {
                //Set $location as a $scope variable to be able to use it inside $routeChange function
                $scope.$location = $location;

                //Check url data
                $scope.$on('$routeChangeSuccess', function () {

                    $scope.lang = $routeParams.lang;

                    //Set watcher for change language <select>
                    $scope.$watch('lang', function (newValue, oldValue) {
                        localStorageService.set('lang', newValue);
                        var path = $scope.$location.path();

                        //here can have bug on some corner cases
                        path = path.replace('/' + oldValue, '/' + newValue)
                        $scope.$location.path(path);
                    });

                    var lang = localStorageService.get('lang');

                    if (!localStorageService.get('lang')) {
                        localStorageService.set('lang', 'en');
                    }

                    //Set 'en' for default lang on first load
                    if ($scope.lang !== lang) {
                        $location.path('/en');
                    }
                });
            }]);

    articlesAppControllers.controller('ArticlesListCtrl',
        [
            '$scope',
            'localStorageService',
            '$routeParams',
            function ($scope, localStorageService, $routeParams) {
                $scope.lang = $routeParams.lang;

                //Get active articles
                var articles = _.remove(localStorageService.get('articles'), function (article) {
                        return article.isActive == true;
                    }),
                    now = new Date();

                //Show only articles which date is already come
                $scope.articles = _.remove(articles, function (article) {
                    return new Date(article.date) <= now;
                });
            }]);

    articlesAppControllers.controller('ArticleCtrl',
        [
            '$scope',
            'localStorageService',
            '$routeParams',
            function ($scope, localStorageService, $routeParams) {
                $scope.lang = $routeParams.lang

                var activeArticles = _.remove(localStorageService.get('articles'), function (article) {
                        return article.isActive == true;
                    }),
                    now = new Date(),
                    articles = _.remove(activeArticles, function (article) {
                        return new Date(article.date) <= now;
                    }),
                    articlesLength = articles.length,
                    articleId = $routeParams.articleId,
                    index = _.findIndex(articles, function (article) {
                        return article.id === articleId;
                    });

                if (index > 0 && articlesLength > 1) {
                    $scope.previousUrl = $scope.lang + '/articles/' + articles[index - 1].id;
                }
                if (index <= articlesLength - 2) {
                    $scope.nextUrl = $scope.lang + '/articles/' + articles[index + 1].id;
                }

                $scope.article = articles[index];

            }]);

    articlesAppControllers.controller('AdminArticlesCtrl', [
        '$scope',
        'localStorageService',
        '$routeParams',
        '$location',
        function ($scope, localStorageService, $routeParams, $location) {

            $scope.lang = $routeParams.lang;

            $scope.articles = new kendo.data.ObservableArray(localStorageService.get('articles') ? localStorageService.get('articles') : []);

            $scope.articlesGridOptions = {
                sortable: true,
                selectable: true,
                dataSource: {
                    data: $scope.articles,
                    schema:  {
                        model: {
                            fields: {
                                date: { type: "date" }
                            }
                        }
                    }
                },
                columns: [
                    { field: "date", title: "Date", width: 100, format: "{0:dd.MM.yyyy}"  },
                    { field: $scope.lang + ".title", title: "Article name" },
                    {
                        field: "",
                        title: "Actions",
                        width: 150,
                        template: '<div class="text-center">' +
                            '<button class="btn btn-sm btn-default margin-left-right" ng-click="editArticle(\'#: id #\')">Edit</button>' +
                            '<button class="btn btn-sm btn-danger" ng-click="confirmDelete(\'#:' + $scope.lang + '.title#\',\'#: id #\')">Delete</button>' +
                        '</div>'
                    }
                ]
            };

            $scope.editArticle = function (id) {
                $location.path('/admin/' + $scope.lang + '/articles/edit/' + id);
            };

            $scope.deleteArticle = function (id) {
                var index = _.findIndex($scope.articles, function (article) {
                    return article.id === id;
                });
                $scope.articles.splice(index, 1);
                localStorageService.set('articles', $scope.articles);
                $scope.confirmWindow.close();
            };

            $scope.confirmDelete = function (title, id) {
                $scope.deleteElementTitle = title;
                $scope.deleteElementId = id;
                $scope.confirmWindow.title('Delete confirmation');
                $scope.confirmWindow.center();
                $scope.confirmWindow.open();
            };

            //Reject delete
            $scope.modalNo = function () {
                $scope.confirmWindow.close();
            };

            //Confir delete
            $scope.modalYes = function (id) {
                $scope.deleteArticle(id);
                $scope.confirmWindow.close();
            };
        }]);

    articlesAppControllers.controller('AdminArticleCtrl', [
        '$scope',
        '$routeParams',
        '$timeout',
        function ($scope, $routeParams, $timeout) {
            $scope.lang = $routeParams.lang;

            //Refresh editor on tab change
            $scope.refreshEditor = function (lang) {
                var timer = $timeout(function () {
                    $scope[lang + 'Editor'].refresh();
                }, 300);

                $scope.$on("$destroy", function (event) {
                    $timeout.cancel(timer);
                });
            };

            //First load call refreshEditor EN
            $scope.refreshEditor('en');

            //Disable submit button on cases that not working with require - Editor and DatePicker
            $scope.disableSubmit = function () {
                if (
                    ((_.isEmpty($scope.article.date) && !_.isDate($scope.article.date)) || (!_.isEmpty($scope.article.date) && !_.isDate(new Date($scope.article.date)))) ||
                    _.isEmpty($scope.article.en.content) ||
                    _.isEmpty($scope.article.de.content) ||
                    _.isEmpty($scope.article.bg.content)
                ) {
                    return true;
                }
                return false;
            }

        }]);

    articlesAppControllers.controller('AdminAddArticleCtrl', [
        '$scope',
        'localStorageService',
        '$location',
        '$controller',
        function ($scope, localStorageService, $location, $controller) {

            angular.extend(this, $controller('AdminArticleCtrl', {$scope: $scope}));

            //Set titles
            $scope.page = {
                pageTitle: 'Add new article',
                submitTitle: 'Add article'
            }

            //New article obj
            $scope.article = {
                id: faker.random.uuid(),
                date: '',
                en: {
                    title: '',
                    content: ''
                },
                de: {
                    title: '',
                    content: ''
                },
                bg: {
                    title: '',
                    content: ''
                },
                isActive: false
            };

            $scope.submitForm = function () {
                var articles = localStorageService.get('articles') ? localStorageService.get('articles') : [];
                articles.push($scope.article);

                articles.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(b.date) - new Date(a.date);
                });

                localStorageService.set('articles', articles);
                $location.path('/admin/' + $scope.lang);
            };

        }]);

    articlesAppControllers.controller('AdminEditArticleCtrl', [
        '$scope',
        'localStorageService',
        '$routeParams',
        '$location',
        '$controller',
        function ($scope, localStorageService, $routeParams, $location, $controller) {

            angular.extend(this, $controller('AdminArticleCtrl', {$scope: $scope}));

            var articles = localStorageService.get('articles'),
                articleId = $routeParams.articleId,
                index = _.findIndex(articles, function (article) {
                    return article.id === articleId;
                });

            //Get article for edit
            $scope.article = articles[index];

            //Set titles
            $scope.page = {
                pageTitle: 'Edit article',
                submitTitle: 'Edit article'
            };

            $scope.submitForm = function () {

                articles.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(b.date) - new Date(a.date);
                });

                localStorageService.set('articles', articles);
                $location.path('/admin/' + $scope.lang);
            };

        }]);

    return articlesAppControllers;
});
