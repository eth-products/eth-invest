ethApp.component("mainComponent", {
    templateUrl: "templates/main/view.html",
    controller: ["$rootScope", function ($rootScope) {
        let $ctrl = this;
        $rootScope.lang = "RU";
    }]
});