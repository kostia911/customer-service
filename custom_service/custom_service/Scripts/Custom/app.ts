//TODO: split into diffrent files(controller,services and etc)

/// <reference path="Types/angularTp.ts" />
/// <reference path="Types/angular-routeTp.ts" />
module Extensions {
    export class Person {
        id: number;
        title: string;
        description: string;
        author: string;
        rating: number;
        category: number;
    }

    export class Position {
        id: number;
        name: string;
    }

    export interface ITechPeopleScope extends ng.IScope {
        People: Array<Person>;
    }

    export interface ITechPersonEditScope extends ng.IScope {
        person: Person;
        position: Position;
        positions: Array<Position>;
        name: RegExp;
        techVidForm: ng.IFormController;

        editPerson();
        deletePerson(id: number);
    }

    export interface ITechVidsRouteParams extends ng.route.IRouteParamsService {
        id: string;
    }

    export interface ITechVidsCategoryScope extends ng.IScope {
        positions: Array<Position>;
    }

    export interface IAddPersonScope extends ng.IScope {
        person: Person;
        name: RegExp;
        categories: Array<Position>;
        category: Position;
        addPerson(): void;
        techVidForm: ng.IFormController;
    }
}

module OneStopTechVidsApp {
    export class Config {
        constructor($routeProvider: ng.route.IRouteProvider) {
            $routeProvider.when("/list", { templateUrl: "/Scripts/Custom/Templates/PeopleListTmpl.html", controller: "PeopleListCtrl" })
                //.when("/list/:id", { templateUrl: "App/Templates/VideoList.html", controller: "TechVidsListCtrl" })
                //.when("/add", { templateUrl: "App/Templates/AddVideo.html", controller: "AddTechVideoCtrl" })
                //.when("/edit/:id", { templateUrl: "App/Templates/EditVideo.html", controller: "EditTechVideoCtrl" })
                .otherwise({ redirectTo: '/list' });
        }
    }
    Config.$inject = ['$routeProvider'];

    export class PeopleDataSvc {
        private people: Array<Extensions.Person>;
        private positions: Array<Extensions.Position>;
        private pplApiPath: string;
        private categoriesApiPath: string;
        private httpService: ng.IHttpService;
        private qService: ng.IQService;

        constructor ($http: ng.IHttpService, $q: ng.IQService) {
            this.pplApiPath = "home/list";
            this.categoriesApiPath = "api/categories";

            this.httpService = $http;
            this.qService = $q;
        }

        getAllPeople(fetchFromService?: boolean): ng.IPromise<any> {
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

            function getPeopleFromService(): ng.IPromise<any> {
                var deferred = self.qService.defer();

                self.httpService.get(self.pplApiPath).then(function (result: any) {
                    self.people = result.data;
                    deferred.resolve(self.people);
                }, function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }
        }

        checkIfPersonExists(name: string): ng.IPromise<any> {
            var self = this;

            var deferred = self.qService.defer();

            self.httpService.get(self.pplApiPath + "?name=" + name)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        getPeopleByPosition(id: number): ng.IPromise<any> {
            var self = this;

            var filteredPeople: Array<Extensions.Person> = [];

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
        }

        getPerson(id: number): ng.IPromise<any> {
            var self = this;

            if (self.people!== undefined) {
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
        }

        getAllPositions(): ng.IPromise<any> {
            var self = this;

            if (self.positions !== undefined) {
                return self.qService.when(this.positions);
            } else {
                var deferred = self.qService.defer();

                self.httpService.get(self.categoriesApiPath).then(function (result: any) {
                    self.positions = result.data;
                    deferred.resolve(self.positions);
                }, function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }
        }

        getPosition(id: number): ng.IPromise<any> {
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

        }

        updatePerson(video: Extensions.Person): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.put(self.pplApiPath + "/" + video.id, video)
                .then(function (data) {
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
        }

        addPerson(video: Extensions.Person): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.post(self.pplApiPath, video)
                .then(function (result) {
                    video.id = result.data.id;
                    self.people.push(video);
                    deferred.resolve();
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        deletePerson(id: number): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.delete(self.pplApiPath + "/" + id).then(function (result) {
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
        }

        

        public static PeopleDataSvcFactory($http: ng.IHttpService, $q: ng.IQService): PeopleDataSvc {
            return new PeopleDataSvc($http, $q);
        }

    }

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

    export class PeopleListCtrl {
        private $scope: Extensions.ITechPeopleScope;
        private $routeParams: Extensions.ITechVidsRouteParams;
        private dataSvc: PeopleDataSvc;

        private init(): void {
            var self = this;

          
            if (self.$routeParams.id !== undefined) {
                self.dataSvc.getPeopleByPosition(parseInt(this.$routeParams.id))
                    .then(function (data) {
                        self.$scope.People = data;
                    });
            }
          
            else {
                self.dataSvc.getAllPeople().then(function (data) {
                    self.$scope.People = data;
                });
            }
        }

        constructor($scope: Extensions.ITechPeopleScope, $routeParams: Extensions.ITechVidsRouteParams, dataSvc: PeopleDataSvc) {
            var self = this;

            self.$scope = $scope;
            self.$routeParams = $routeParams;
            self.dataSvc = dataSvc;

            self.init();
        }
    }
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

   
    var app = angular.module("peopleApp", ['ngRoute','ngResource']);
    app.config(Config);
    app.factory('peopleDataSvc', ['$http', '$q', PeopleDataSvc.PeopleDataSvcFactory]);
    app.controller('PeopleListCtrl', PeopleListCtrl);
   // app.controller('TechVidsCategoryCtrl', TechVidsCategoryCtrl);
    //app.controller('EditTechVideoCtrl', EditTechVideoCtrl);
    //app.controller('AddTechVideoCtrl', AddVideoCtrl);
   
}