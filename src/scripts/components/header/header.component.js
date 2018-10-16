ethApp.component("headerComponent", {
    templateUrl: "templates/header/view.html",
    controller: ["LangService", function (LangService) {
        let $ctrl = this;
        $ctrl.menu = LangService().header.menu;
    }]
});