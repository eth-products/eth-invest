ethApp.service("LangService", ["$rootScope", function ($rootScope) {
    return function () {
        let langs = {
            "RU": {
                "header": {
                    "menu": ["О фонде", "Вложения в проект", "Как осуществить вклад", "Транзакции", "Вопросы и ответы"]
                }
            },
            "EN": {}
        };


        return langs[$rootScope.lang];
    }
}]);