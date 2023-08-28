
let gBoardsCount = 1;
let gBoard = new Array(0);
let gBoardStatus = new Array(0);
let gPlaying = 1;
let gMoves = new Array(0);
let gAI = 0;
let gMessage = "";
let gHintMode = false;
let gBoardScore = undefined;

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
  gBoardScore = new Array(gBoardsCount * 9);
  for (let i = 0; i < gBoard.length; i++) {
    gBoard[i] = 0;
    gBoardStatus[i] = 0;
    gBoardScore[i] = 0;
  }
  gMoves = new Array(0);
  gMessage = "";
}

function undoClicked() {
  let originalMoves = gMoves.concat();
  initBoard();
  for (let i = 0; i < originalMoves.length - 1; i++) {
    let x = originalMoves[i] % 3;
    let y = Math.floor((originalMoves[i] % 9) / 3);
    let boardIndex = Math.floor(originalMoves[i] / 9);
    playAt(boardIndex, x, y);
  }
  drawCanvas();
}

function resetClicked() {
  initBoard();
  gHintMode = event.altKey;
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
  let canvas = document.getElementById('canvas');
  let settings = document.getElementById('settings');
  let width = canvas.width;
  let height = canvas.height;
  let unit;
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#808080";
  for (let i = 0; i < gBoardsCount; i++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        let rect = getRectOfBoardSquare(i, x, y, gBoardsCount, width, height);
        unit = rect[2];
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
        if (gHintMode == true && gBoardScore != undefined) {
          let score = gBoardScore[i * 9 + y * 3 + x];
          if (score != undefined) {
            ctx.fillStyle = "#A8A8A8";
            ctx.font = "" + (unit * 2 / 7) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(score, rect[0] + rect[2] / 2, rect[1] + rect[3] * 8 / 13);
          }
        }
      }
    }
  }

  let rect = getRectOfBoardSquare(gBoardsCount - 1, 2, 2, gBoardsCount, width, height);
  if (gMessage && gMessage.length > 0) {
    ctx.fillStyle = "#000000";
    ctx.font = "" + (unit * 2 / 7) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(gMessage, (width / 2), rect[1] + rect[3] + unit * 4 / 7);
  }
}

function canvasClicked() {
  let canvas = document.getElementById('canvas');
  let width = canvas.width;
  let height = canvas.height;
  let point = [event.offsetX, event.offsetY];

  for (let i = 0; i < gBoardsCount; i++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        let rect = getRectOfBoardSquare(i, x, y, gBoardsCount, width, height);
        if (rectContainsPoint(rect, point)) {
          playAt(i, x, y);
        }
      }
    }
  }
  drawCanvas();
}

function updateScore() {
  let boardChiralities = checkChiralities(gBoardsCount, gBoard);
  for (let i = 0; i < gBoard.length; i++) {
    gBoardScore[i] = undefined;
  }
  for (let i = 0; i < gBoard.length; i++) {
    let tmpBoard = gBoard.concat();
    let tmpBoardStatus = gBoardStatus.concat();
    let boardIndex = Math.floor(i / 9);
    let x = i % 3;
    let y = Math.floor(i / 3) % 3;

    if (boardChiralities && boardChiralities[i].length > 0) { 
      for (let ci = 0; ci < boardChiralities[i].length; ci++) {
        if (gBoardScore[boardChiralities[i][ci]] != undefined) {
          gBoardScore[i] = gBoardScore[boardChiralities[i][ci]];
          break;
        }
      }
    }
    if (gBoardScore[i] == undefined) {
      let score = valuateMove(boardIndex, x, y, gPlaying, gBoardsCount, tmpBoard, tmpBoardStatus, 4);
      gBoardScore[boardIndex * 9 + y * 3 + x] = score;
    }
  }
}

function playAI() {
  if (isPlayableToAnywhere() == false) {
    return false;
  }
  let maxScore = undefined;
  let maxScoreIndices = new Array();
  let garbageIndices = new Array();
  let boardChiralities = checkChiralities(gBoardsCount, gBoard);
  for (let i = 0; i < gBoard.length; i++) {
    let tmpBoard = gBoard.concat();
    let tmpBoardStatus = gBoardStatus.concat();

    let boardIndex = Math.floor(i / 9);
    let x = i % 3;
    let y = Math.floor(i / 3) % 3;
    if (boardChiralities && boardChiralities[i].length > 0) {
      let maxMatched = undefined;
      let garbageMatched = undefined;
      for (let c = 0; c < boardChiralities[i].length; c++) {
        let boardChirality = boardChiralities[i];
        if (boardChirality.indexOf(i) >= 0) {
          for (let ci = 0; ci < boardChirality.length; ci++) {
            if (maxScoreIndices.indexOf(boardChirality[ci])) {
              maxMatched = boardChirality[ci];
              break;
            }
            if (garbageIndices.indexOf(boardChirality[ci])) {
              garbageMatched = boardChirality[ci];
              break;
            }
          }
          if (maxMatched != undefined || garbageMatched != undefined) {
            break;
          }
        }
      }
      if (maxMatched != undefined) {
        maxScoreIndices.push(maxMatched);
        continue;
      }
      if (garbageMatched != undefined) {
        continue;
      }
    }
    let score = valuateMove(boardIndex, x, y, gPlaying, gBoardsCount, tmpBoard, tmpBoardStatus, 3);
    // console.log("i=" + i + " score=" + score);
    if (maxScore == undefined) {
      maxScore = score;
      maxScoreIndices = new Array();
      maxScoreIndices.push(i);
    } else if (maxScore < score) {
      maxScore = score;
      garbageIndices = garbageIndices.concat(maxScoreIndices);
      maxScoreIndices = new Array();
      maxScoreIndices.push(i);
    } else if (maxScore == score) {
      maxScoreIndices.push(i);
    }
  }
    // console.log("maxScore=" + maxScore + " maxScoreIndices=" + maxScoreIndices);
  if (maxScoreIndices != undefined && maxScoreIndices.length > 0) {
    let maxScoreIndex = maxScoreIndices[Math.floor(Math.random() * maxScoreIndices.length)];
    // console.log("maxScoreIndex=" + maxScoreIndex);

    let boardIndex = Math.floor(maxScoreIndex / 9);
    let x = maxScoreIndex % 3;
    let y = Math.floor(maxScoreIndex / 3) % 3;
    playAt(boardIndex, x, y);
  }

  drawCanvas();
  return true;
}

function checkChiralities(boardsCount, board) {
  let boardChiralities = new Array(board.length);
  for (let i = 0; i < board.length; i++) {
    boardChiralities[i] = new Array();
  }

  for (let i = 0; i < boardsCount; i++) {
    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 2] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 5] > 0)
          && (board[i * 9 + 6] > 0) == (board[i * 9 + 8] > 0)) {
      boardChiralities[i * 9 + 2].push(i * 9 + 0);
      boardChiralities[i * 9 + 5].push(i * 9 + 3);
      boardChiralities[i * 9 + 8].push(i * 9 + 6);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 7] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 8] > 0)) {
      boardChiralities[i * 9 + 6].push(i * 9 + 0);
      boardChiralities[i * 9 + 7].push(i * 9 + 1);
      boardChiralities[i * 9 + 8].push(i * 9 + 2);
    }

    if ((board[i * 9 + 1] > 0) == (board[i * 9 + 3] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 5] > 0) == (board[i * 9 + 7] > 0)) {
      boardChiralities[i * 9 + 3].push(i * 9 + 1);
      boardChiralities[i * 9 + 6].push(i * 9 + 2);
      boardChiralities[i * 9 + 7].push(i * 9 + 5);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 8] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 5] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 7] > 0)) {
      boardChiralities[i * 9 + 8].push(i * 9 + 0);
      boardChiralities[i * 9 + 5].push(i * 9 + 1);
      boardChiralities[i * 9 + 7].push(i * 9 + 3);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 8] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 7] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 5] > 0)) {
      boardChiralities[i * 9 + 8].push(i * 9 + 0);
      boardChiralities[i * 9 + 7].push(i * 9 + 1);
      boardChiralities[i * 9 + 6].push(i * 9 + 2);
      boardChiralities[i * 9 + 5].push(i * 9 + 3);
    }
  }

  for (let i = 1; i < boardsCount; i++) {
    for (let j = 0; j < i; j++) {
      let same = true;
      for (let k = 0; k < 9; k++) {
        if ((board[i * 9 + k] > 0) != (board[j * 9 + k] > 0)) {
          same = false;
          break;
        }
      }
      if (same) {
        for (let k = 0; k < 9; k++) {
          boardChiralities[i * 9 + k].push(j * 9 + k);
        }
      }
    }
  }

  return boardChiralities;
}

function valuateMove(boardIndex, x, y, playing, boardsCount, board, boardsStatus, depth = 1) {
  if (!isPlayable(boardIndex, x, y, boardsCount, board, boardsStatus)) {
    return undefined;
  }
  board[boardIndex * 9 + y * 3 + x] = playing;
  checkBoard(boardsCount, board, boardsStatus);
  let playable = isPlayableToAnywhere(boardsCount, board, boardsStatus);
  if (playable == false) {
    return -100;
  } else {
    if (depth <= 0) {
      return 0;
    }
    let minScore = undefined;
    let maxScore = undefined;
    let boardChiralities = checkChiralities(boardsCount, board);
    // console.dir(boardChiralities);
    for (let j = 0; j < board.length; j++) {
      if (boardChiralities[j] && boardChiralities[j].length > 0) {
        continue;
      }
      let tmpBoard2 = board.concat();
      let tmpBoardsStatus2 = boardsStatus.concat();
      let boardIndex2 = Math.floor(j / 9);
      let x2 = j % 3;
      let y2 = Math.floor(j / 3) % 3;
      if (!isPlayable(boardIndex2, x2, y2, boardsCount, tmpBoard2, tmpBoardsStatus2)) {
        continue;
      }
      let score2 = valuateMove(boardIndex2, x2, y2, 3 - playing, boardsCount, tmpBoard2, tmpBoardsStatus2, depth - 1);
      if (maxScore == undefined || maxScore < score2) {
        maxScore = score2;
      }
      if (maxScore >= 100) {
        break;
      }
    }
    return maxScore / (-2);
  }
  return 0;
}

function playAt(boardIndex, x, y) {
  if (isPlayable(boardIndex, x, y)) {
    gBoard[boardIndex * 9 + y * 3 + x] = gPlaying;
    gMoves.push(boardIndex * 9 + y * 3 + x);
    checkBoard(gBoardsCount, gBoard, gBoardStatus);
    drawCanvas();
    let playable = isPlayableToAnywhere();
    if (playable) {
      gPlaying = 3 - gPlaying;
      if (gPlaying == gAI) {
        playAI();
        if (gHintMode) {
          updateScore();
        }
      }
    } else {
      gPlaying = gPlaying - 3;
      if (gPlaying == -1) {
        gMessage = "First player" + (gAI == 1 ? " (AI) " : " ") + "wins!";
      } else if (gPlaying == -2) {
        gMessage = "Second player" + (gAI == 2 ? " (AI) " : " ") + "wins!";
      }
    }
  }
}

function isPlayableToAnywhere(boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardStatus) {
  let playable = false;
  for (let i = 0; i < boardsCount; i++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (isPlayable(i, x, y, boardsCount, board, boardsStatus)) {
          return true;
        }
      }
    } 
  }
  return false;
}

function isPlayable(boardIndex, x, y, boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardStatus) {
  if (board[boardIndex * 9 + y * 3 + x] <= 0 && boardsStatus[boardIndex * 9 + y * 3 + x] == 0) {
    return true;
  }
  return false;
}

function checkBoard(boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardStatus) {
  for (let i = 0; i < gBoardsCount; i++) {
    let playable = true;
    for (let y = 0; y < 3; y++) {
      if (board[i * 9 + y * 3 + 0] > 0 && board[i * 9 + y * 3 + 1] > 0 && board[i * 9 + y * 3 + 2] > 0) {
        playable = false;
      }
    }
    for (let x = 0; x < 3; x++) {
      if (board[i * 9 + x] > 0 && board[i * 9 + 3 + x] > 0 && board[i * 9 + 6 + x] > 0) {
        playable = false;
      }
    }
    if (board[i * 9] > 0 && board[i * 9 + 4] > 0 && board[i * 9 + 8] > 0) {
      playable = false;
    }
    if (board[i * 9 + 2] > 0 && board[i * 9 + 4] > 0 && board[i * 9 + 6] > 0) {
      playable = false;
    }

    if (playable == false) {
      for (let j = 0; j < 9; j++) {
        boardsStatus[i * 9 + j] = -1;
        if (board[i * 9 + j] < 0) {
          board[i * 9 + j] = 0;
        }
      }
    }
  }


  for (let i = 0; i < boardsCount; i++) {
    if (boardsStatus[i * 9] == 0) {
      for (let y = 0; y < 3; y++) {
        if (board[i * 9 + y * 3 + 0] <= 0 && board[i * 9 + y * 3 + 1] > 0 && board[i * 9 + y * 3 + 2] > 0) {
          board[i * 9 + y * 3 + 0] = -1;
        }
        if (board[i * 9 + y * 3 + 0] > 0 && board[i * 9 + y * 3 + 1] <= 0 && board[i * 9 + y * 3 + 2] > 0) {
          board[i * 9 + y * 3 + 1] = -1;
        }
        if (board[i * 9 + y * 3 + 0] > 0 && board[i * 9 + y * 3 + 1] > 0 && board[i * 9 + y * 3 + 2] <= 0) {
          board[i * 9 + y * 3 + 2] = -1;
        }
      }
      for (let x = 0; x < 3; x++) {
        if (board[i * 9 + x] <= 0 && board[i * 9 + 3 + x] > 0 && board[i * 9 + 6 + x] > 0) {
          board[i * 9 + x] = -1;
        }
        if (board[i * 9 + x] > 0 && board[i * 9 + 3 + x] <= 0 && board[i * 9 + 6 + x] > 0) {
          board[i * 9 + 3 + x] = -1;
        }
        if (board[i * 9 + x] > 0 && board[i * 9 + 3 + x] > 0 && board[i * 9 + 6 + x] <= 0) {
          board[i * 9 + 6 + x] = -1;
        }
      }
      if (board[i * 9] <= 0 && board[i * 9 + 4] > 0 && board[i * 9 + 8] > 0) {
        board[i * 9] = -1;
      }
      if (board[i * 9] > 0 && board[i * 9 + 4] <= 0 && board[i * 9 + 8] > 0) {
        board[i * 9 + 4] = -1;
      }
      if (board[i * 9] > 0 && board[i * 9 + 4] > 0 && board[i * 9 + 8] <= 0) {
        board[i * 9 + 8] = -1;
      }
      if (board[i * 9 + 2] <= 0 && board[i * 9 + 4] > 0 && board[i * 9 + 6] > 0) {
        board[i * 9 + 2] = -1;
      }
      if (board[i * 9 + 2] > 0 && board[i * 9 + 4] <= 0 && board[i * 9 + 6] > 0) {
        board[i * 9 + 4] = -1;
      }
      if (board[i * 9 + 2] > 0 && board[i * 9 + 4] > 0 && board[i * 9 + 6] <= 0) {
        board[i * 9 + 6] = -1;
      }
    }
  }
}

function windowResized() {
  let canvas = document.getElementById('canvas');
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
  drawCanvas();
}

function getRectOfBoardSquare(boardIndex, x, y, boardsCount, width, height) {
  let unit, xMax, yMax, xBoardOffset, yBoardOffset, xOrigin, yOrigin;

  if (boardsCount == 1) {
    xMax = 5;
    yMax = 5;
    xBoardOffset = 0;
    yBoardOffset = 0;
  } else if (boardsCount == 2) {
    if (width > height) {
      xMax = 9;
      yMax = 5;
      xBoardOffset = boardIndex % 2 * 4;
      yBoardOffset = 0;
    } else {
      xMax = 5;
      yMax = 9;
      xBoardOffset = 0;
      yBoardOffset = boardIndex % 2 * 4;
    }
  } else if (boardsCount == 3) {
    if (width >= height * 2.5) {
      xMax = 13;
      yMax = 5;
      xBoardOffset = boardIndex % 3 * 4;
      yBoardOffset = 0;
    } else if (width * 2.5 <= height) {
      xMax = 5;
      yMax = 13;
      xBoardOffset = 0;
      yBoardOffset = boardIndex * 4;
    } else {
      xMax = 9;
      yMax = 9;
      xBoardOffset = boardIndex % 2 * 4;
      yBoardOffset = Math.floor(boardIndex / 2) * 4;
    }
  } else if (boardsCount == 5) {
    if (width > height) {
      xMax = 13;
      yMax = 9;
      xBoardOffset = boardIndex % 3 * 4;
      yBoardOffset = Math.floor(boardIndex / 3) * 4;
    } else {
      xMax = 9;
      yMax = 13;
      xBoardOffset = boardIndex % 2 * 4;
      yBoardOffset = Math.floor(boardIndex / 2) * 4;
    }
  } else {
    xMax = 9;
    yMax = 9;
    xBoardOffset = boardIndex % 2 * 4;
    yBoardOffset = Math.floor(boardIndex / 2) * 4;
  }

  if (width / xMax > height / yMax) {
    unit = height / yMax;
    xOrigin = (width / 2) - (height / yMax * (xMax / 2));
    yOrigin = 0;
  } else {
    unit = width / xMax;
    xOrigin = 0;
    yOrigin = (height / 2) - (width / xMax * (yMax / 2));
  }

  return [
    (x + 1 + xBoardOffset) * unit + xOrigin,
    (y + 1 + yBoardOffset) * unit + yOrigin,
    unit,
    unit
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