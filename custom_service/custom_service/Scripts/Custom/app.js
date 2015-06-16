//TODO: split into diffrent files(controller,services and etc)
/// <reference path="Types/angularTp.ts" />
/// <reference path="Types/angular-routeTp.ts" />
var Extensions;
(function (Extensions) {
    var Person = (function () {
        function Person() {
        }
        return Person;
    })();
    Extensions.Person = Person;

    var Position = (function () {
        function Position() {
        }
        return Position;
    })();
    Extensions.Position = Position;
})(Extensions || (Extensions = {}));

var OneStopTechVidsApp;
(function (OneStopTechVidsApp) {
    var Config = (function () {
        function Config($routeProvider) {
            $routeProvider.when("/list", { templateUrl: "/Scripts/Custom/Templates/PeopleListTmpl.html", controller: "PeopleListCtrl" }).otherwise({ redirectTo: '/list' });
        }
        return Config;
    })();
    OneStopTechVidsApp.Config = Config;
    Config.$inject = ['$routeProvider'];

    var PeopleDataSvc = (function () {
        function PeopleDataSvc($http, $q) {
            this.techVidsApiPath = "api/techVideos";
            this.categoriesApiPath = "api/categories";

            this.httpService = $http;
            this.qService = $q;
        }
        PeopleDataSvc.prototype.getAllPeople = function (fetchFromService) {
            var self = this;

            if (fetchFromService) {
                return getPeopleFromService();
            } else {
                if (self.people !== undefined) {
                    return self.qService.when(self.people);
                } else {
                    return getPeopleFromService();
                }
            }

            function getPeopleFromService() {
                var deferred = self.qService.defer();

                self.httpService.get(self.techVidsApiPath).then(function (result) {
                    self.people = result.data;
                    deferred.resolve(self.people);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        PeopleDataSvc.prototype.checkIfPersonExists = function (name) {
            var self = this;

            var deferred = self.qService.defer();

            self.httpService.get(self.techVidsApiPath + "?name=" + name).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        PeopleDataSvc.prototype.getPeopleByPosition = function (id) {
            var self = this;

            var filteredPeople = [];

            if (self.people !== undefined) {
                return self.qService.when(filterPeople());
            } else {
                var deferred = self.qService.defer();
                self.getAllPeople().then(function (data) {
                    deferred.resolve(filterPeople());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterPeople() {
                for (var counter = 0; counter < self.people.length; counter++) {
                    if (self.people[counter].category === id) {
                        filteredPeople.push(self.people[counter]);
                    }
                }

                return filteredPeople;
            }
        };

        PeopleDataSvc.prototype.getPerson = function (id) {
            var self = this;

            if (self.people !== undefined) {
                return self.qService.when(filterPerson());
            } else {
                var deferred = self.qService.defer();

                self.getAllPeople().then(function (data) {
                    deferred.resolve(filterPerson());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterPerson() {
                for (var counter = 0; counter < self.people.length; counter++) {
                    if (id === self.people[counter].id) {
                        return self.people[counter];
                    }
                }

                return null;
            }
        };

        PeopleDataSvc.prototype.getAllPositions = function () {
            var self = this;

            if (self.positions !== undefined) {
                return self.qService.when(this.positions);
            } else {
                var deferred = self.qService.defer();

                self.httpService.get(self.categoriesApiPath).then(function (result) {
                    self.positions = result.data;
                    deferred.resolve(self.positions);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        PeopleDataSvc.prototype.getPosition = function (id) {
            var self = this;

            if (self.positions !== undefined) {
                return self.qService.when(filterPosition());
            } else {
                var deferred = self.qService.defer();

                self.getAllPositions().then(function (data) {
                    deferred.resolve(filterPosition());
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function filterPosition() {
                for (var counter = 0; counter < self.positions.length; counter++) {
                    if (self.positions[counter].id === id) {
                        return self.positions[counter];
                    }
                }
                return null;
            }
        };

        PeopleDataSvc.prototype.updatePerson = function (video) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.put(self.techVidsApiPath + "/" + video.id, video).then(function (data) {
                for (var counter = 0; counter < self.people.length; counter++) {
                    if (self.people[counter].id === video.id) {
                        self.people[counter] = video;
                        break;
                    }
                }
                deferred.resolve();
            }, function (error) {
                deferred.reject();
            });

            return deferred.promise;
        };

        PeopleDataSvc.prototype.addPerson = function (video) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.post(self.techVidsApiPath, video).then(function (result) {
                video.id = result.data.id;
                self.people.push(video);
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        PeopleDataSvc.prototype.deletePerson = function (id) {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.delete(self.techVidsApiPath + "/" + id).then(function (result) {
                for (var counter = 0; counter < self.people.length; counter++) {
                    if (self.people[counter].id === id) {
                        self.people.splice(counter, 1);
                        break;
                    }
                }
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        PeopleDataSvc.PeopleDataSvcFactory = function ($http, $q) {
            return new PeopleDataSvc($http, $q);
        };
        return PeopleDataSvc;
    })();
    OneStopTechVidsApp.PeopleDataSvc = PeopleDataSvc;

    //export class TechVidsCategoryCtrl {
    //    private $scope: Extensions.ITechVidsCategoryScope;
    //    private dataSvc: TechVidsDataSvc;
    //    private init(): void {
    //        var self = this;
    //        self.dataSvc.getAllCategories().then(function (data) {
    //            self.$scope.categories = data;
    //        });
    //    }
    //    constructor($scope: Extensions.ITechVidsCategoryScope, techVidsDataSvc: TechVidsDataSvc) {
    //        this.$scope = $scope;
    //        this.dataSvc = techVidsDataSvc;
    //        this.init();
    //    }
    //}
    //TechVidsCategoryCtrl.$inject = ['$scope', 'techVidsDataSvc'];
    var PeopleListCtrl = (function () {
        function PeopleListCtrl($scope, $routeParams, dataSvc) {
            var self = this;

            self.$scope = $scope;
            self.$routeParams = $routeParams;
            self.dataSvc = dataSvc;

            self.init();
        }
        PeopleListCtrl.prototype.init = function () {
            var self = this;

            if (self.$routeParams.id !== undefined) {
                self.dataSvc.getPeopleByPosition(parseInt(this.$routeParams.id)).then(function (data) {
                    self.$scope.People = data;
                });
            } else {
                self.dataSvc.getAllPeople().then(function (data) {
                    self.$scope.People = data;
                });
            }
        };
        return PeopleListCtrl;
    })();
    OneStopTechVidsApp.PeopleListCtrl = PeopleListCtrl;
    PeopleListCtrl.$inject = ['$scope', '$routeParams', 'peopleDataSvc'];

    //export class EditTechVideoCtrl {
    //    private $scope: Extensions.ITechVidEditScope;
    //    private dataSvc: TechVidsDataSvc;
    //    private $routeParams: Extensions.ITechVidsRouteParams;
    //    private init(): void {
    //        var self = this;
    //        self.$scope.name = /^[a-zA-Z ]*$/;
    //        self.dataSvc.getVideo(parseInt(this.$routeParams.id)).then(function (data) {
    //            self.$scope.video = data;
    //            self.dataSvc.getCategory(self.$scope.video.category)
    //                .then(function (result) {
    //                    self.$scope.category = result;
    //                });
    //        });
    //        self.dataSvc.getAllCategories().then(function (data) {
    //            self.$scope.categories = data;
    //        });
    //    }
    //    constructor($scope: Extensions.ITechVidEditScope, $routeParams: Extensions.ITechVidsRouteParams, $window: ng.IWindowService, dataSvc: TechVidsDataSvc) {
    //        var self = this;
    //        self.$scope = $scope;
    //        self.$routeParams = $routeParams;
    //        self.dataSvc = dataSvc;
    //        self.$scope.editVideo = function () {
    //            self.$scope.video.category = self.$scope.category.id;
    //            dataSvc.updateVideo(self.$scope.video).then(function (parameters) {
    //                self.$scope.techVidForm.$setPristine();
    //                $window.location.href = "#/list/" + self.$scope.video.category;
    //            });
    //        };
    //        self.$scope.deleteVideo = function () {
    //            dataSvc.deleteVideo(self.$scope.video.id).then(function () {
    //                self.$scope.techVidForm.$setPristine();
    //                $window.location.href = "#/list/" + self.$scope.video.category;
    //            });
    //        };
    //        self.init();
    //    }
    //}
    //EditTechVideoCtrl.$inject = ['$scope', '$routeParams', '$window', 'techVidsDataSvc'];
    //export class AddVideoCtrl {
    //    $scope: Extensions.IAddTechVidScope;
    //    $window: ng.IWindowService;
    //    dataSvc: TechVidsDataSvc;
    //    constructor($scope: Extensions.IAddTechVidScope, $window: ng.IWindowService, dataSvc: TechVidsDataSvc) {
    //        var self = this;
    //        self.$scope = $scope;
    //        self.$window = $window;
    //        self.dataSvc = dataSvc;
    //        self.$scope.name = /^[a-zA-Z ]*$/;
    //        self.$scope.addVideo = function () {
    //            self.$scope.video.rating = 4;
    //            self.$scope.video.category = self.$scope.category.id;
    //            dataSvc.addVideo(self.$scope.video).then(function () {
    //                var category = self.$scope.video.category;
    //                self.$scope.video = { id: 0, title: "", description: "", category: 0, author: "", rating: 0 };
    //                self.$scope.techVidForm.$setPristine();
    //                self.$window.location.href = "#/list/" + category;
    //            });
    //        };
    //        self.$scope.cancelVideo = function () {
    //            self.$scope.video = new Extensions.Video();
    //            self.$scope.category = null;
    //            self.$scope.techVidForm.$setPristine();
    //        };
    //        self.init();
    //    }
    //    private init(): void {
    //        var self = this;
    //        self.dataSvc.getAllCategories().then(function (data) {
    //            self.$scope.categories = data;
    //        });
    //    }
    //}
    //AddVideoCtrl.$inject = ['$scope', '$window', 'techVidsDataSvc'];
    var app = angular.module("peopleApp", ['ngRoute', 'ngResource']);
    app.config(Config);
    app.factory('peopleDataSvc', ['$http', '$q', PeopleDataSvc.PeopleDataSvcFactory]);
    app.controller('PeopleListCtrl', PeopleListCtrl);
})(OneStopTechVidsApp || (OneStopTechVidsApp = {}));
//# sourceMappingURL=app.js.map
