var app = angular.module('tictacwhat.services', []);

app.factory('ScoreSystem', function($window) {
  // Firebase data storage.
  var fireBase = new Firebase("https://tic-tac-what.firebaseio.com");

  var ScoreSystem = {
    submitScore: function(username, score) {

    // Submit score to firebase.
    fireBase.set({
      username: username,
      score: 190
    });
    },

    updateCurrentScore: function(mode, playerMoves) {
      // Get value based on game mode.
      var modeValue = switch(mode) {
        case 'easy':
          return 1;
          break;
        case 'normal':
          return 3;
          break;
        canse 'hard':
          return 10;
          break;
      }

      // Get point per move based on moves taken already.
      var playerMovesCount = playerMoves.length;
      var movePoint = switch(playerMovesCount) {
        case 1:
          return 1;
          break;
        case 2:
          return 1;
          break;
        case 3:
          return 1;
          break;
        case 4:
          return 5;
          break;
        case 5:
          return 15;
          break;
      }

      // Calculate point.
      var point = switch(movePoint) {
        case 1:
          return 1
          break;
        case 2:
          return 1;
          break;
        case 3:
          return 1;
          break;
        case 4:
          return movePoint * modelValue;
          break;
        case 5:
          return movePoint * modelValue;
          break;
      }

      // Get user's current game score.
      var currentScore = $window.localStorage.getItem('currentScore');

      // Set user's current game score.
      var totalPoints = currentScore ? currentScore + point : 0 + point;
      $window.localStorage.setItem('currentScore', totalPoints);
    }
  };

  return ScoreSystem;
});