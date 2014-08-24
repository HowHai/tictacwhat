// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('tictacwhat', ['ionic'])

.run(function($ionicPlatform) {
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
})
.controller('MainCtrl', function($scope, $timeout) {
  Array.prototype.last = function(){
    return this[this.length -1];
  }

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
    }, 3000);

    // When game starts, show countdown.
    $scope.status.message = 3;
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
    console.log('player:', player);
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

      if (winningComb.length == 2 && !areaTaken(winningMove))
      {
        return fatalBlow = winningMove;
        break;
      }

      // Decision is true when player makes trap/odd moves
      if (decision && winningComb.length == 1)
      {
        var moveOne = Math.abs(botMoves.last() - winningMove[0]);
        var moveTwo = Math.abs(botMoves.last() - winningMove[1]);

        var moveToTake = moveOne > moveTwo ? winningMove[0] : winningMove[1];
        if (areaTaken(winningComb) && !areaTaken(winningMove[0]) && !areaTaken(winningMove[1]))
        {
          // Hacky solution to bot's only weakness
          fatalBlow = (areaTaken(1) && areaTaken(8) && gameBoard.length == 5) ? 6 : moveToTake;
          break;
        }
        else if (areaTaken(winningMove[0]) && areaTaken(winningMove[1]))
          fatalBlow = areaTaken(3) ? 1 : 3
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
      document.getElementById(data).innerHTML = "<span>O</span>";
      // botMoves.push(data);
      // console.log('bot:', data);
      pushOriginalPosition(botMoves, data);
      gameBoard.push(data);
      displayStatus("France's Turn");
      fatalBlow = [];
    }

    var randMove = [0,2,6,8][Math.floor(Math.random() * [0,2,6,8].length)];

    // Take random corner if center is taken on first move
    if (gameBoard.length == 1) {
      var index = getNewIndex(4);
      console.log('index:', index);
      areaTaken(index) ? pushData(randMove) : pushData(index);
    }
    else if (playerOneMoves.length < 5)
    {
      calculateBotMove(playerOneMoves, botMoves);
      if (fatalBlow.length == 1 && !isNaN(fatalBlow))
        pushData(fatalBlow[0]);
      else
      {
        botMoveChecker(winCondition, botMoves, true);
        pushData(fatalBlow);
      }
    }

    // Get new index using old index.
    function getNewIndex(oldIndex) {
      var oldValue = originalBoard[oldIndex];
      var newIndex = $scope.gameBoard.indexOf(oldValue);

      return newIndex;
    }
  };
});