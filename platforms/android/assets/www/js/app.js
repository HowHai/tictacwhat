// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('tictacwhat', ['ionic', 'tictacwhat.filters', 'tictacwhat.services', 'tictacwhat.controllers']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    controller:  'MainCtrl'
  })
  .state('mode', {
    url: '/mode/:mode/round/:round',
    templateUrl: 'templates/game-board.html',
    controller:  'MainCtrl'
  })
  .state('tutorial', {
    url: '/tutorial',
    templateUrl: 'templates/tutorial.html',
    controller:  'TutorialCtrl'
  })
  .state('score', {
    url: '/score',
    templateUrl: 'templates/score.html',
    controller:  'ScoreCtrl'
  })

  $urlRouterProvider.otherwise('/menu');
});