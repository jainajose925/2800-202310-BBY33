// Board representation
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let mode = "easy"; // Default mode is hard

// Array of all possible winning combinations
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Get all empty cells on the board
function getEmptyCells(board) {
  return board.reduce((emptyCells, cell, index) => {
    if (cell === "") {
      emptyCells.push(index);
    }
    return emptyCells;
  }, []);
}

// Check if the current player wins
function checkWin(player) {
  return winningCombinations.some(combination => {
    return combination.every(index => board[index] === player);
  });
}

// Evaluate the score of the board
function evaluate(board) {
  if (checkWin("X")) {
    return -1;
  } else if (checkWin("O")) {
    return 1;
  } else {
    return 0;
  }
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, maximizingPlayer, alpha, beta) {
  if (checkWin("X")) {
    return -1;
  } else if (checkWin("O")) {
    return 1;
  } else if (getEmptyCells(board).length === 0) {
    return 0;
  }

  if (maximizingPlayer) {
    let maxEval = Number.NEGATIVE_INFINITY;
    let emptyCells = getEmptyCells(board);

    for (let i = 0; i < emptyCells.length; i++) {
      let index = emptyCells[i];
      board[index] = "O";
      let eval = minimax(board, depth + 1, false, alpha, beta);
      board[index] = "";

      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      
      if (beta <= alpha) {
        break;
      }
    }

    return maxEval;
  } else {
    let minEval = Number.POSITIVE_INFINITY;
    let emptyCells = getEmptyCells(board);

    for (let i = 0; i < emptyCells.length; i++) {
      let index = emptyCells[i];
      board[index] = "X";
      let eval = minimax(board, depth + 1, true, alpha, beta);
      board[index] = "";

      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);

      if (beta <= alpha) {
        break;
      }
    }

    return minEval;
  }
}

// AI makes a move randomly
function makeRandomMove() {
  let emptyCells = getEmptyCells(board);
  let randomIndex = Math.floor(Math.random() * emptyCells.length);
  let index = emptyCells[randomIndex];
  makeMove(index, "comp");
}

// AI makes a move using the minimax algorithm
function makeAIMove() {
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove;

  let emptyCells = getEmptyCells(board);
  for (let i = 0; i < emptyCells.length; i++) {
    let index = emptyCells[i];
    board[index] = "O";
    let score = minimax(board, 0, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    board[index] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  makeMove(bestMove, "comp");
}

// Make a move on the board
function makeMove(index, who) {
  if (gameOver || board[index] !== "") {
    return;
  }

  board[index] = currentPlayer;
  document.getElementsByClassName("cell")[index].innerText = currentPlayer;
  
  if(who === "player") {
    document.getElementsByClassName("cell")[index].classList.toggle("player");
  } else if(who === "comp") {
    document.getElementsByClassName("cell")[index].classList.toggle("comp");
  }

  if (checkWin(currentPlayer)) {
    var message;
    if(who === "player") {
      message = `You win!`;
    } else if(who === "comp") {
      message = `Computer wins!\nBetter luck next time!`;
    }
    document.getElementById('boardContainer').style.height = '690px';
    document.getElementById('finish').style.visibility = 'visible';
    document.getElementById('winner-message').innerText = message;
    gameOver = true;
  } else if (getEmptyCells(board).length === 0) {
    let message = `It's a tie!`
    document.getElementById('boardContainer').style.height = '690px';
    document.getElementById('finish').style.visibility = 'visible';
    document.getElementById('winner-message').innerText = message;
    gameOver = true;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    
    if (currentPlayer === "O") {
      if (mode === "easy") {
       setTimeout(makeRandomMove, getRandomDelay());
      } else if (mode === "hard") {
        setTimeout(makeAIMove, getRandomDelay());
      }
    }
  }
}

// Reset the game
function reset() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameOver = false;

  let cells = document.getElementsByClassName("cell");
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = "";
    cells[i].classList.remove("player");
    cells[i].classList.remove("comp");
  }
  document.getElementById('boardContainer').style.height = '600px';
  document.getElementById('finish').style.visibility = 'hidden';
  document.getElementById('winner-message').innerText = "";
  
}

function getRandomDelay() {
  return Math.random() * (1000 - 500) + 500;
}

// Set the game mode
function toggleMode() {
  mode = mode === "hard" ? "easy" : "hard";
  reset();
}

document.getElementById('home').addEventListener('click', function() {
  window.location.href = '/dashboard';
});

// Initialize the game
reset();

