"use strict";

var ethApp = angular.module('ethApp', []);
"use strict";

ethApp.service("LangService", ["$rootScope", function ($rootScope) {
  return function () {
    var langs = {
      "RU": {
        "header": {
          "menu": ["О фонде", "Вложения в проект", "Как осуществить вклад", "Транзакции", "Вопросы и ответы"]
        }
      },
      "EN": {}
    };
    return langs[$rootScope.lang];
  };
}]);
"use strict";

ethApp.component("headerComponent", {
  templateUrl: "templates/header/view.html",
  controller: ["LangService", function (LangService) {
    var $ctrl = this;
    $ctrl.menu = LangService().header.menu;
  }]
});
"use strict";

ethApp.component("mainComponent", {
  templateUrl: "templates/main/view.html",
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;
    $rootScope.lang = "RU";
  }]
});