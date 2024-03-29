var app = angular.module('tictacwhat.controllers', []);

app.controller('MainCtrl', function($scope, $timeout, $ionicPopup, $window, $state, ScoreSystem, $stateParams) {
  Array.prototype.last = function(){
    return this[this.length -1];
  }

  // game data
  $scope.gameStatus = {};
  $scope.currentUser = {};
  $scope.gamePopup = {};
  $scope.showPopup = {};
  $scope.currentUser.username = $window.localStorage.getItem('username');
  $scope.currentUser.topScore = $window.localStorage.getItem('topScore');
  $scope.currentUser.currentScore = $window.localStorage.getItem('currentScore') || 0;
  $scope.gameStatus.mode = $stateParams.mode;

  $scope.gameStatus.round = $window.localStorage.getItem('currentRound') || 1;
  if ($scope.gameStatus.round <= 1) {
    $scope.gameStatus.title = 'Click Play';
  } else {
    $scope.gameStatus.title = "Round " + $scope.gameStatus.round;
  }

  // Check game mode.
  $scope.checkGameMode = function(territory) {
    if ($scope.gameStatus.mode == 'easy') {
      return 'white';
    }
  }


  $scope.showPopup.over = function() {
    $scope.data = {};
    $scope.data.gameScore = $window.localStorage.getItem('currentScore');

    $scope.gamePopup.over = $ionicPopup.show({
      templateUrl: 'templates/game-over-modal.html',
      scope: $scope
    });
  };

  $scope.showPopup.draw = function() {
    // $scope.data = {};
    // $scope.data.gameScore = $window.localStorage.getItem('currentScore');

    $scope.gamePopup.draw = $ionicPopup.show({
      templateUrl: 'templates/game-draw-modal.html',
      scope: $scope
    });
  };

  $scope.showPopup.start = function() {

    $scope.gamePopup.start = $ionicPopup.show({
      templateUrl: 'templates/start-popup.html',
    });
  };

  // Submit score
  $scope.submitScore = function() {
    // Save username to localStorage.
    $window.localStorage.setItem('username', $scope.currentUser.username);

    ScoreSystem.submitScore($scope.currentUser.username, $scope.data.gameScore);

    $scope.gameStatus.message = 'Score submitted!';
  }

  var getInnerText = function(id) {
    return document.getElementById(id).innerText;
  }

  function displayStatus(message){
    $scope.status.message = message;
  };

  $scope.returnToMenu = function() {
    $state.go('menu');
  }

  $scope.status = {};
  var playerOneMoves = [];
  var gameBoard = [];
  var newBoard = [];
  var botMoves = [];
  var fatalBlow = [];
  var gameOver = true;
  var botMode = true;
  var randomBoard = [];
  $scope.status.message = "0";

  $scope.gameBoard = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  var winCondition = [
                          [0,1,2], [3,4,5], [6,7,8],
                          [0,3,6], [1,4,7], [2,5,8],
                          [0,4,8], [2,4,6]
                     ];

  // Restart game.
  $scope.restartGame = function(gameStatus) {
    if (gameStatus == 'over') {
      $scope.gamePopup.over.close();
    } else if(gameStatus == 'draw') {
      $scope.gamePopup.draw.close();
    }

    $state.go($state.current, {}, {reload: true});
  }

  $scope.botMode = function(){
    botMode = true;

    $timeout(function(){
      makeNewBoard(newBoard);
      // generateBoard(newBoard);
      $scope.gameBoard = newBoard;
    }, 1000);

    // When game starts, show countdown.
    $scope.status.message = 1;
    runCounter();
  };

  function runCounter()
  {
    $scope.status.message -= 1;
    if ( $scope.status.message > 0)
      $timeout(runCounter, 1000);

    if ($scope.status.message == 0)
    {
      $scope.showPopup.start();
      $timeout(function() {
        $scope.gamePopup.start.close();
        gameOver = false;
        $scope.gameStatus.title = "Round " + $scope.gameStatus.round;
        $scope.status.message = 0;
      }, 1000);
    }
  }

  // Generate a random board on page load
  makeNewBoard(randomBoard);
  generateBoard(randomBoard);
  var originalBoard = randomBoard;

  // Make function to assign gameBoard's elements to its respective index
  function makeNewBoard(board) {
    var oldBoard = $scope.gameBoard.slice(0);

    for (var i = oldBoard.length; i > 0; i--)
    {
      var randChar = oldBoard[Math.floor(Math.random() * oldBoard.length)];
      board.push(randChar);
      var index = oldBoard.indexOf(randChar);

      if (index > -1)
        oldBoard.splice(index, 1);
    }
  }

  // Make function to reassign board
  function generateBoard(board)
  {
    for(var i = 0; i < board.length; i++)
    {
      var newChar = board[i];
      $scope.gameBoard[i] = newChar;
    };
  }

  // Return true if area is taken
  function areaTaken(territory){
    var getTerritory = getInnerText(territory);
    var takenUnits   = ['X', 'O'];

    return takenUnits.indexOf(getTerritory) != -1 ? true : false;
  };

  // Find original index and push it to array.
  function pushOriginalPosition(player, indexSelected) {
    var oldCell = $scope.gameBoard[indexSelected];
    var originalIndex = originalBoard.indexOf(oldCell);
    player.push(originalIndex);

    // Set current score.
    $scope.currentUser.currentScore = ScoreSystem.updateCurrentScore($scope.gameStatus.mode, player);
  }

  $scope.selectedTerritory = function(selected){
    var getDiv = document.getElementById(selected);
    var taken = areaTaken(selected);
    var XorO = gameBoard.length % 2 == 0 ? "X" : "O";

    function playerAction(player, turn){
      pushOriginalPosition(player, selected);
      gameBoard.push(selected);
      getDiv.innerHTML = "<span>" + XorO + "</span>";
      displayStatus(turn);
    };

    if (XorO == 'X' && !taken && !gameOver)
    {
      playerAction(playerOneMoves, "0");
      if (botMode)
      {
        botAI();
      }
    }

    winCheck(winCondition, playerOneMoves, "0");
    winCheck(winCondition, botMoves, "0");
  };

  function winCheck(winCondition, playerMoves, message) {
    for (var i = 0; i < winCondition.length; i++){
      var winComb = winCondition[i].filter(function(value){
        return playerMoves.indexOf(value) != -1;
      })

      if (winComb.length == 3)
        {
          // Reset user's current score.
          $scope.showPopup.over();
          ScoreSystem.resetCurrentScore();

          displayStatus(message);
          gameOver = true;
          break;
        }
    }
    if (playerMoves.length == 5 && gameOver == false)
    {
      // Continue playing.
      $scope.showPopup.draw();
      ++$scope.gameStatus.round;
      $window.localStorage.setItem('currentRound', $scope.gameStatus.round);

      gameOver = true;
    }
  };

  // TODO: Remove all winCondition... do not need.
  function botMoveChecker(winCondition, player, decision){
    for (var i = 0; i < winCondition.length; i++)
    {
      var winningComb = winCondition[i].filter(function(value){
        return player.indexOf(value) != -1;
      })

      var winningMove = winCondition[i].filter(function(value){
        return player.indexOf(value) == -1;
      })

      var winningMoveNewIndex = getNewIndex(winningMove[0]);

      if (winningComb.length == 2 && !areaTaken(winningMoveNewIndex))
      {
        return fatalBlow = winningMove;
        break;
      }

      // Decision is true when player makes trap/odd moves
      if (decision && winningComb.length == 1)
      {
        console.log('decision:', 'true');
        var moveOne = Math.abs(botMoves.last() - winningMove[0]);
        var moveTwo = Math.abs(botMoves.last() - winningMove[1]);
        var winningComb = getNewIndex(winningComb[0]);
        var winningMoveOne = winningMove[0];
        var winningMoveTwo = winningMove[1];

        var moveToTake = moveOne > moveTwo ? winningMove[0] : winningMove[1];
        if (areaTaken(winningComb) && !areaTaken(winningMoveOne) && !areaTaken(winningMoveTwo))
        {
          // Hacky solution to bot's only weakness
          var indexOne = getNewIndex(1);
          var indexEight = getNewIndex(8);
          console.log('hacky:', 'true');
          console.log('move:', moveToTake);

          fatalBlow = (areaTaken(indexOne) && areaTaken(indexEight) && gameBoard.length == 5) ? 6 : moveToTake;
          var moveIndex = getNewIndex(moveToTake);

          // Hacky fix for glitch on weird move.
          if (areaTaken(moveIndex)) {
            // Check for avaliable corner.
            var cornerOne = getNewIndex(0);
            var cornerTwo = getNewIndex(2);
            var cornerThree = getNewIndex(6);
            var cornerFour = getNewIndex(8);

            if (!areaTaken(cornerOne)) {
              fatalBlow = 0;
            } else if (!areaTaken(cornerTwo)) {
              fatalBlow = 2;
            } else if (!areaTaken(cornerThree)) {
              fatalBlow = 6;
            } else if (!areaTaken(cornerFour)) {
              fatalBlow = 8;
            }

          }
          break;
        }
        else if (areaTaken(winningMoveOne) && areaTaken(winningMoveTwo))
        {
          var indexThree = getNewIndex(3);
          console.log('weird:', indexThree);
          fatalBlow = areaTaken(indexThree) ? 1 : 3
        }
      }
    }
  };

  function calculateBotMove(player, bot){
    // Make winning move if available
    botMoveChecker(winCondition, bot);

    // Bot reacts to player's move
    if (fatalBlow.length == 0)
      botMoveChecker(winCondition, player);
  };

  // AI MADNESS
  function botAI(){
    function pushData(data){
      console.log('data:', data);
      document.getElementById(data).innerHTML = "<span>O</span>";
      pushOriginalPosition(botMoves, data);
      gameBoard.push(data);
      fatalBlow = [];
    }

    var randMove = [0,2,6,8][Math.floor(Math.random() * [0,2,6,8].length)];

    // Take random corner if center is taken on first move
    if (gameBoard.length == 1) {
      var index = getNewIndex(4);
      var randomIndex = getNewIndex(randMove);

      areaTaken(index) ? pushData(randomIndex) : pushData(index);
    }
    else if (playerOneMoves.length < 5)
    {
      calculateBotMove(playerOneMoves, botMoves);
      if (fatalBlow.length == 1 && !isNaN(fatalBlow))
      {
        var index = getNewIndex(fatalBlow[0]);
        pushData(index);
      }
      else
      {
        botMoveChecker(winCondition, botMoves, true);
        console.log('dFatal:', fatalBlow);
        var index = getNewIndex(fatalBlow);
        pushData(index);
      }
    }

  };

  // Get new index using old index.
  function getNewIndex(oldIndex) {
    var oldValue = originalBoard[oldIndex];
    var newIndex = $scope.gameBoard.indexOf(oldValue);

    return newIndex;
  }


  $scope.generateColor = function(cell)
  {
    var gameMode = $scope.gameStatus.mode;
    var takenArea = $scope.gameBoard.indexOf(cell);
    var takenTerritory = getInnerText(takenArea);

    // Reassigns for taken area.
    if (takenTerritory == 'X') {
      return 'green';
    } else if (takenTerritory =='O') {
      return 'red';
    }

    switch(cell)
    {
      case 'A':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#FFECDB';
            break;
          case 'hard':
            return '#6C7A89';
            break;
        }
        break;
      case 'B':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#2980b9';
            break;
          case 'hard':
            return '#D2D7D3';
            break;
        }
        break;
      case 'C':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#DCC6E0';
            break;
          case 'hard':
            return '#EEEEEE';
            break;
        }
        break;
      case 'D':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#2c3e50';
            break;
          case 'hard':
            return '#BDC3C7';
            break;
        }
        break;
      case 'E':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#f1c40f';
            break;
          case 'hard':
            return '#95A5A6';
            break;
        }
        break;
      case 'F':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#F9690E';
            break;
          case 'hard':
            return '#DADFE1';
            break;
        }
        break;
      case 'G':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#95a5a6';
            break;
          case 'hard':
            return '#ABB7B7';
            break;
        }
        break;
      case 'H':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#ecf0f1';
            break;
          case 'hard':
            return '#F2F1EF';
            break;
        }
        break;
      case 'I':
        switch(gameMode)
        {
          case 'easy':
            return '#E67E22';
            break;
          case 'normal':
            return '#674172';
            break;
          case 'hard':
            return '#BFBFBF';
            break;
        }
        break;
    }
  }
});

app.controller('TutorialCtrl', function($scope) {

});


app.controller('ScoreCtrl', function($scope) {
  var fireBaseUsers = new Firebase("https://tic-tac-what.firebaseio.com/users");

  $scope.scoreBoard = {};

  fireBaseUsers.once('value', function (snapshot) {
    $scope.$apply(function() {
      $scope.scoreBoard.allScores = snapshot.val();
    });
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
});
