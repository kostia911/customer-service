//TODO: split into diffrent files(controller,services and etc)

/// <reference path="Types/angularTp.ts" />
/// <reference path="Types/angular-routeTp.ts" />
module Extensions {
    export class Person {
        Id: number;
        LastName: string;
        FirstName: string;
        AboutMe: string;
        Age: number;
        Position: number;
    }

    export class Position {
        id: number;
        name: string;
    }
    export class ngSettings {
        page: number;            // show first page
        count: number;
    }
    export interface nginnerSet{
         page():number;
         count():number;
    }
    export interface ngParams{
    total:number;
    getData($defer:ng.IDeferred<any>, params:nginnerSet);
    }
    export class ngTableParameteres {
        ngset:ngSettings;
        ngparams:ngParams;
     
    }

    export interface ITechPeopleScope extends ng.IScope {
        People: Array<Person>;
        TableParams:ngTableParameteres;
        EditPerson(id:number);

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
                .when("/edit/:id", { templateUrl: "/Scripts/Custom/Templates/EditPerson.html", controller: "EditPersonCtrl" })
                .otherwise({ redirectTo: '/list' });
        }
    }
    Config.$inject = ['$routeProvider'];

    export class PeopleDataSvc {
        private people: Array<Extensions.Person>;
        private positions: Array<Extensions.Position>;
        private pplApiPath: string;
        //TODO remove this one api path
        private pplPutPath:string;
        private categoriesApiPath: string;
        private httpService: ng.IHttpService;
        private qService: ng.IQService;

        constructor ($http: ng.IHttpService, $q: ng.IQService) {
            this.pplApiPath = "home/list";
            //TODO remove this one api path
            this.pplPutPath="home/putPerson";
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
                    if (self.people[counter].Position === id) {
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
                    if (id === self.people[counter].Id) {
                        return self.people[counter];
                    }
                }

                return null;
            }
        }

        getAllPositions(): ng.IPromise<any> {
            var self = this;

            //if (self.positions !== undefined) {
            //    return self.qService.when(this.positions);
            //} else {
            //    var deferred = self.qService.defer();

            //    self.httpService.get(self.categoriesApiPath).then(function (result: any) {
            //        self.positions = result.data;
            //        deferred.resolve(self.positions);
            //    }, function (error) {
            //            deferred.reject(error);
            //        });

            //    return deferred.promise;
            //}
            return null;;
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

        updatePerson(person: Extensions.Person): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.put(self.pplPutPath + "/" + person.Id, person)
                .then(function (data) {
                    for (var counter = 0; counter < self.people.length; counter++) {
                        if (self.people[counter].Id === person.Id) {
                            self.people[counter] = person;
                            break;
                        }
                    }
                    deferred.resolve();
                }, function (error) {
                    deferred.reject();
                });

            return deferred.promise;
        }

        addPerson(person: Extensions.Person): ng.IPromise<any> {
            var self = this;
            var deferred = self.qService.defer();

            self.httpService.post(self.pplApiPath, person)
                .then(function (result) {
                    person.Id = result.data.Id;
                    self.people.push(person);
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
                    if (self.people[counter].Id === id) {
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
        private table:Extensions.ngTableParameteres;

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
    PeopleListCtrl.$inject = ['$scope', '$routeParams','peopleDataSvc','ngTableParams'];

    export class EditPersonCtrl {
        private $scope: Extensions.ITechPersonEditScope;
        private dataSvc: PeopleDataSvc;
        private $routeParams: Extensions.ITechVidsRouteParams;

        private init(): void {
            var self = this;

            self.$scope.name = /^[a-zA-Z ]*$/;
            self.dataSvc.getPerson(parseInt(this.$routeParams.id)).then(function (data) {
                self.$scope.person = data;
                //self.dataSvc.getPosition(self.$scope.person.Position)
                //    .then(function (result) {
                //        self.$scope.position = result;
                //    });
            });

            //self.dataSvc.getAllPositions().then(function (data) {
            //    self.$scope.positions = data;
            //});
        }

        constructor($scope: Extensions.ITechPersonEditScope, $routeParams: Extensions.ITechVidsRouteParams, $window: ng.IWindowService, dataSvc: PeopleDataSvc) {
            var self = this;

            self.$scope = $scope;
            self.$routeParams = $routeParams;
            self.dataSvc = dataSvc;

            self.$scope.editPerson = function () {
                //self.$scope.person.Position = self.$scope.position.id;
                dataSvc.updatePerson(self.$scope.person).then(function (parameters) {
                    //self.$scope.techVidForm.$setPristine();
                    $window.location.href = "#/list/" + self.$scope.person.Position;
                });
            };

            self.$scope.deletePerson = function () {
                dataSvc.deletePerson(self.$scope.person.Id).then(function () {
                    self.$scope.techVidForm.$setPristine();
                    $window.location.href = "#/list/" + self.$scope.person.Position;
                });

            };

            self.init();
        }
    }
    EditPersonCtrl.$inject = ['$scope', '$routeParams', '$window', 'peopleDataSvc'];

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

   
    var app = angular.module("peopleApp", ['ngRoute', 'ngResource','ngTable']);
    app.config(Config);
    app.factory('peopleDataSvc', ['$http', '$q', PeopleDataSvc.PeopleDataSvcFactory]);
    app.controller('PeopleListCtrl', PeopleListCtrl);
    //app.controller('TechVidsCategoryCtrl', TechVidsCategoryCtrl);
    app.controller('EditPersonCtrl', EditPersonCtrl);
    //app.controller('AddTechVideoCtrl', AddVideoCtrl);
   
}