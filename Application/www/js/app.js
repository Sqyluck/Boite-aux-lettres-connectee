// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngConstellation'])

.run(function($ionicPlatform, $rootScope, constellationConsumer) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

	constellationConsumer.initializeClient("http://192.168.43.148:8088", "123456789", "Application Ionic");

	constellationConsumer.onConnectionStateChanged(function (change) {
		if (change.newState === $.signalR.connectionState.connected) {
			console.log("Connecté à constellation");
			$rootScope.isConnected = true;

			//State Object Utilisateurs
			constellationConsumer.registerStateObjectLink("*", "Brain", "Users", "*", function(so){
				$rootScope.Users = so.Value;
				$rootScope.$apply();
			});

			//State Object Notifications
			constellationConsumer.registerStateObjectLink("*", "Brain", "Notification", "*", function(so){
                $rootScope.nbNotifs = so.Value.length;
                var Notifs = new Array(so.Value.length);
                var n = so.Value;
                for(var i =0; i <  n.length; i++){
                    var Notif = {};
                    if(n[i].minute < 10){
                        Notif.minute = "0" + n[i].minute;
                    }else{
                        Notif.minute = n[i].minute;
                    }
                    if(n[i].hour < 10){
                        Notif.hour = "0" + n[i].hour;
                    }else{
                        Notif.hour = n[i].hour;
                    }
                    if(n[i].day < 10){
                        Notif.day = "0" + n[i].day;
                    }else{
                        Notif.day = n[i].day;
                    }
                    if(n[i].month < 10){
                        Notif.month = "0" + n[i].month;
                    }else{
                        Notif.month = n[i].month;
                    }
                    Notif.year = n[i].year;
                    Notif.type = n[i].type;
                    Notifs[i] = Notif;
                }
				$rootScope.Notifs = Notifs;
				$rootScope.$apply();
			});

			//State Object newUser
			constellationConsumer.registerStateObjectLink("*", "Brain", "newUser", "*", function(so){
                $rootScope.newUserID = so.Value;
                $rootScope.newUserExpired = so.IsExpired;
                $rootScope.$apply();
            });

			constellationConsumer.registerStateObjectLink("*", "Brain", "ActivateMotor", "*", function(so){
				$rootScope.doorOpened = so.Value;
				$rootScope.$apply();
			});


		}
	});

	constellationConsumer.connect();
	$rootScope.constellation = constellationConsumer;

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.notifications', {
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.utilisateurs', {
      url: '/utilisateurs',
      views: {
        'tab-utilisateurs': {
          templateUrl: 'templates/tab-utilisateurs.html',
          controller: 'ChatsCtrl'
        }
      }
    })

  .state('tab.utilisateurs-add', {
		cache: false,
		url: '/utilisateurs/add',
		views: {
			'tab-utilisateurs': {
				templateUrl: 'templates/tab-ajout.html',
				controller: 'AjoutCtrl'
			}
		}
	})

    .state('tab.user-detail', {
      url: '/utilisateurs/:firstName/:name',
      views: {
        'tab-utilisateurs': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })


  .state('tab.parametres', {
    url: '/parametres',
    views: {
      'tab-parametres': {
        templateUrl: 'templates/tab-parametres.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/notifications');

});
