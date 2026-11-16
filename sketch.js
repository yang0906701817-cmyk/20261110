let idleSheet; // 儲存角色1的八格站立圖片精靈圖。
let walkSheet; // 儲存角色1的四格走路圖片精靈圖。
let attackSheet; // 儲存角色1的五格攻擊圖片精靈圖。
let raiseSheet; // 儲存角色1的五格舉手圖片精靈圖。
let sitSheet; // 儲存角色1的八格坐下圖片精靈圖。
let animationState = "idle"; // 記錄角色目前播放的動畫狀態。
let facingRight = true; // 記錄角色目前面向的方向。
let characterX = 0; // 記錄角色中心點在畫布上的水平位置。
let currentFrame = 0; // 記錄目前要顯示的動畫格。
const frameDuration = 120; // 設定每格動畫顯示的毫秒數。
const moveSpeed = 280; // 設定角色每秒移動的畫布像素數。
let lastFrameTime = 0; // 記錄上次切換動畫格的時間。

function preload() { // 在畫布建立前先載入角色圖片。
  idleSheet = loadImage("1/stop/stop.png"); // 載入角色1的八格站立精靈圖。
  walkSheet = loadImage("1/walk/walk.png"); // 載入角色1的四格走路精靈圖。
  attackSheet = loadImage("1/attack/attack.png"); // 載入角色1的五格攻擊精靈圖。
  raiseSheet = loadImage("1/舉手/舉手.png"); // 載入角色1的五格舉手精靈圖。
  sitSheet = loadImage("1/sit/sit.png"); // 載入角色1的八格坐下精靈圖。
} // 結束圖片載入函式。

function setup() { // 設定畫布與繪圖模式。
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗大小的全螢幕畫布。
  imageMode(CENTER); // 讓角色的位置以圖片中心點為基準。
  frameRate(60); // 設定畫面更新頻率為每秒60格。
  characterX = width * 2 / 3; // 將角色初始位置設在畫布寬度的三分之二處。
} // 結束畫布設定函式。

function draw() { // 每個畫面週期更新背景、角色位置與動畫。
  background("#b7e4c7"); // 使用淺綠色清除畫布背景。
  const animationFrameCount = animationState === "walk" ? 4 : animationState === "attack" || animationState === "raise" ? 5 : 8; // 取得目前動畫狀態的總格數。
  if (millis() - lastFrameTime >= frameDuration) { // 時間到時才切換至下一格動畫。
    if (animationState === "attack" || animationState === "raise" || animationState === "sit") { // 判斷目前是否正在播放單次動作動畫。
      currentFrame += 1; // 播放單次動畫的下一格。
      if (currentFrame >= animationFrameCount) { // 判斷單次動畫是否已經播放完畢。
        animationState = keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW) ? "walk" : "idle"; // 單次動畫播完後依方向鍵狀態切回走路或站立動畫。
        if (animationState === "walk") { // 單次動作播放期間若方向鍵仍按住就恢復對應走路方向。
          facingRight = keyIsDown(RIGHT_ARROW); // 依目前按住的方向鍵設定角色面向。
        } // 結束走路方向恢復判斷。
        currentFrame = 0; // 從站立動畫的第一格開始播放。
      } // 結束單次動畫播放完畢判斷。
    } else { // 處理需要循環播放的站立或走路動畫。
      currentFrame = (currentFrame + 1) % animationFrameCount; // 循環播放目前動畫的所有格。
    } // 結束動畫播放模式判斷。
    lastFrameTime = millis(); // 更新上次切換動畫格的時間。
  } // 結束動畫格切換判斷。
  const activeFrameCount = animationState === "walk" ? 4 : animationState === "attack" || animationState === "raise" ? 5 : 8; // 依更新後的動畫狀態取得目前精靈圖格數。
  const activeSheet = animationState === "walk" ? walkSheet : animationState === "attack" ? attackSheet : animationState === "raise" ? raiseSheet : animationState === "sit" ? sitSheet : idleSheet; // 依目前動畫狀態選擇對應精靈圖。
  const frameWidth = activeSheet.width / activeFrameCount; // 計算目前精靈圖每格的寬度。
  const characterScale = min(width * 0.3 / frameWidth, height * 0.4 / activeSheet.height); // 依畫布寬高縮放並限制角色尺寸。
  const displayWidth = frameWidth * characterScale; // 計算放大後單格角色的顯示寬度。
  const displayHeight = activeSheet.height * characterScale; // 計算放大後角色的顯示高度。
  const movementDirection = (keyIsDown(RIGHT_ARROW) ? 1 : 0) - (keyIsDown(LEFT_ARROW) ? 1 : 0); // 依目前按住的方向鍵計算移動方向。
  if (movementDirection !== 0) { // 只有按住左右方向鍵時才移動角色。
    characterX += movementDirection * moveSpeed * deltaTime / 1000; // 依移動方向與畫面時間更新角色水平位置。
  } // 結束角色移動判斷。
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色中心位置，避免角色超出畫布左右邊界。
  const sourceX = currentFrame * frameWidth; // 計算目前動畫格在精靈圖中的水平位置。
  push(); // 暫存目前的繪圖狀態以便套用角色轉向。
  translate(characterX, height - displayHeight / 2); // 將繪圖原點移至角色中心並使角色底部貼齊畫布底端。
  scale(facingRight ? 1 : -1, 1); // 面向左方時水平翻轉角色圖片。
  image(activeSheet, 0, 0, displayWidth, displayHeight, sourceX, 0, frameWidth, activeSheet.height); // 繪製目前動畫格的角色圖片。
  pop(); // 還原繪圖狀態以免影響後續畫面。
} // 結束每格畫面繪製函式。

function keyPressed(event) { // 按下方向鍵或動作鍵時切換角色動畫。
  if (event && event.repeat) { // 忽略按住按鍵時瀏覽器自動重複觸發的事件。
    return false; // 阻止按鍵預設行為並避免重複重設單次動畫。
  } // 結束重複按鍵事件判斷。
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { // 判斷是否按下左右方向鍵。
    facingRight = keyCode === RIGHT_ARROW; // 依按下的方向鍵設定角色面向。
    if (animationState !== "attack" && animationState !== "raise" && animationState !== "sit" && animationState !== "walk") { // 只有非動作動畫且尚未走路時才切換走路狀態。
      animationState = "walk"; // 切換至走路動畫。
      currentFrame = 0; // 從走路動畫第一格開始播放。
      lastFrameTime = millis(); // 更新動畫格切換時間。
    } // 結束走路動畫切換判斷。
    return false; // 阻止方向鍵觸發瀏覽器預設的捲動畫面行為。
  } // 結束左右方向鍵處理。
  if (key === " " || keyCode === 32) { // 判斷是否按下空白鍵。
    animationState = "attack"; // 切換至攻擊動畫。
    currentFrame = 0; // 從攻擊動畫第一格開始播放。
    lastFrameTime = millis(); // 更新動畫格切換時間。
    return false; // 阻止空白鍵觸發瀏覽器預設的捲動畫面行為。
  } // 結束空白鍵處理。
  if (keyCode === UP_ARROW) { // 判斷是否按下上方向鍵。
    animationState = "raise"; // 切換至舉手動畫。
    currentFrame = 0; // 從舉手動畫第一格開始播放。
    lastFrameTime = millis(); // 更新動畫格切換時間。
    return false; // 阻止上方向鍵觸發瀏覽器預設的捲動畫面行為。
  } // 結束上方向鍵處理。
  if (keyCode === DOWN_ARROW) { // 判斷是否按下下方向鍵。
    animationState = "sit"; // 切換至坐下動畫。
    currentFrame = 0; // 從坐下動畫第一格開始播放。
    lastFrameTime = millis(); // 更新動畫格切換時間。
    return false; // 阻止下方向鍵觸發瀏覽器預設的捲動畫面行為。
  } // 結束下方向鍵處理。
} // 結束按鍵按下事件函式。

function keyReleased() { // 放開左右方向鍵時決定角色是否繼續走路。
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { // 只在左右方向鍵放開時更新走路狀態。
    const stillMoving = keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW); // 檢查是否仍有另一個左右方向鍵按住。
    if (animationState === "walk" && !stillMoving) { // 角色正在走路且左右方向鍵都已放開時。
      animationState = "idle"; // 切回站立動畫。
      currentFrame = 0; // 從站立動畫第一格開始播放。
      lastFrameTime = millis(); // 更新動畫格切換時間。
    } else if (animationState === "walk" && stillMoving) { // 角色正在走路且仍有方向鍵按住時。
      facingRight = keyIsDown(RIGHT_ARROW); // 依仍按住的方向鍵更新角色面向。
    } // 結束走路狀態更新判斷。
    return false; // 阻止方向鍵觸發瀏覽器預設的捲動畫面行為。
  } // 結束左右方向鍵放開處理。
} // 結束按鍵放開事件函式。

function windowResized() { // 視窗尺寸改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿整個視窗。
} // 結束視窗尺寸調整函式。
