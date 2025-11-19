let currentScore = 0;
let level = 1;
let aliensLeft = 20;
let activeAliens = 0;
let waveTimeLeft = 0;
let waveTimerId = null;
let timeLeft = 50;
let timerId = null;


function $(id) {
  return document.getElementById(id);
}

function initIndex() {
  const el = $("high-score");
  const raw = localStorage.getItem("highScore");
  el.textContent = raw ? String(raw) : "0";
  const btn = $("start-game");
  btn.addEventListener("click", () => {
    location.href = "pages/game.html";
  });
}

function updateHUD() {
  const t = $("timer");
  const a = $("aliens-left");
  const s = $("score");
  if (t) t.textContent = String(Math.max(0, timeLeft));
  if (a) a.textContent = String(aliensLeft);
  if (s) s.textContent = String(currentScore);
}

function clearAliens() {
  const area = $("game-area");
  if (!area) return;
  const list = area.querySelectorAll(".alien");
  for (const node of list) node.remove();
}

function spawnWave() {
  const area = $("game-area");
  const rect = area.getBoundingClientRect();
  const count = Math.floor(Math.random() * 3) + 1;
  activeAliens = count;
  waveTimeLeft = 5;
  stopWaveTimer();
  waveTimerId = setInterval(() => {
    waveTimeLeft -= 1;
    updateHUD();
    if (waveTimeLeft <= 0) {
      stopWaveTimer();
    }
  }, 1000);
  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.className = "alien";
    img.src = "../assets/images/alien.png";
    img.alt = "alien";
    img.draggable = false;
    const x = Math.floor(Math.random() * Math.max(1, rect.width - 30));
    const y = Math.floor(Math.random() * Math.max(1, rect.height - 30));
    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.animation = "alienPulse 5s ease-in-out forwards";
    img.dataset.spawnAt = String(Date.now());
    area.appendChild(img);
    setTimeout(() => {
      if (img.isConnected) {
        img.remove();
        activeAliens -= 1;
        if (activeAliens === 0 && aliensLeft > 0) {
          stopWaveTimer();
          waveTimeLeft = 0;
          updateHUD();
          setTimeout(spawnWave, 300);
        }
      }
    }, 5000);
  }
  updateHUD();
}

function stopWaveTimer() {
  if (waveTimerId) {
    clearInterval(waveTimerId);
    waveTimerId = null;
  }
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateHUD();
    if (timeLeft <= 0) {
      onFail();
    }
  }, 1000);
}

function initGame() {
  aliensLeft = 20;
  timeLeft = 50;
  updateHUD();
  clearAliens();
  spawnWave();
  startTimer();
}

function onWin() {
  stopWaveTimer();
  stopTimer();
  clearAliens();
  const goNext = confirm("恭喜过关！是否进入下一关？取消返回首页");
  if (goNext) {
    level += 1;
    initGame();
  } else {
    const raw = localStorage.getItem("highScore");
    const hs = raw ? Number(raw) : 0;
    if (currentScore > hs) localStorage.setItem("highScore", String(currentScore));
    location.href = "../index.html";
  }
}

function saveHighScore() {
  const raw = localStorage.getItem("highScore");
  const hs = raw ? Number(raw) : 0;
  if (currentScore > hs) localStorage.setItem("highScore", String(currentScore));
}

function onFail() {
  stopWaveTimer();
  stopTimer();
  alert("时间到！游戏失败！");
  saveHighScore();
  location.href = "../index.html";
}

function bindGameEvents() {
  const area = $("game-area");
  const overlay = $("scope-overlay");
  const crosshair = $("crosshair");
  if (crosshair) crosshair.style.display = "none";
  area.addEventListener("mouseenter", () => {
    if (crosshair) crosshair.style.display = "block";
  });
  area.addEventListener("mouseleave", () => {
    if (crosshair) crosshair.style.display = "none";
  });
  area.addEventListener("mousemove", (e) => {
    if (!crosshair) return;
    crosshair.style.left = e.clientX + "px";
    crosshair.style.top = e.clientY + "px";
  });
  area.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.classList && target.classList.contains("alien")) {
      const spawnAt = Number(target.dataset.spawnAt || Date.now());
      const elapsed = Date.now() - spawnAt;
      const award = Math.max(1, Math.ceil((5000 - elapsed) / 500));
      currentScore += award;
      target.remove();
      aliensLeft -= 1;
      activeAliens -= 1;
      updateHUD();
      if (aliensLeft <= 0) {
        onWin();
      } else if (activeAliens === 0) {
        stopWaveTimer();
        waveTimeLeft = 0;
        updateHUD();
        setTimeout(spawnWave, 300);
      }
    } else {
      currentScore -= 1;
      updateHUD();
    }
  });

  const back = $("back-home");
  if (back) {
    back.addEventListener("click", () => {
      stopWaveTimer();
      saveHighScore();
      location.href = "../index.html";
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const isIndex = !!document.getElementById("start-game");
  if (isIndex) {
    initIndex();
    return;
  }
  bindGameEvents();
  initGame();
});