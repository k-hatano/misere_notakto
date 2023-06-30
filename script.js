
var gBoardsCount = 1;
var gBoard = new Array(0);
var gBoardStatus = new Array(0);
var gPlaying = 1;
var gMoves = new Array(0);
var gAI = 0;

onload = _ => {
  initialize();
  initBoard();
  windowResized();
  drawCanvas();
};

function initialize() {
  window.addEventListener('resize', windowResized);
  document.getElementById('canvas').addEventListener('mousedown', canvasClicked);
  // document.getElementById('undo').addEventListener('click', undoClicked);
  document.getElementById('reset').addEventListener('click', resetClicked);
  document.getElementById('ai').addEventListener('change', aiChanged);
  document.getElementById('boards_count').addEventListener('change', boardsCountChanged);
}

function initBoard() {
  gPlaying = 1;
  gBoard = new Array(gBoardsCount * 9);
  gBoardStatus = new Array(gBoardsCount * 9);
  for (var i = 0; i < gBoard.length; i++) {
    gBoard[i] = 0;
    gBoardStatus[i] = 0;
  }
  gMoves = new Array(0);
}

function undoClicked() {
  var originalMoves = gMoves.concat();
  initBoard();
  for (var i = 0; i < originalMoves.length - 1; i++) {
    var x = originalMoves[i] % 3;
    var y = Math.floor((originalMoves[i] % 9) / 3);
    var boardIndex = Math.floor(originalMoves[i] / 9);
    playAt(boardIndex, x, y);
  }
  drawCanvas();
}

function resetClicked() {
  initBoard();
  drawCanvas();
  if (gPlaying == gAI) {
    playAI();
  }
}

function boardsCountChanged() {
  gBoardsCount = event.target.value;
  initBoard();
  drawCanvas();
  if (gPlaying == gAI) {
    playAI();
  }
}

function aiChanged() {
  gAI = event.target.value;
  initBoard();
  drawCanvas();
  if (gPlaying == gAI) {
    playAI();
  }
}

function drawCanvas() {
  var canvas = document.getElementById('canvas');
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#808080";
  for (var i = 0; i < gBoardsCount; i++) {
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        var rect = getRectOfBoardSquare(i, x, y);
        var unit = rect[2];
        switch (gBoardStatus[i * 9 + y * 3 + x]) {
        case -1:
          ctx.fillStyle = "#CCCCCC";
          ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
          break;
        default:
          break;
        }
        ctx.lineWidth = unit / 36;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.rect(rect[0], rect[1], rect[2], rect[3]);
        ctx.stroke();
        if (gBoard[i * 9 + y * 3 + x] > 0) {
          ctx.lineWidth = unit / 24;
          ctx.strokeStyle = "#000000";
          switch (gBoard[i * 9 + y * 3 + x]) {
          case 1:
            ctx.strokeStyle = "#FF0000";
            break;
          case 2:
            ctx.strokeStyle = "#0000FF";
            break;
          default:
            ctx.strokeStyle = "#000000";
            break;
          }
          ctx.beginPath();
          ctx.moveTo(rect[0] + unit / 5, rect[1] + unit / 5);
          ctx.lineTo(rect[0] + unit * 4 / 5, rect[1] + unit * 4 / 5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(rect[0] + unit * 4 / 5, rect[1] + unit / 5);
          ctx.lineTo(rect[0] + unit / 5, rect[1] + unit * 4 / 5);
          ctx.stroke();
        }
        if (gBoard[i * 9 + y * 3 + x] == -1) {
          ctx.fillStyle = "#CCCCCC";
          ctx.beginPath();
          ctx.ellipse(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2, unit / 16, unit/16 , 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

function canvasClicked() {
  var point = [event.clientX, event.clientY];

  for (var i = 0; i < gBoardsCount; i++) {
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        var rect = getRectOfBoardSquare(i, x, y);
        if (rectContainsPoint(rect, point)) {
          playAt(i, x, y);
        }
      }
    }
  }
  drawCanvas();
}

function playAI() {
  if (isPlayableToAnywhere() == false) {
    return false;
  }
  var played = false;
  do {
    var x = Math.floor(Math.random() * 3);
    var y = Math.floor(Math.random() * 3);
    var boardIndex = Math.floor(Math.random() * gBoardsCount);
    if (isPlayable(boardIndex, x, y)) {
      played = true;
      playAt(boardIndex, x, y);
    }
  } while (played == false);
  drawCanvas();
  return true;
}

function playAt(boardIndex, x, y) {
  if (isPlayable(boardIndex, x, y)) {
    gBoard[boardIndex * 9 + y * 3 + x] = gPlaying;
    checkBoard();
    gPlaying = 3 - gPlaying;
    gMoves.push(boardIndex * 9 + y * 3 + x);
    if (gPlaying == gAI) {
      playAI();
    }
  }
}

function isPlayableToAnywhere() {
  var playable = false;
  for (var i = 0; i < gBoardsCount; i++) {
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        if (isPlayable(i, x, y)) {
          return true;
        }
      }
    } 
  }
  return false;
}

function isPlayable(boardIndex, x, y) {
  if (gBoard[boardIndex * 9 + y * 3 + x] <= 0 && gBoardStatus[boardIndex * 9 + y * 3 + x] == 0) {
    return true;
  }
  return false;
}

function checkBoard() {
  for (var i = 0; i < gBoardsCount; i++) {
    var playable = true;
    for (var y = 0; y < 3; y++) {
      if (gBoard[i * 9 + y * 3 + 0] > 0 && gBoard[i * 9 + y * 3 + 1] > 0 && gBoard[i * 9 + y * 3 + 2] > 0) {
        playable = false;
      }
    }
    for (var x = 0; x < 3; x++) {
      if (gBoard[i * 9 + x] > 0 && gBoard[i * 9 + 3 + x] > 0 && gBoard[i * 9 + 6 + x] > 0) {
        playable = false;
      }
    }
    if (gBoard[i * 9] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 8] > 0) {
      playable = false;
    }
    if (gBoard[i * 9 + 2] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 6] > 0) {
      playable = false;
    }

    if (playable == false) {
      for (var j = 0; j < 9; j++) {
        gBoardStatus[i * 9 + j] = -1;
        if (gBoard[i * 9 + j] < 0) {
          gBoard[i * 9 + j] = 0;
        }
      }
    }
  }


  for (var i = 0; i < gBoardsCount; i++) {
    if (gBoardStatus[i * 9] == 0) {
      for (var y = 0; y < 3; y++) {
        if (gBoard[i * 9 + y * 3 + 0] <= 0 && gBoard[i * 9 + y * 3 + 1] > 0 && gBoard[i * 9 + y * 3 + 2] > 0) {
          gBoard[i * 9 + y * 3 + 0] = -1;
        }
        if (gBoard[i * 9 + y * 3 + 0] > 0 && gBoard[i * 9 + y * 3 + 1] <= 0 && gBoard[i * 9 + y * 3 + 2] > 0) {
          gBoard[i * 9 + y * 3 + 1] = -1;
        }
        if (gBoard[i * 9 + y * 3 + 0] > 0 && gBoard[i * 9 + y * 3 + 1] > 0 && gBoard[i * 9 + y * 3 + 2] <= 0) {
          gBoard[i * 9 + y * 3 + 2] = -1;
        }
      }
      for (var x = 0; x < 3; x++) {
        if (gBoard[i * 9 + x] <= 0 && gBoard[i * 9 + 3 + x] > 0 && gBoard[i * 9 + 6 + x] > 0) {
          gBoard[i * 9 + x] = -1;
        }
        if (gBoard[i * 9 + x] > 0 && gBoard[i * 9 + 3 + x] <= 0 && gBoard[i * 9 + 6 + x] > 0) {
          gBoard[i * 9 + 3 + x] = -1;
        }
        if (gBoard[i * 9 + x] > 0 && gBoard[i * 9 + 3 + x] > 0 && gBoard[i * 9 + 6 + x] <= 0) {
          gBoard[i * 9 + 6 + x] = -1;
        }
      }
      if (gBoard[i * 9] <= 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 8] > 0) {
        gBoard[i * 9] = -1;
      }
      if (gBoard[i * 9] > 0 && gBoard[i * 9 + 4] <= 0 && gBoard[i * 9 + 8] > 0) {
        gBoard[i * 9 + 4] = -1;
      }
      if (gBoard[i * 9] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 8] <= 0) {
        gBoard[i * 9 + 8] = -1;
      }
      if (gBoard[i * 9 + 2] <= 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 6] > 0) {
        gBoard[i * 9 + 2] = -1;
      }
      if (gBoard[i * 9 + 2] > 0 && gBoard[i * 9 + 4] <= 0 && gBoard[i * 9 + 6] > 0) {
        gBoard[i * 9 + 4] = -1;
      }
      if (gBoard[i * 9 + 2] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 6] <= 0) {
        gBoard[i * 9 + 6] = -1;
      }
    }
  }
}

function windowResized() {
  drawCanvas();
}

function getRectOfBoardSquare(boardIndex, x, y) {
  var canvas = document.getElementById('canvas');
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  var unit, xCenter, yCenter, xMax, yMax, xBoardOffset, yBoardOffset;
  if (width > height) {
    unit = height;
    xCenter = width / 2 - height / 2;
    yCenter = 0;
  } else {
    unit = width;
    xCenter = 0;
    yCenter = height / 2 - width / 2;
  }

  if (gBoardsCount == 1) {
    xMax = 5;
    yMax = 5;
    xBoardOffset = 0;
    yBoardOffset = 0;
  } else if (gBoardsCount == 2) {
    xMax = 9;
    yMax = 9;
    if (width > height) {
      xBoardOffset = boardIndex % 2 * 4;
      yBoardOffset = 2;
    } else {
      xBoardOffset = 2;
      yBoardOffset = boardIndex % 2 * 4;
    }
  } else {
    xMax = 9;
    yMax = 9;
    xBoardOffset = Math.floor(boardIndex / 2) * 4;
    yBoardOffset = boardIndex % 2 * 4;
  }

  return [
    ((x + 1 + xBoardOffset) / xMax) * unit + xCenter,
    ((y + 1 + yBoardOffset) / yMax) * unit + yCenter,
    unit / xMax,
    unit / yMax
  ];
}

function rectContainsPoint(rect, point) {
  return (
    point[0] > rect[0] 
      && point[1] > rect[1] 
      && point[0] < rect[0] + rect[2] 
      && point[1] < rect[1] + rect[3]
  );
}