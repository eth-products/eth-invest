"use strict";

var ethApp = angular.module('ethApp', ['chart.js']);
"use strict";

ethApp.component("aboutComponent", {
  templateUrl: "templates/about/view.html",
  controller: ["LangService", "$rootScope", function (LangService, $rootScope) {
    var $ctrl = this;
    $ctrl.langs = $rootScope.langs;
  }]
});
"use strict";

ethApp.component("circleComponent", {
  templateUrl: "templates/base/circle/view.html",
  bindings: {
    type: "=",
    side: "=",
    // Left and right side
    id: "=" // element id before animate have to be move

  },
  controllerAs: "$ctrl",
  transclude: true,
  controller: ["getElementPosition", "$rootScope", "$element", "$timeout", function (getElementPosition, $rootScope, $element, $timeout) {
    var animateHasBeenPlayed = false;
    var lineEl = null;
    var circleEl = null;
    var $ctrl = this;
    $ctrl.elements = null;

    $ctrl.$onInit = function () {
      switch ($ctrl.type) {
        case "line":
          {
            drawLineComponentWithCircle();
          }
          break;

        case "circle":
          {
            drawCircleComponent();
          }
          break;
      }
    };

    function drawLineComponentWithCircle() {
      // scroll event
      var ev = $rootScope.$on("currentScrollPosition", function (e, scroll) {
        if (animateHasBeenPlayed) {
          ev();
          return false;
        }

        lineEl = $element[0].querySelector('.circle-animate-element-line');
        circleEl = $element[0].querySelector('.circle-animate-element-circle');
        var el = document.getElementById($ctrl.id);
        var elPosition = getElementPosition(el); // top, left positions

        if (!animateHasBeenPlayed && scroll.bottom >= elPosition.top && elPosition.left > 50) {
          animateHasBeenPlayed = true;
          lineEl.style.width = elPosition.left - 50 + 'px';
          circleEl.style.opacity = "1";
          circleEl.style.filter = 'alpha(opacity=100)';
        }
      });
    }

    function drawCircleComponent() {
      var minSize = 10;
      var maxSize = 120;
      var minCount = 2;
      var maxCount = 7;
      var section = document.getElementById($ctrl.id);
      var heightOfSection = section.clientHeight;
      var elPosition = getElementPosition(section); // top, left positions

      $ctrl.elements = _.range(0, _.random(minCount, maxCount));
      $ctrl.elements = _.map($ctrl.elements, function (el, idx) {
        var size = _.random(minSize, maxSize) + 'px';
        var left = _.random(0, document.body.clientWidth) + 'px';
        var top = _.random(0, heightOfSection) + 'px';

        var speed = _.random(0.1, 4);

        return {
          idx: idx,
          speed: speed,
          size: size,
          style: {
            width: size,
            height: size,
            left: left,
            top: top
          }
        };
      });
      $timeout(function () {
        $ctrl.elements = _.map($ctrl.elements, function (el, idx) {
          el.element = document.getElementById('circle-animate-idx-' + $ctrl.id + '-' + el.idx);
          return el;
        });
        $rootScope.$on("currentScrollPosition", function (e, scroll) {
          if (scroll.bottom >= elPosition.top && scroll.top <= elPosition.bottom) {
            var up = scroll.direction === 'up';

            _.each($ctrl.elements, function (el, idx) {
              var latestTopPos = parseFloat($ctrl.elements[idx].element.style.top);
              var posValue = up ? el.speed : -el.speed;
              var nextPos = latestTopPos + posValue;
              var currentPosCircle = getElementPosition(el.element); // top, left positions

              if (currentPosCircle.top + posValue >= elPosition.bottom) {
                nextPos = -(el.element.clientHeight / 2);
              } else if (currentPosCircle.bottom + posValue <= elPosition.top) {
                nextPos = elPosition.h - el.element.clientHeight / 2;
              }

              $ctrl.elements[idx].element.style.top = nextPos + 'px';
            });
          }
        });
      });
    }
  }]
});
"use strict";

ethApp.component("iconAnimateComponent", {
  templateUrl: "templates/base/icon/view.html",
  controllerAs: "$ctrl",
  bindings: {
    name: "=",
    // key name from iconList
    id: "=" // it's need for scrollAnimateIcon id of block

  },
  controller: ["$rootScope", "$element", "getElementPosition", "$q", function ($rootScope, $element, getElementPosition, $q) {
    var $ctrl = this;
    var animate = null;
    var icon = null;
    var parentEl = null;
    var elPosition = null;
    var countOfFrames = null;

    $ctrl.$onInit = function () {
      icon = $rootScope.iconList[$ctrl.name];
      var iconData = new $q(function (resolve) {
        if (!$rootScope.iconList[$ctrl.name].data.op) {
          $rootScope.iconList[$ctrl.name].data = $rootScope.loadedData.json[$ctrl.name];
        }

        resolve($rootScope.iconList[$ctrl.name].data);
      });
      iconData.then(function (res) {
        // $rootScope.iconList[$ctrl.name].data = res;
        var params = {
          container: $element[0],
          renderer: 'svg',
          loop: icon.loop,
          autoplay: icon.play,
          animationData: res
        };
        animate = lottie.loadAnimation(params);

        if (icon.scroll) {
          updateSegmentByScroll();
        }
      });
    };
    /**
     *
     */


    function updateSegmentByScroll() {
      if (!$ctrl.id) throw 'id is undefined';
      parentEl = document.getElementById($ctrl.id);
      elPosition = getElementPosition(parentEl);
      countOfFrames = icon.data.op;
      var currentPosTop = document.body.scrollTop || document.documentElement.scrollTop;
      var screenH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      changeCurrentScroll({
        top: currentPosTop,
        bottom: currentPosTop + screenH
      });
      $rootScope.$on('currentScrollPosition', function (e, currentPos) {
        changeCurrentScroll(currentPos);
      });
    }

    function changeCurrentScroll(pos) {
      if (pos.bottom >= elPosition.top) {
        var screenHeight = window.innerHeight;
        var diffBetweenTopElAndScroll = elPosition.top - pos.top;

        if (diffBetweenTopElAndScroll < 0) {
          return false;
        }

        var percentFrame = 100 - diffBetweenTopElAndScroll / screenHeight * 100;
        var frame = getCurrentFrameByPercent(percentFrame);
        animate.playSegments([frame - 0.000001, frame]);
      } else {
        animate.playSegments([countOfFrames - 0.000001, countOfFrames]);
      }
    }

    function getCurrentFrameByPercent(percent) {
      return countOfFrames * percent / 100;
    }
  }]
});
"use strict";

ethApp.component("tableComponent", {
  templateUrl: "templates/base/table/view.html",
  bindings: {
    data: "="
  },
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;

    $ctrl.$onInit = function () {};
  }]
});
"use strict";

ethApp.component("dashboardComponent", {
  templateUrl: "templates/dashboard/view.html",
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.dashboard = updateDashboard();
    };

    $ctrl.buttonsList = {
      0: {
        id: 0,
        name: "Вложено Etherium",
        active: true
      },
      3: {
        id: 3,
        name: "Калькулятор дохода",
        table: false,
        active: false,
        fields: {
          percents: {
            0: {
              id: 0,
              value: 8,
              active: true
            }
          },
          count: 0.01,
          days: 1
        }
      }
    };
    $ctrl.activeButton = $ctrl.buttonsList[0];

    $ctrl.changeTypeDashboard = function (btn) {
      if ($ctrl.buttonsList[btn.id].active) return false;
      clearAllButton();
      $ctrl.buttonsList[btn.id].active = true;
      $ctrl.activeButton = btn;
    };

    $ctrl.calcIncome = function () {
      if ($ctrl.activeButton.id !== 3) return false;

      if ($ctrl.activeButton.table) {
        $ctrl.activeButton.table = false;
        return false;
      }

      $ctrl.activeButton.tableData = {
        heads: {
          "day": "День",
          "income": "Общий доход"
        }
      };
      $ctrl.activeButton.tableData.body = _.map(_.range(0, $ctrl.activeButton.fields.days), function (day) {
        var activePercentVal = _.find($ctrl.activeButton.fields.percents, "active").value;

        var incomeByDay = $ctrl.activeButton.fields.count * activePercentVal / 100;
        return {
          day: '<span class="text-warning">' + day + '-й день</span>',
          income: (incomeByDay * day).toFixed(2) + ' <span class="text-success"> +' + day * activePercentVal + '%</span>'
        };
      });
      $ctrl.activeButton.table = !$ctrl.activeButton.table;
    };

    $ctrl.updPercentButton = function (btn) {
      if ($ctrl.activeButton.id !== 3) return false;
      buttonsCalcActiveFalse();
      btn.active = true;
    };

    function buttonsCalcActiveFalse() {
      _.each($ctrl.activeButton.fields.percents, function (percent, idx) {
        $ctrl.activeButton.fields.percents[idx].active = false;
      });
    }

    function clearAllButton() {
      _.each($ctrl.buttonsList, function (btn, idx) {
        $ctrl.buttonsList[idx].active = false;
      });
    }

    function updateDashboard() {
      var data = $rootScope.loadedData.json['data'].file;
      return {
        data: data.sumList,
        labels: data.sumList,
        options: {
          maintainAspectRatio: false,
          scaleFontColor: 'white',
          elements: {
            line: {
              fill: false,
              borderWidth: 4,
              borderColor: 'orange'
            },
            point: {
              radius: 0
            }
          },
          scales: {
            yAxes: [{
              id: 'y-axis-2',
              type: 'linear',
              display: true,
              position: 'left',
              ticks: {
                fontColor: "white" // this here

              },
              gridLines: {
                color: "#b767ca"
              }
            }],
            xAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: "white",
                display: false
              }
            }]
          }
        }
      };
    }
  }]
});
"use strict";

ethApp.component("headerComponent", {
  templateUrl: "templates/header/view.html",
  controller: ["LangService", "$rootScope", function (LangService, $rootScope) {
    var $ctrl = this;
    $ctrl.menu = ["about-section", "invest-section", "how-section-top", "transactions-section", "dashboard-section"];
    $ctrl.langs = $rootScope.langs;
  }]
});
"use strict";

ethApp.component("howComponent", {
  templateUrl: "templates/how/view.html",
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.addr = $rootScope.addr;
    };
  }]
});
"use strict";

ethApp.component("infoSectionComponent", {
  templateUrl: "templates/info-section/view.html",
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;
    $ctrl.langs = $rootScope.langs;
    $rootScope.$watch(function () {
      return $rootScope.lang;
    }, function (newVal) {
      $ctrl.lang = newVal;
    });

    $ctrl.$onInit = function () {
      $ctrl.data = angular.copy($rootScope.loadedData.json['data'].file);
      $ctrl.data.balance = $ctrl.data.balance.toFixed(2);
      var now = new Date();
      var startDate = new Date($ctrl.data.startDate);
      var diff = Math.abs(startDate.getTime() - now.getTime());
      $ctrl.data.startDate = Math.ceil(diff / (1000 * 3600 * 24));
    };
  }]
});
"use strict";

ethApp.component("investComponent", {
  templateUrl: "templates/invest/view.html",
  controller: ["$rootScope", function ($rootScope) {
    var $ctrl = this;

    $ctrl.$onInit = function () {
      $ctrl.addr = $rootScope.addr;
    };

    $ctrl.langs = $rootScope.langs;
  }]
});
"use strict";

ethApp.component("latestTransactionComponent", {
  templateUrl: "templates/latest-transaction/view.html",
  controller: ["$rootScope", "$filter", function ($rootScope, $filter) {
    var $ctrl = this;
    var transactionsName = {
      bonus: 'Приглашение',
      invest: 'Инвестирование',
      dividends: 'Дивиденды'
    };

    $ctrl.$onInit = function () {
      $ctrl.dataTable = {
        heads: {
          time: "Время",
          count: 'Количество',
          type: 'Тип',
          address: 'Адрес'
        },
        body: []
      };

      _.each($rootScope.loadedData.json['data'].file.latestTransactions, function (transaction) {
        var data = {
          time: $filter('date')(transaction.date, 'dd.MM.yyyy HH:mm'),
          count: transaction.val,
          type: '<span class="text-warning">' + transactionsName[transaction.type] + '</span>',
          address: "<a href='https://etherscan.io/address/".concat(transaction.who, "'>").concat(transaction.who, "</a>")
        };
        $ctrl.dataTable.body.push(data);
      });
    };
  }]
});
"use strict";

ethApp.component("mainComponent", {
  templateUrl: "templates/main/view.html",
  controller: ["$rootScope", "$scope", function ($rootScope) {
    var $ctrl = this;
  }]
});
"use strict";

ethApp.component("reviewComponent", {
  templateUrl: "templates/review/view.html",
  controller: ["LangService", function (LangService) {
    var $ctrl = this;
    $ctrl.menu = LangService().header.menu;
  }]
});
"use strict";

ethApp.component("topSectionComponent", {
  templateUrl: "templates/top-section/view.html",
  controller: ["LangService", "$rootScope", function (LangService, $rootScope) {
    var $ctrl = this;
    $ctrl.currentLang = $rootScope.lang;
    $ctrl.toogleLang = false;

    $ctrl.changeLang = function (lang) {
      $rootScope.lang = lang;
      $ctrl.currentLang = lang;
      $ctrl.toogleLang = false;
      localStorage.setItem('lang', lang);
    };

    $ctrl.$onInit = function () {
      $ctrl.addr = $rootScope.addr;
    };

    $ctrl.langs = $rootScope.langs;
    $ctrl.languages = $rootScope.availableLangs;
  }]
});
"use strict";

ethApp.run(["$rootScope", function ($rootScope) {
  $rootScope.addr = "0x73b4c7b80dffd2ad1b54a192f56c8c7edcbf12ba";
}]);
"use strict";

ethApp.run(["$rootScope", function ($rootScope) {
  var latestScroll = 0;
  $rootScope.$broadcast("currentScrollPosition");
  document.addEventListener("scroll", function (e) {
    var currentPosTop = document.body.scrollTop || document.documentElement.scrollTop;
    var screenH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var direction = null;

    if (currentPosTop > 0 && latestScroll <= currentPosTop) {
      direction = 'down';
    } else {
      direction = 'up';
    }

    latestScroll = currentPosTop;
    $rootScope.$emit("currentScrollPosition", {
      top: currentPosTop,
      bottom: currentPosTop + screenH,
      direction: direction
    });
  });
}]);
"use strict";

ethApp.run(["$rootScope", function ($rootScope) {
  $rootScope.iconList = {
    "eth-logo": {
      "id": "eth-logo",
      "loop": true,
      "play": true,
      "data": {}
    },
    "about": {
      "id": "about",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "info": {
      "id": "info",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "wallet": {
      "id": "wallet",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "card": {
      "id": "card",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "eth": {
      "id": "eth",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "money": {
      "id": "money",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    },
    "field": {
      "id": "field",
      "loop": false,
      "play": true,
      "scroll": true,
      "data": {}
    }
  };
}]);
"use strict";

ethApp.run(["$rootScope", function ($rootScope) {
  $rootScope.availableLangs = ["RU", "EN"];
  $rootScope.lang = localStorage.getItem("lang") || $rootScope.availableLangs[0];
  localStorage.setItem("lang", $rootScope.lang);
  $rootScope.langs = {
    "RU": {
      // menu section
      "about-section": "О фонде",
      "invest-section": "Вложения в проект",
      "how-section-top": "Как осуществить вклад?",
      "transactions-section": "Транзакции",
      "dashboard-section": "График",
      // Top section
      "top-section-description-with-code": "<h3>Проект по доходу криптовалюты <br> ETH с <a href='https://etherscan.io/address/" + $rootScope.addr + "#code' target='_blank' class='description-eth-invest-link'>Открытым исходным кодом</a></h3> <br> <h3>8% в день! 120% за 15 дней</h3>",
      "top-section-description-more-information": "Инвестируй и зарабатывай! <br>Получай дивиденды каждый час! <br><b>1 ETH</b> => <b>1.2 ETH</b> уже через <b>15 дней</b><a href='#how-section-top' class='eth-invest-more-btn'>Вложить ETH</a>",
      "top-section-description-info-list-min-risk": "Минимальный риск <br> 120% за 15 дней",
      "top-section-description-info-list-guaranteed": "Гарантия выплат <br> обеспечена контрактом",
      "top-section-description-info-list-min-invest": "Вклад от <br><b>0.01</b> ETH",
      "top-section-description-info-list-ref-program": "Реферальная <br> Программа <b>4%</b>",
      // ABOUT SECTION
      "about-section-description": "<h3 class='mb-default-half'>О фонде</h3><p>Контракт запущен в блокчейне <a href='https://www.ethereum.org'>Ethereum</a>. Переписать конткракт или как-нибудь его изменить уже <b>невозможно</b>. Инвестируйте и зарабатывайте, выплаты <b>24 раза</b> в сутки, <b>0.33%</b> каждый час. Реферальная программа <b>4%</b> Вам, <b>+2%</b> к депозиту приглашенного. Вы не можете заработать больше чем <b>120%</b>.</p>",
      // info section
      "info-section-count-of-days": "-й <span>День</span> <br> с запуска",
      "info-section-balance": "Баланс",
      // Invest section
      "invest-section-description": "<h3 class='mb-default-half'>Вложения в проект</h3><p>Для осуществления вклада в проект достаточно перечислить минимум <b>0.01 ETH</b> с вашего ETH кошелька* на адрес <a ng-href ='https://etherscan.io/address/" + $rootScope.addr + "' target='_blank'>смарт-контракта</a>. Блокчейн запомнит адрес кошелька, с которого был сделан вклад и автоматически, каждый час с момента вклада или с последнего удачного списания накопленного процента, будет производить начисления в ETH вкладчикам, пока в фонде для выплат есть средства. Размер начислений составляет <b>8%</b>. <br><span class='text-warning'>Не используйте биржи.</span><span class='text-warning'> Gas лимит: <b>200000</b>. Gas price можно посмотреть <a href='https://ethgasstation.info/' target='_blank'>здесь</a>. </span></p>"
    },
    "EN": {
      // menu section
      "about-section": "About that fund",
      "invest-section": "Invest in the project",
      "how-section-top": "How to invest?",
      "transactions-section": "Transactions",
      "dashboard-section": "Dashboards",
      // Top section
      "top-section-description-with-code": "<h3>Cryptocurrency Income Project <br>  <a href='https://etherscan.io/address/" + $rootScope.addr + "#code' target='_blank' class='description-eth-invest-link'>Open Source ETH contract</a></h3> <br> <h3>8% per day! 120% for 15 days</h3>",
      "top-section-description-more-information": "Invest and earn! <br>Get dividends every hour! <br><b>1 ETH</b> => <b>1.2 ETH</b> after  <b>15 days</b><a href='#how-section-top' class='eth-invest-more-btn'>Invest ETH</a>",
      "top-section-description-info-list-min-risk": "Minimum risk <br> 120% for 15 days",
      "top-section-description-info-list-guaranteed": "Guaranteed payout <br> secured by contract",
      "top-section-description-info-list-min-invest": "Min invest is <br><b>0.01</b> ETH",
      "top-section-description-info-list-ref-program": "Referral <br> Program <b> 4% </b>",
      // ABOUT SECTION
      "about-section-description": "<h3 class = 'mb-default-half'> About the Fund </h3> <p> The contract was launched in the <a href='https://www.ethereum.org'> Ethereum </a> blockchain. Rewrite the contract or somehow change it is already <b> impossible </b>. Invest and earn payout <b> 24 times </b> per day, <b> 0.33% </b> every hour. Referral program <b> 4% </b> to you, <b> +2% </b> to the deposit of the invitee. You cannot earn more than <b> 120% </b>. </p>",
      // info section
      "info-section-count-of-days": " <span>Day</span> <br> from launch",
      "info-section-balance": "Balance",
      // Invest section
      "invest-section-description": "<h3 class = 'mb-default-half'> Investing in the project </h3> <p> To contribute to the project, it’s enough to transfer a minimum of <b> 0.01 ETH </b> from your ETH wallet * to <a ng-href ='https://etherscan.io/address/" + $rootScope.addr + "' target = '_ blank'> smart contract </a>. The blockchain will remember the address of the wallet from which the deposit was made and automatically, every hour from the moment of the deposit or from the last successful write-off of the accrued interest, will accrue to ETH depositors as long as there are funds in the payout fund. Charges are <b> 8% </b>. <br> <span class = 'text-warning'> Do not use exchanges. </span> <span class = 'text-warning'> Gas limit: <b> 200000 </b>. Gas price can be found <a href='https://ethgasstation.info/' target='_blank'> here </a>. </span> </p>"
    }
  };
}]);
"use strict";

ethApp.run(["$rootScope", "$http", "LoaderService", "$timeout", function ($rootScope, $http, LoaderService, $timeout) {
  LoaderService.show();
  var ICON_JSON_TYPE = "icon/json";
  var DATA_JSON_TYPE = "data/json";
  var IMAGE_TYPE = "image";
  var urls = [{
    name: "data",
    path: "assets/data/info.json?v=" + _.random(0, 10000),
    type: DATA_JSON_TYPE
  }, {
    name: "about",
    path: "assets/icons/about.json",
    type: ICON_JSON_TYPE
  }, {
    name: "card",
    path: "assets/icons/card.json",
    type: ICON_JSON_TYPE
  }, {
    name: "eth",
    path: "assets/icons/eth.json",
    type: ICON_JSON_TYPE
  }, {
    name: "eth-logo",
    path: "assets/icons/eth-logo.json",
    type: ICON_JSON_TYPE
  }, {
    name: "field",
    path: "assets/icons/field.json",
    type: ICON_JSON_TYPE
  }, {
    name: "money",
    path: "assets/icons/money.json",
    type: ICON_JSON_TYPE
  }, {
    name: "wallet",
    path: "assets/icons/wallet.json",
    type: ICON_JSON_TYPE
  }, {
    name: "about-background",
    path: "images/about/background.png",
    type: IMAGE_TYPE
  }, {
    name: "attention-background",
    path: "images/attention-section/attention.png",
    type: IMAGE_TYPE
  }, {
    name: "dashboard-background",
    path: "images/dashboard-section/background.png",
    type: IMAGE_TYPE
  }, {
    name: "how-background",
    path: "images/how-section/background.png",
    type: IMAGE_TYPE
  }, {
    name: "information-background",
    path: "images/information/background.png",
    type: IMAGE_TYPE
  }, {
    name: "info-icon-days",
    path: "images/information/icons/days.png",
    type: IMAGE_TYPE
  }, {
    name: "info-icon-1",
    path: "images/information/icons/icon-1.png",
    type: IMAGE_TYPE
  }, {
    name: "info-income",
    path: "images/invest-section/info.png",
    type: IMAGE_TYPE
  }, {
    name: "info-icon-2",
    path: "images/information/icons/icon-2.png",
    type: IMAGE_TYPE
  }, {
    name: "info-icon-3",
    path: "images/information/icons/icon-3.png",
    type: IMAGE_TYPE
  }, {
    name: "invest-background",
    path: "images/invest-section/background.png",
    type: IMAGE_TYPE
  }, {
    name: "top-background",
    path: "images/top-section/background.png",
    type: IMAGE_TYPE
  }, {
    name: "top-icon-1",
    path: "images/top-section/icons/icon-1.png",
    type: IMAGE_TYPE
  }, {
    name: "top-icon-2",
    path: "images/top-section/icons/icon-2.png",
    type: IMAGE_TYPE
  }, {
    name: "top-icon-3",
    path: "images/top-section/icons/icon-3.png",
    type: IMAGE_TYPE
  }, {
    name: "top-icon-4",
    path: "images/top-section/icons/icon-4.png",
    type: IMAGE_TYPE
  }, {
    name: "logo-eth",
    path: "images/logo-eth.png",
    type: IMAGE_TYPE
  }];
  var promises = [];
  $rootScope.loadedData = {
    images: {},
    json: {}
  };

  _.each(urls, function (url) {
    promises.push(new Promise(function (resolve) {
      if (url.type === IMAGE_TYPE) {
        $http.get(url.path, {
          responseType: "blob"
        }).then(function (res) {
          var fileUrl = (window.URL || window.webkitURL).createObjectURL(res.data);
          resolve({
            file: fileUrl,
            type: url.type,
            name: url.name
          });
        });
      } else if (url.type === ICON_JSON_TYPE) {
        var localStorageName = "json-icon-" + url.name;
        var dataFromLocalStorage = JSON.parse(localStorage.getItem("json-icon-" + url.name));

        if (dataFromLocalStorage) {
          resolve({
            file: dataFromLocalStorage,
            type: url.type,
            name: url.name
          });
        } else {
          $http.get(url.path).then(function (res) {
            localStorage.setItem(localStorageName, JSON.stringify(res.data));
            resolve({
              file: res.data,
              type: url.type,
              name: url.name
            });
          });
        }
      } else {
        $http.get(url.path).then(function (res) {
          resolve({
            file: res.data,
            type: url.type,
            name: url.name
          });
        });
      }
    }));
  });

  Promise.all(promises).then(function (values) {
    _.each(values, function (valItem) {
      switch (valItem.type) {
        case ICON_JSON_TYPE:
          {
            $rootScope.loadedData.json[valItem.name] = valItem.file;
          }
          break;

        case IMAGE_TYPE:
          {
            $rootScope.loadedData.images[valItem.name] = valItem; // var img = document.createElement('img');
            // img.src = valItem.file;
            // elementImgPreload.appendChild(img);
          }
          break;

        case DATA_JSON_TYPE:
          {
            $rootScope.loadedData.json[valItem.name] = valItem; // var img = document.createElement('img');
            // img.src = valItem.file;
            // elementImgPreload.appendChild(img);
          }
          break;

        default:
          {
            console.error("unknown type file");
          }
      }
    });

    LoaderService.hide();
    $timeout(function () {
      LoaderService.hideLoader();
    }, 0);
  });
}]);
"use strict";

ethApp.controller("MainController", ["$scope", "$rootScope", function ($scope, $rootScope) {
  $scope.loaded = false;
  $scope.$watch(function () {
    return $rootScope.loaded;
  }, function (cur, old) {
    $scope.loaded = cur;
  });
  $scope.$watch(function () {
    return $rootScope.spinner;
  }, function (cur, old) {
    $scope.spinner = cur;
  });
}]);
"use strict";

ethApp.filter("backgroundSectionUrl", ["$rootScope", function ($rootScope) {
  return function (key, type) {
    switch (type) {
      case 'img':
        {
          return $rootScope['loadedData'].images[key].file;
        }
        break;

      default:
        {
          return {
            "background": 'url("' + $rootScope['loadedData'].images[key].file + '")',
            "background-size": 'cover'
          };
        }
    }
  };
}]);
"use strict";

ethApp.filter('declWordsFilter', [function () {
  return function (input) {
    var number = input.number;
    var after = input.words;
    var cases = [2, 0, 1, 1, 1, 2];
    return after[number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]];
  };
}]);
"use strict";

ethApp.filter('rootScopeFilter', ["$rootScope", function ($rootScope) {
  return function (key) {
    return $rootScope[key];
  };
}]);
"use strict";

ethApp.filter('translateFilter', ["$sce", "$rootScope", function ($sce, $rootScope) {
  return function (val, langs) {
    return $sce.trustAsHtml(langs[$rootScope.lang][val]);
  };
}]);
"use strict";

ethApp.filter('trustHtml', ["$sce", function ($sce) {
  return function (val) {
    return $sce.trustAsHtml(val);
  };
}]);
"use strict";

ethApp.service("getElementPosition", [function () {
  return function (el) {
    var _x = 0;
    var _y = 0;
    var elWidth = el.width || el.offsetWidth;
    var elHeight = el.height || el.offsetHeight;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }

    return {
      top: _y,
      left: _x,
      right: _x + elWidth,
      bottom: _y + elHeight,
      w: elWidth,
      h: elHeight
    };
  };
}]);
"use strict";

ethApp.service('LoaderService', ["$rootScope", function ($rootScope) {
  var loaderId = 'eth-app-loader';
  $rootScope.spinner = true;
  var el = document.getElementById(loaderId);
  return {
    show: function show() {
      el.style.opacity = "1";
      $rootScope.$apply(function () {
        $rootScope.loaded = false;
      });
    },
    hideLoader: function hideLoader() {
      $rootScope.spinner = false;
    },
    hide: function hide() {
      el.style.opacity = "0";
      $rootScope.$apply(function () {
        $rootScope.loaded = true;
      });
    }
  };
}]);
"use strict";

ethApp.service("LangService", ["$rootScope", function ($rootScope) {
  return function (all) {};
}]);