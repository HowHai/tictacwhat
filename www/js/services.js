var app = angular.module('tictacwhat.services', []);

app.factory('ScoreSystem', function($window) {
  // Firebase data storage.
  var fireBase = new Firebase("https://tic-tac-what.firebaseio.com");
  var newScorer = fireBase.child('users');

  var ScoreSystem = {
    submitScore: function(username, score) {
    // Change score to int.
    score = parseInt(score);

    // Submit score to firebase.
    newScorer.push({
      username: username,
      score: score
    });
  },

    // Calculate and update score.
    updateCurrentScore: function(mode, playerMoves) {
      // Get value based on game mode.
      function modeCalculation(mode) {
        switch(mode) {
          case 'easy':
            return 1;
            break;
          case 'normal':
            return 3;
            break;
          case 'hard':
            return 10;
            break;
          default:
            break;
        }
      }
      var modeValue = modeCalculation(mode);


      // Get point per move based on moves taken already.
      var playerMovesCount = playerMoves.length;

      function movePointCalculation(playerMovesCount) {
        switch(playerMovesCount) {
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
      }
      var movePoint = movePointCalculation(playerMovesCount);

      // Calculate point.
      function calculatePoint(playerMovesCount, movePoint) {
        switch(playerMovesCount) {
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
            return movePoint * modeValue;
            break;
          case 5:
            return movePoint * modeValue;
            break;
        }
      }
      var point = calculatePoint(playerMovesCount, movePoint);

      // Get user's current game score.
      var currentScore = $window.localStorage.getItem('currentScore');

      // Set user's current game score.
      var totalPoints = currentScore ? +currentScore + point : 0 + point;
      $window.localStorage.setItem('currentScore', totalPoints);

      return totalPoints;
    },

    // Reset score when user loses.
    resetCurrentScore: function() {
      $window.localStorage.removeItem('currentScore');
      $window.localStorage.removeItem('currentRound');
    },

    // Get all users.
    getAllScores: function() {
      var fireBaseUsers = new Firebase("https://tic-tac-what.firebaseio.com/users");

      var allUsers = {};

      fireBaseUsers.once('value', function (snapshot) {
        allUsers = snapshot.val();
        console.log(allUsers);
      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });
    }
  };


  return ScoreSystem;
});