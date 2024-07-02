
let gBoardsCount = 1;
let gBoard = new Array(0);
let gBoardsStatus = new Array(0);
let gPlaying = 1;
let gMoves = new Array(0);
let gAI = 0;
let gMessage = "";
let gHintMode = false;
let gBoardsScore = undefined;
let gBoardsScoreCache = {};
let gCursorX = -1;
let gCursorY = -1;
let gAIPlaying = false;
let gSettingTouchCount = 0;
let gSettingLastTouchTime = -1;
let gHintDepth = 4;
let gResetting = false;
let gUseCache = true;
let gStrokes = new Array(0);

onload = _ => {
  initialize();
  initBoard();
  windowResized();
  drawCanvas();
};

function initialize() {
  window.addEventListener('resize', windowResized);
  document.getElementById('canvas').addEventListener('mousedown', canvasClicked);
  document.getElementById('undo').addEventListener('click', undoClicked);
  document.getElementById('button_reset').addEventListener('click', resetClicked);
  document.getElementById('button_cheat_mode').addEventListener('click', cheatModeClicked);
  document.getElementById('ai').addEventListener('change', aiChanged);
  document.getElementById('boards_count').addEventListener('change', boardsCountChanged);
  document.getElementById('settings').addEventListener('mousedown', mouseDownOnSettings);
  document.getElementById('settings').addEventListener('touchstart', mouseDownOnSettings);
  document.getElementById('cheat_depth').addEventListener('input', hintDepthChanged);
  document.getElementById('cheat_depth').addEventListener('change', hintDepthChanged);
  document.addEventListener('keydown', keyPressed);
}

function hintDepthChanged(event) {
  gHintDepth = event.target.value;
  updateScore();
  drawCanvas();
}

function useCacheChanged(event) {
  gUseCache = event.target.checked;
  updateScore();
  drawCanvas();
}

function initBoard() {
  gPlaying = 1;
  gBoard = new Array(gBoardsCount * 9);
  gBoardsStatus = new Array(gBoardsCount * 9);
  gBoardsScore = new Array(gBoardsCount * 9);
  for (let i = 0; i < gBoard.length; i++) {
    gBoard[i] = 0;
    gBoardsStatus[i] = 0;
    gBoardsScore[i] = 0;
  }
  gStrokes = new Array(gBoardsCount);
  for (let i = 0; i < gStrokes.length; i++) {
    gStrokes[i] = 0;
  }
  gMoves = new Array(0);
  gBoardsScoreCache = {}
  gMessage = "";
  gCursorX = -1;
  gCursorY = -1;
  gAIPlaying = false;
  gResetting = false;
}

function keyPressed() {
  var keyCode = event.keyCode;
  var originalResetting = gResetting;
  gResetting = false;
  if (keyCode == 38 || keyCode == 67 || keyCode == 56 || keyCode == 104 || keyCode == 228) { // 上、C、8、ゲームパッド90
    if (gPlaying <= 0) {
      gCursorX = -1;
      gCursorY = -1;
    } else if (gCursorX < 0 || gCursorY < 0) {
      gCursorX = 0;
      gCursorY = 0;
    } else if (gCursorY > 0) {
      gCursorY--;
    } else {
      let canvas = document.getElementById('canvas');
      let units = getBoardUnits(gBoardsCount, canvas.width, canvas.height);
      if (gCursorX >= Math.floor((units.xMax - 1) / 4) * 3) {
        gCursorX -= Math.floor((units.xMax - 1) / 4) * 3;
        gCursorY = 2;
      }
    }
    document.getElementById('settings').className = 'settings hidden';
    drawCanvas();
    return;
  }
  if (keyCode == 40 || keyCode == 68 || keyCode == 50 || keyCode == 98 || keyCode == 227) { // 下、D、2、ゲームパッド89
    if (gPlaying <= 0) {
      gCursorX = -1;
      gCursorY = -1;
    } else if (gCursorX < 0 || gCursorY < 0) {
      gCursorX = 0;
      gCursorY = 0;
    } else if (gCursorY < 2) {
      gCursorY++;
    } else {
      let canvas = document.getElementById('canvas');
      let units = getBoardUnits(gBoardsCount, canvas.width, canvas.height);
      if (gCursorX + Math.floor((units.xMax - 1) / 4) * 3 < 3 * gBoardsCount) {
        gCursorX += Math.floor((units.xMax - 1) / 4) * 3;
        gCursorY = 0;
      }
    }
    document.getElementById('settings').className = 'settings hidden';
    drawCanvas();
    return;
  }
  if (keyCode == 37 || keyCode == 69 || keyCode == 100 || keyCode == 52) { // 左、E、4
    if (gPlaying <= 0) {
      gCursorX = -1;
      gCursorY = -1;
    } else if (gCursorX < 0 || gCursorY < 0) {
      gCursorX = 0;
      gCursorY = 0;
    } else if (gCursorX > 0) {
      gCursorX--;
    }
    document.getElementById('settings').className = 'settings hidden';
    drawCanvas();
    return;
  }
  if (keyCode == 39 || keyCode == 70 || keyCode == 102 || keyCode == 54) { // 右、F、6
    if (gPlaying <= 0) {
      gCursorX = -1;
      gCursorY = -1;
    } else if (gCursorX < 0 || gCursorY < 0) {
      gCursorX = 0;
      gCursorY = 0;
    } else if (gCursorX < 3 * gBoardsCount - 1) {
      gCursorX++;
    }
    document.getElementById('settings').className = 'settings hidden';
    drawCanvas();
    return;
  }
  if (keyCode == 53 || keyCode == 101 || keyCode == 71 || keyCode == 13) { // 5、G、Enter
    playAt(Math.floor(gCursorX / 3), gCursorX % 3, gCursorY);
    if (gHintMode) {
      drawCanvas();
      updateScore();
    }
    document.getElementById('settings').className = 'settings hidden';
    drawCanvas();
    return;
  }
  if (keyCode == 48 || keyCode == 96 || keyCode == 79 || keyCode == 27) { // 0、O、Esc
    if (document.getElementById('settings').className.indexOf('hidden') >= 0) {
      document.getElementById('settings').className = 'settings';
    } else {
      document.getElementById('settings').className = 'settings hidden';
    }
    return;
  }
  // if (keyCode == 49 || keyCode == 97 || keyCode == 78) { // 1、N
  //   if (originalResetting == false){
  //     gResetting = true;
  //     gMessage = "If you want to reset, press 1 or N key one more time.";
  //   } else {
  //     gResetting = false; 
  //     resetClicked();
  //   }
  //   drawCanvas();
  //   return;
  // }
  if (keyCode == 57 || keyCode == 105 || keyCode == 75) { // 9、K
    if (gHintMode) {
      gHintMode = false;
      drawCanvas();
      return;
    } else {
      gHintMode = true;
      updateScore();
      drawCanvas();
      return;
    }
  }
}

function undoClicked() {
  let originalMoves = gMoves.concat();
  initBoard();
  for (let i = 0; i < originalMoves.length - 1; i++) {
    let x = originalMoves[i] % 3;
    let y = Math.floor((originalMoves[i] % 9) / 3);
    let boardIndex = Math.floor(originalMoves[i] / 9);
    playAt(boardIndex, x, y, true);
  }
  drawCanvas();
}

function resetClicked() {
  initBoard();
  gHintMode = gHintMode || event.altKey;
  drawCanvas();
  if (gPlaying == gAI) {
    playAIAsync();
  }
}

function preventMouseDownOnSettings() {
  gSettingTouchCount = 0;
  gSettingLastTouchTime = Date.now();
}

function mouseDownOnSettings(event) {
  if (event.target.id != 'settings') {
    gSettingTouchCount = 0;
    return;
  }

  let touchInterval = Date.now() - gSettingLastTouchTime;
  if (touchInterval < 500) {
    gSettingTouchCount++;
    if (gSettingTouchCount >= 3) {
      if (document.getElementById('cheat_mode').className.indexOf('gone') >= 0) {
        document.getElementById('cheat_mode').className = '';
      } else {
        document.getElementById('cheat_mode').className = 'gone';
      }
      gSettingTouchCount = 0;
    }
  } else {
    gSettingTouchCount = 1;
  }
  gSettingLastTouchTime = Date.now();
}

function cheatModeClicked() {
 if (gHintMode) {
    gHintMode = false;
    drawCanvas();
    return;
  } else {
    gHintMode = true;
    updateScore();
    drawCanvas();
    return;
  }
}

function boardsCountChanged() {
  gBoardsCount = event.target.value;
  initBoard();
  drawCanvas();
  if (gPlaying == gAI) {
    playAIAsync();
  }
}

function aiChanged() {
  gAI = event.target.value;
  initBoard();
  drawCanvas();
  if (gPlaying == gAI) {
    playAIAsync();
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
        switch (gBoardsStatus[i * 9 + y * 3 + x]) {
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
          if (gHintMode) {
            ctx.fillStyle = "#BBBBBB";
          }
          ctx.beginPath();
          ctx.ellipse(rect[0] + rect[2] / 2, rect[1] + rect[3] / 2, unit / 16, unit/16 , 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (gHintMode == true && gBoardsScore != undefined) {
          let score = gBoardsScore[i * 9 + y * 3 + x];
          if (score != undefined) {
            if (gPlaying == 1) {
              if (score > 0) {
                ctx.fillStyle = "#FFA8A8";
              } else if (score < 0) {
                ctx.fillStyle = "#A8A8FF";
              } else {
                ctx.fillStyle = "#A8A8A8";
              }
            } else {
              if (score > 0) {
                ctx.fillStyle = "#A8A8FF";
              } else if (score < 0) {
                ctx.fillStyle = "#FFA8A8";
              } else {
                ctx.fillStyle = "#A8A8A8";
              }
            }
            ctx.font = "" + (unit * 3 / 14) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(score, rect[0] + rect[2] / 2, rect[1] + rect[3] * 15 / 17);
          }
        }
      }
    }

    if (gStrokes[i] > 0) {
      let rect = getRectOfBoardSquare(i, 0, 0, gBoardsCount, width, height);
      ctx.lineWidth = unit / 24;
      if (gStrokes[i] & 1) {
        ctx.strokeStyle = "#C00000";
      }
      if (gStrokes[i] & 2) {
        ctx.strokeStyle = "#0000C0";
      }
      if (gStrokes[i] & 4) {
        ctx.beginPath();
        ctx.moveTo(rect[0] + unit / 2, rect[1]);
        ctx.lineTo(rect[0] + unit / 2, rect[1] + unit * 3);
        ctx.stroke();
      }
      if (gStrokes[i] & 8) {
        ctx.beginPath();
        ctx.moveTo(rect[0] + unit * 3 / 2, rect[1]);
        ctx.lineTo(rect[0] + unit * 3 / 2, rect[1] + unit * 3);
        ctx.stroke();
      }
      if (gStrokes[i] & 16) {
        ctx.beginPath();
        ctx.moveTo(rect[0] + unit * 5 / 2, rect[1]);
        ctx.lineTo(rect[0] + unit * 5 / 2, rect[1] + unit * 3);
        ctx.stroke();
      }
      if (gStrokes[i] & 32) {
        ctx.beginPath();
        ctx.moveTo(rect[0] + unit * 3, rect[1]);
        ctx.lineTo(rect[0], rect[1] + unit * 3);
        ctx.stroke();
      }
      if (gStrokes[i] & 64) {
        ctx.beginPath();
        ctx.moveTo(rect[0], rect[1] + unit / 2);
        ctx.lineTo(rect[0] + unit * 3, rect[1] + unit / 2);
        ctx.stroke();
      }
      if (gStrokes[i] & 128) {
        ctx.beginPath();
        ctx.moveTo(rect[0], rect[1] + unit * 3 / 2);
        ctx.lineTo(rect[0] + unit * 3, rect[1] + unit * 3 / 2);
        ctx.stroke();
      }
      if (gStrokes[i] & 256) {
        ctx.beginPath();
        ctx.moveTo(rect[0], rect[1] + unit * 5 / 2);
        ctx.lineTo(rect[0] + unit * 3, rect[1] + unit * 5 / 2);
        ctx.stroke();
      }
      if (gStrokes[i] & 512) {
        ctx.beginPath();
        ctx.moveTo(rect[0], rect[1]);
        ctx.lineTo(rect[0] + unit * 3, rect[1] + unit * 3);
        ctx.stroke();
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

  if (gCursorX >= 0 && gCursorY >= 0) {
    let rect = getRectOfBoardSquare(Math.floor(gCursorX / 3), gCursorX % 3, gCursorY, gBoardsCount, width, height);
    rect = shrinkRect(rect, unit / 24);
    ctx.lineWidth = unit / 24;
    ctx.strokeStyle = "#000000";
    let playing = gPlaying;
    if (!isPlayable(Math.floor(gCursorX / 3), gCursorX % 3, gCursorY)) {
      playing = 0;
    }
    switch (playing) {
    case 1:
      ctx.strokeStyle = "#FF0000";
      break;
    case 2:
      ctx.strokeStyle = "#0000FF";
      break;
    default:
      ctx.strokeStyle = "#404040";
      break;
    }

    ctx.beginPath();
    ctx.rect(rect[0], rect[1], rect[2], rect[3]);
    ctx.stroke();
  }
}

function canvasClicked() {
  let canvas = document.getElementById('canvas');
  let width = canvas.width;
  let height = canvas.height;
  let point = [event.offsetX, event.offsetY];
  if (gPlaying == gAI || gAIPlaying == true) {
    return;
  }

  gCursorX = -1;
  gCursorY = -1;
  document.getElementById('settings').className = 'settings';
  for (let i = 0; i < gBoardsCount; i++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        let rect = getRectOfBoardSquare(i, x, y, gBoardsCount, width, height);
        if (rectContainsPoint(rect, point)) {
          playAt(i, x, y);
          if (gHintMode) {
            drawCanvas();
            updateScore();
          }
        }
      }
    }
  }
  drawCanvas();
}

function updateScore() {
  let boardAliases = checkAliases(gBoardsCount, gBoard);
  gBoardsScoreCache = {};
  for (let i = 0; i < gBoard.length; i++) {
    gBoardsScore[i] = undefined;
  }
  for (let i = 0; i < gBoard.length; i++) {
    let tmpBoard = gBoard.concat();
    let tmpBoardStatus = gBoardsStatus.concat();
    let boardIndex = Math.floor(i / 9);
    let x = i % 3;
    let y = Math.floor(i / 3) % 3;

    if (boardAliases && boardAliases[i].length > 0) { 
      for (let ci = 0; ci < boardAliases[i].length; ci++) {
        if (gBoardsScore[boardAliases[i][ci]] != undefined) {
          gBoardsScore[i] = gBoardsScore[boardAliases[i][ci]];
          break;
        }
      }
    }
    if (gBoardsScore[i] == undefined) {
      let score = valuateMove(boardIndex, x, y, gPlaying, gBoardsCount, tmpBoard, tmpBoardStatus, gHintDepth);
      gBoardsScore[boardIndex * 9 + y * 3 + x] = score;
    }
  }
}

function playAIAsync() {
  gAIPlaying = true;
  gMessage = "COM is thinking...";
  drawCanvas();
  requestAnimationFrame(_ => {
    setTimeout(_ => {
      playAI();
      if (gHintMode) {
        updateScore();
      }
      drawCanvas();
      gAIPlaying = false;
    }, 1);
  });
}

function playAI() {
  if (isPlayableToAnywhere() == false) {
    return false;
  }
  gMessage = "COM is thinking...";
  drawCanvas();

  let maxScore = undefined;
  let maxScoreIndices = new Array();
  let garbageIndices = new Array();
  let boardAliases = checkAliases(gBoardsCount, gBoard);
  for (let i = 0; i < gBoard.length; i++) {
    let tmpBoard = gBoard.concat();
    let tmpBoardStatus = gBoardsStatus.concat();

    let boardIndex = Math.floor(i / 9);
    let x = i % 3;
    let y = Math.floor(i / 3) % 3;
    if (boardAliases && boardAliases[i].length > 0) {
      let maxMatched = undefined;
      let garbageMatched = undefined;
      for (let c = 0; c < boardAliases[i].length; c++) {
        let boardAlias = boardAliases[i];
        if (boardAlias.indexOf(i) >= 0) {
          for (let ci = 0; ci < boardAlias.length; ci++) {
            if (maxScoreIndices.indexOf(boardAlias[ci])) {
              maxMatched = boardAlias[ci];
              break;
            }
            if (garbageIndices.indexOf(boardAlias[ci])) {
              garbageMatched = boardAlias[ci];
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
    let score = valuateMove(boardIndex, x, y, gPlaying, gBoardsCount, tmpBoard, tmpBoardStatus, 4);
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
    if (gCursorX >= 0 && gCursorY >= 0) {
      gCursorX = x + boardIndex * 3;
      gCursorY = y;
    }
  }

  if (gPlaying > 0) {
    gMessage = "";
  }
  drawCanvas();
  return true;
}

function checkAliases(boardsCount, board) {
  let boardAliases = new Array(board.length);
  for (let i = 0; i < board.length; i++) {
    boardAliases[i] = new Array();
  }

  for (let i = 0; i < boardsCount; i++) {
    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 2] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 5] > 0)
          && (board[i * 9 + 6] > 0) == (board[i * 9 + 8] > 0)) {
      boardAliases[i * 9 + 2].push(i * 9 + 0);
      boardAliases[i * 9 + 5].push(i * 9 + 3);
      boardAliases[i * 9 + 8].push(i * 9 + 6);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 7] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 8] > 0)) {
      boardAliases[i * 9 + 6].push(i * 9 + 0);
      boardAliases[i * 9 + 7].push(i * 9 + 1);
      boardAliases[i * 9 + 8].push(i * 9 + 2);
    }

    if ((board[i * 9 + 1] > 0) == (board[i * 9 + 3] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 5] > 0) == (board[i * 9 + 7] > 0)) {
      boardAliases[i * 9 + 3].push(i * 9 + 1);
      boardAliases[i * 9 + 6].push(i * 9 + 2);
      boardAliases[i * 9 + 7].push(i * 9 + 5);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 8] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 5] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 7] > 0)) {
      boardAliases[i * 9 + 8].push(i * 9 + 0);
      boardAliases[i * 9 + 5].push(i * 9 + 1);
      boardAliases[i * 9 + 7].push(i * 9 + 3);
    }

    if ((board[i * 9 + 0] > 0) == (board[i * 9 + 8] > 0)
          && (board[i * 9 + 1] > 0) == (board[i * 9 + 7] > 0)
          && (board[i * 9 + 2] > 0) == (board[i * 9 + 6] > 0)
          && (board[i * 9 + 3] > 0) == (board[i * 9 + 5] > 0)) {
      boardAliases[i * 9 + 8].push(i * 9 + 0);
      boardAliases[i * 9 + 7].push(i * 9 + 1);
      boardAliases[i * 9 + 6].push(i * 9 + 2);
      boardAliases[i * 9 + 5].push(i * 9 + 3);
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
          boardAliases[i * 9 + k].push(j * 9 + k);
        }
      }
    }
  }

  return boardAliases;
}

function valuateMove(boardIndex, x, y, playing, boardsCount, board, boardsStatus, depth = 1) {
  let result = 0;
  if (!isPlayable(boardIndex, x, y, boardsCount, board, boardsStatus)) {
    return undefined;
  }
  let tmpBoard = board.concat();
  let tmpBoardsStatus = boardsStatus.concat();
  tmpBoard[boardIndex * 9 + y * 3 + x] = playing;
  let binaryIndex = getBinaryIndex(tmpBoard);
  if (gUseCache && (gBoardsScoreCache[binaryIndex] != undefined)) {
    return gBoardsScoreCache[binaryIndex];
  }
  checkBoard(boardsCount, tmpBoard, tmpBoardsStatus);
  let playable = isPlayableToAnywhere(boardsCount, tmpBoard, tmpBoardsStatus);
  if (playable == false) {
    result = -100;
  } else if (depth <= 0) {
    result = 0;
  } else {
    let minScore = undefined;
    let maxScore = undefined;
    let boardAliases = checkAliases(boardsCount, tmpBoard);
    // console.dir(boardAliases);
    for (let j = 0; j < board.length; j++) {
      if (boardAliases[j] && boardAliases[j].length > 0) {
        continue;
      }
      let tmpBoard2 = tmpBoard.concat();
      let tmpBoardsStatus2 = tmpBoardsStatus.concat();
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
    result = maxScore / (-2);
  }
  gBoardsScoreCache[binaryIndex] = result;
  return result;
}

function playAt(boardIndex, x, y, disableAI) {
  if (isPlayable(boardIndex, x, y)) {
    gBoard[boardIndex * 9 + y * 3 + x] = gPlaying;
    gMoves.push(boardIndex * 9 + y * 3 + x);
    updateStrokes();
    checkBoard(gBoardsCount, gBoard, gBoardsStatus);
    drawCanvas();
    let playable = isPlayableToAnywhere();
    if (playable) {
      gPlaying = 3 - gPlaying;
      if (gPlaying == gAI && disableAI != true) {
        playAIAsync();
      }
    } else {
      gPlaying = gPlaying - 3;
      gCursorX = -1;
      gCursorY = -1;
      if (gPlaying == -1) {
        gMessage = "First player" + (gAI == 1 ? " (COM) " : " ") + "wins!";
      } else if (gPlaying == -2) {
        gMessage = "Second player" + (gAI == 2 ? " (COM) " : " ") + "wins!";
      }
    }
  }
}

function isPlayableToAnywhere(boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardsStatus) {
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

function isPlayable(boardIndex, x, y, boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardsStatus) {
  if (board[boardIndex * 9 + y * 3 + x] <= 0 && boardsStatus[boardIndex * 9 + y * 3 + x] == 0) {
    return true;
  }
  return false;
}

function checkBoard(boardsCount = gBoardsCount, board = gBoard, boardsStatus = gBoardsStatus) {
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

function updateStrokes() {
  let flag = 0;
  for (let i = 0; i < gBoardsCount; i++) {
    if (gStrokes[i] > 0) {
      continue;
    }
    flag = 0;
    if (gBoard[i * 9 + 0] > 0 && gBoard[i * 9 + 3] > 0 && gBoard[i * 9 + 6] > 0) {
      flag += 4;
    }
    if (gBoard[i * 9 + 1] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 7] > 0) {
      flag += 8;
    }
    if (gBoard[i * 9 + 2] > 0 && gBoard[i * 9 + 5] > 0 && gBoard[i * 9 + 8] > 0) {
      flag += 16;
    }
    if (gBoard[i * 9 + 2] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 6] > 0) {
      flag += 32;
    }
    if (gBoard[i * 9 + 0] > 0 && gBoard[i * 9 + 1] > 0 && gBoard[i * 9 + 2] > 0) {
      flag += 64;
    }
    if (gBoard[i * 9 + 3] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 5] > 0) {
      flag += 128;
    }
    if (gBoard[i * 9 + 6] > 0 && gBoard[i * 9 + 7] > 0 && gBoard[i * 9 + 8] > 0) {
      flag += 256;
    }
    if (gBoard[i * 9 + 0] > 0 && gBoard[i * 9 + 4] > 0 && gBoard[i * 9 + 8] > 0) {
      flag += 512;
    }
    if (flag > 0) {
      if (gPlaying == 1) {
        flag += 1;
      }
      if (gPlaying == 2) {
        flag += 2;
      }
    }
    gStrokes[i] = flag;
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

function getBoardUnits(boardsCount, width, height) {
  let xMax, yMax, xOrigin, yOrigin, unit;

  if (boardsCount == 1) {
    xMax = 5;
    yMax = 5;
  } else if (boardsCount == 2) {
    if (width > height) {
      xMax = 9;
      yMax = 5;
    } else {
      xMax = 5;
      yMax = 9;
    }
  } else if (boardsCount == 3) {
    if (width >= height * 2.5) {
      xMax = 13;
      yMax = 5;
    } else if (width * 2.5 <= height) {
      xMax = 5;
      yMax = 13;
    } else {
      xMax = 9;
      yMax = 9;
    }
  } else if (boardsCount == 4) {
    if (width >= height * 3.5) {
      xMax = 17;
      yMax = 5;
    } else if (width * 3.5 <= height) {
      xMax = 5;
      yMax = 17;
    } else {
      xMax = 9;
      yMax = 9;
    }
  } else if (boardsCount == 5) {
    if (width > height) {
      xMax = 13;
      yMax = 9;
    } else {
      xMax = 9;
      yMax = 13;
    }
  } else {
    xMax = 9;
    yMax = 9;
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

  return {
    xMax: xMax,
    yMax, yMax,
    xOrigin: xOrigin,
    yOrigin: yOrigin,
    unit: unit
  };
}

function getRectOfBoardSquare(boardIndex, x, y, boardsCount, width, height) {
  let unit, xMax, yMax, xBoardOffset, yBoardOffset, xOrigin, yOrigin;

  let units = getBoardUnits(boardsCount, width, height);
  xMax = units.xMax;
  yMax = units.yMax;
  xOrigin = units.xOrigin;
  yOrigin = units.yOrigin;
  unit = units.unit;

  let xMaxM1P4 = Math.floor((xMax - 1) / 4);
  xBoardOffset = (Math.floor(boardIndex) % xMaxM1P4) * 4;
  yBoardOffset = (Math.floor(boardIndex / xMaxM1P4)) * 4;

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

function shrinkRect(rect, delta) {
  return [
    rect[0] + delta,
    rect[1] + delta,
    rect[2] - 2 * delta,
    rect[3] - 2 * delta
  ];
}

function getBinaryIndex(board) {
  // let result = 0;
  // let digit = 1;
  // for (let i = 0; i < board.length; i++) {
  //   if (board[i] > 0) {
  //     result += digit;
  //   }
  //   digit *= 2;
  // }
  // return result;
  let result = boardsToBinaryIndices(board, gBoardsCount);
  return result;
}

function boardsToBinaryIndices(boards, boardsCount) {
  let indicesPerBoard = new Array(boardsCount);
  for (let i = 0; i < boardsCount; i++) {
    let board = boards.slice(i * 9, i * 9 + 9);
    let index = contractBoard(board);
    indicesPerBoard[i] = index;
  }
  indicesPerBoard = indicesPerBoard.sort((a, b) => (b - a));
  let result = 0;
  let rate = 1;
  for (let i = 0; i < indicesPerBoard.length; i++) {
    result += parseInt(indicesPerBoard[i]) * rate;
    rate *= 512;
  }
  return result;
}

function boardToCircularIndices(board, startIndex = 0) {
  let result = new Array(9);
  const conversionTable = [4, 0, 1, 2, 5, 8, 7, 6, 3];
  for (let i = 0; i < 9; i++) {
    result[i] = board[conversionTable[i + startIndex]];
  }
  return result;
}

function boardFromCircularIndices(board, startIndex = 0) {
  let result = new Array(9);
  const conversionTable = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  for (let i = 0; i < 9; i++) {
    result[i] = board[conversionTable[i + startIndex]];
  }
  return result;
}

function rotateBoard(board, startIndex = 0) {
  let result = new Array(9);
  const conversionTable = [2, 5, 8, 1, 4, 7, 0, 3, 6];
  for (let i = 0; i < 9; i++) {
    result[i] = board[conversionTable[i + startIndex]];
  }
  return result;
}

function flipBoard(board, startIndex = 0) {
  let result = new Array(9)
  const conversionTable = [2, 1, 0, 5, 4, 3, 8, 7, 6];
  for (let i = 0; i < 9; i++) {
    result[i] = board[conversionTable[i + startIndex]];
  }
  return result;
}

function toNumeric(board, startIndex = 0) {
  let result = 0;
  for (let i = 0; i < 9; i++) {
    result += (parseInt(board[i + startIndex]) > 0 ? 1 : 0) * (1 << i);
  }
  return result;
}

function contractBoard(board, startIndex = 0) {
  let original = board;
  let originalIndex = toNumeric(original);

  let rotate1 = rotateBoard(board);
  let rotate1Index = toNumeric(rotate1);

  let rotate2 = rotateBoard(rotate1);
  let rotate2Index = toNumeric(rotate2);

  let rotate3 = rotateBoard(rotate2);
  let rotate3Index = toNumeric(rotate3);

  let flip = flipBoard(board);
  let flipIndex = toNumeric(flip);

  let flipRotate1 = rotateBoard(flip);
  let flipRotate1Index = toNumeric(flipRotate1);

  let flipRotate2 = rotateBoard(flipRotate1);
  let flipRotate2Index = toNumeric(flipRotate2);

  let flipRotate3 = rotateBoard(flipRotate2);
  let flipRotate3Index = toNumeric(flipRotate3);

  return Math.min(originalIndex, rotate1Index, rotate2Index, rotate3Index,
    flipIndex, flipRotate1Index, flipRotate2Index, flipRotate3Index);
}

