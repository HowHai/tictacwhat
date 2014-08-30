var app = angular.module('tictacwhat.controllers', []);

app.controller('MainCtrl', function($scope, $timeout, $ionicPopup, $window, $state, ScoreSystem) {
  Array.prototype.last = function(){
    return this[this.length -1];
  }

  // Get current user's data.
  $scope.currentUser = {};
  $scope.currentUser.username = $window.localStorage.getItem('username');
  $scope.currentUser.topScore = $window.localStorage.getItem('topScore');
  $scope.currentUser.currentScore = $window.localStorage.getItem('currentScore');

  $scope.showPopup = function(popupTitle, status) {
    $scope.data = {};

    $scope.data.title = popupTitle;
    $scope.data.gameStatus = status;

    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/game-over-modal.html',
      title: 'Game Over',
      subTitle: 'Enter your name and submit your score!',
      scope: $scope,
      buttons: [
        {
          text: '<b>Submit Score</b>',
          type: 'button-positive',
          onTap: function(e) {
            // Save username to localStorage.
            $window.localStorage.setItem('username', $scope.currentUser.username);

            ScoreSystem.submitScore($scope.currentUser.username);
          }
        },
      ]
    });
   };

  var getInnerText = function(id) {
    return document.getElementById(id).innerText;
  }

  function displayStatus(message){
    $scope.status.message = message;
  };

  $scope.status = {};
  var playerOneMoves = [];
  var gameBoard = [];
  var newBoard = [];
  var botMoves = [];
  var fatalBlow = [];
  var gameOver = false;
  var botMode = true;
  var randomBoard = [];
  $scope.status.message = "Click play to start";

  // $scope.gameBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  $scope.gameBoard = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  var winCondition = [
                          [0,1,2], [3,4,5], [6,7,8],
                          [0,3,6], [1,4,7], [2,5,8],
                          [0,4,8], [2,4,6]
                     ];

  $scope.botMode = function(){
    gameOver = false;
    botMode = true;
    displayStatus("France's Turn");

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
      $scope.status.message = "Start!";
      $timeout(function() {
        $scope.status.message = null;
      }, 1500);
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
    console.log('player:', playerOneMoves);
    console.log('bot:', botMoves);
  }

  $scope.selectedTerritory = function(selected){
    console.log('selected:', selected);
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
      playerAction(playerOneMoves, "Holland's Turn");
      if (botMode)
      {
        botAI();
      }
    }

    winCheck(winCondition, playerOneMoves, "France won!");
    winCheck(winCondition, botMoves, "Holland won!");
  };

  function winCheck(winCondition, playerMoves, message) {
    for (var i = 0; i < winCondition.length; i++){
      var winComb = winCondition[i].filter(function(value){
        return playerMoves.indexOf(value) != -1;
      })

      if (winComb.length == 3)
        {
          displayStatus(message);
          gameOver = true;
          $scope.showPopup();
          break;
        }
    }
    if (playerMoves.length == 5 && gameOver == false)
    {
      displayStatus("War is hell... stalemate!");
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
        console.log('190:', winningMove);
        return fatalBlow = winningMove;
        break;
      }

      // Decision is true when player makes trap/odd moves
      if (decision && winningComb.length == 1)
      {
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

          fatalBlow = (areaTaken(indexOne) && areaTaken(indexEight) && gameBoard.length == 5) ? 6 : moveToTake;
            console.log('winningCom:', winningComb);
            console.log('211MoveToTake:', moveToTake);
            console.log('211Fatal:', fatalBlow);
          break;
        }
        else if (areaTaken(winningMoveOne) && areaTaken(winningMoveTwo))
        {
          var indexThree = getNewIndex(3);
          fatalBlow = areaTaken(indexThree) ? 1 : 3
          console.log('217');
        }
      }
      console.log('221');
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
      displayStatus("France's Turn");
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
        console.log('260fatal:', fatalBlow);
        var index = getNewIndex(fatalBlow[0]);
        console.log('260index:', fatalBlow);
        pushData(index);
      }
      else
      {
        botMoveChecker(winCondition, botMoves, true);
        console.log('fatalBlow:', fatalBlow);
        console.log('268:', fatalBlow);
        var index = getNewIndex(fatalBlow);
        console.log('268index:', index);
        pushData(index);
      }
    }

  };

  // Get new index using old index.
  function getNewIndex(oldIndex) {
    console.log('oldIndex:', oldIndex);
    var oldValue = originalBoard[oldIndex];
    console.log('oldValue:', oldValue);
    var newIndex = $scope.gameBoard.indexOf(oldValue);
    console.log('newIndex:', newIndex);

    return newIndex;
  }
});

app.controller('TutorialCtrl', function($scope) {

});