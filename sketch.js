let stopSheet; // 儲存角色停止動作的精靈圖
let walkSheet; // 儲存角色行走動作的精靈圖
let actionSheet; // 儲存角色招式動作的精靈圖
let effectSheet; // 儲存招式發射後的特效精靈圖
let characterX; // 儲存角色中心目前在畫布上的水平位置
let facingDirection = 1; // 記錄角色面向，正數代表右方，負數代表左方
let actionState = 'idle'; // 記錄角色目前處於停止、招式或特效狀態
let actionStartTime = 0; // 記錄招式動畫開始播放的時間
let effectStartTime = 0; // 記錄特效動畫開始播放的時間
let effectX = 0; // 記錄特效目前的水平位置
let effectY = 0; // 記錄特效目前的垂直位置
let spaceKeyLatched = false; // 避免長按空白鍵重複觸發招式
const stopFrameCount = 10; // 設定停止動作精靈圖的影格總數
const walkFrameCount = 9; // 設定行走動作精靈圖的影格總數
const actionFrameCount = 4; // 設定招式精靈圖的影格總數
const effectFrameCount = 5; // 設定特效精靈圖的影格總數
const frameDuration = 100; // 設定每張影格播放的毫秒數
const movementSpeedFactor = 1.5; // 設定角色每秒移動的角色寬度倍數
const effectSpeedFactor = 0.8; // 設定特效每秒移動的畫布寬度倍數

function preload() { // 在畫布建立前載入角色圖片
  stopSheet = loadImage('1/stop/stopcombine.png'); // 載入角色停止動作的十格精靈圖
  walkSheet = loadImage('1/walk/walkcombine.png'); // 載入角色行走動作的九格精靈圖
  actionSheet = loadImage('1/招數/招數combine.png'); // 載入角色四格招式精靈圖
  effectSheet = loadImage('1/招數的特效/招數的特效combine.png'); // 載入五格招式特效精靈圖
} // 結束圖片載入函式

function setup() { // 設定畫布與繪圖環境
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布
  imageMode(CENTER); // 將圖片定位方式設為以中心點對齊
  characterX = width * 2 / 3; // 將角色初始位置設在畫布寬度的三分之二處
  frameRate(60); // 設定畫布更新率以保持動畫流暢
} // 結束畫布設定函式

function draw() { // 每次畫布更新時繪製背景與角色
  background(190, 232, 190); // 使用淺綠色清除畫布背景
  const stopFrameWidth = stopSheet.width / stopFrameCount; // 計算停止動作每格的原始寬度
  const walkFrameWidth = walkSheet.width / walkFrameCount; // 計算行走動作每格的原始寬度
  const actionFrameWidth = actionSheet.width / actionFrameCount; // 計算招式動作每格的原始寬度
  const characterScale = min(height * 0.32 / stopSheet.height, width * 2 / 3 / max(stopFrameWidth, actionFrameWidth)); // 依畫布尺寸縮放角色並為招式影格預留寬度
  let movementDirection = 0; // 設定角色本次更新的移動方向，零代表停止
  if (actionState === 'idle' && keyIsDown(RIGHT_ARROW)) { // 角色可操作時檢查是否按住右方向鍵
    movementDirection = 1; // 設定角色往畫布右側移動
    facingDirection = 1; // 記錄角色面向畫布右側
  } else if (actionState === 'idle' && keyIsDown(LEFT_ARROW)) { // 角色可操作時檢查是否按住左方向鍵
    movementDirection = -1; // 設定角色往畫布左側移動
    facingDirection = -1; // 記錄角色面向畫布左側
  } // 結束方向鍵狀態判斷
  if (actionState === 'attack' && millis() - actionStartTime >= actionFrameCount * frameDuration) { // 檢查四格招式是否已播放完畢
    actionState = 'effect'; // 招式完成後切換至特效飛行狀態
    effectStartTime = millis(); // 記錄特效動畫的起始時間
    effectX = characterX + facingDirection * stopFrameWidth * characterScale * 0.4; // 依角色縮放比例從面向的一側發射特效
    effectY = height - stopSheet.height * characterScale * 0.55; // 將特效對齊縮放後角色的身體前方
  } // 結束招式完成狀態判斷
  let currentSheet = stopSheet; // 預設使用停止動作精靈圖
  let currentFrameCount = stopFrameCount; // 預設使用停止動作影格數
  if (actionState === 'attack') { // 檢查角色是否正在播放招式
    currentSheet = actionSheet; // 切換成招式動作精靈圖
    currentFrameCount = actionFrameCount; // 使用招式的四張影格
  } else if (actionState === 'idle' && movementDirection !== 0) { // 檢查角色是否正在行走
    currentSheet = walkSheet; // 切換成行走動作精靈圖
    currentFrameCount = walkFrameCount; // 使用行走的九張影格
  } // 結束角色動作精靈圖選擇
  const frameWidth = currentSheet.width / currentFrameCount; // 計算目前動作每張影格的寬度
  const frameHeight = currentSheet.height; // 取得目前動作每張影格的高度
  const currentFrame = actionState === 'attack' ? min(actionFrameCount - 1, floor((millis() - actionStartTime) / frameDuration)) : floor(millis() / frameDuration) % currentFrameCount; // 招式只播放一次，其餘動作循環播放
  const displayWidth = frameWidth * characterScale; // 計算角色目前影格的顯示寬度
  const displayHeight = frameHeight * characterScale; // 計算角色目前影格的顯示高度
  characterX += movementDirection * displayWidth * movementSpeedFactor * deltaTime / 1000; // 依方向與經過時間平順更新角色水平位置
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色中心位置以避免角色超出畫布左右邊界
  const characterY = height - displayHeight / 2; // 將縮放後的角色圖片底邊對齊畫布底邊
  push(); // 暫存畫布狀態以便只翻轉角色圖片
  translate(characterX, characterY); // 將繪圖原點移至角色中心
  scale(facingDirection, 1); // 依目前面向水平翻轉角色精靈圖
  image(currentSheet, 0, 0, displayWidth, displayHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight); // 繪製縮放後的目前影格並裁切其餘影格
  pop(); // 還原畫布狀態避免影響後續繪圖
  let showEffect = actionState === 'effect'; // 記錄本次畫面是否需要繪製飛行中的特效
  const effectFrameWidth = effectSheet.width / effectFrameCount; // 計算特效精靈圖每格的原始寬度
  const effectDisplayWidth = effectFrameWidth * characterScale; // 依角色縮放比例計算特效顯示寬度
  const effectDisplayHeight = effectSheet.height * characterScale; // 依角色縮放比例計算特效顯示高度
  if (showEffect) { // 特效飛行期間持續更新位置與影格
    effectX += facingDirection * width * effectSpeedFactor * deltaTime / 1000; // 依角色面向將特效往畫布邊緣移動
    if (facingDirection > 0 && effectX - effectDisplayWidth / 2 > width || facingDirection < 0 && effectX + effectDisplayWidth / 2 < 0) { // 檢查特效是否已完全離開畫布
      actionState = 'idle'; // 特效離開畫布後恢復角色操作狀態
      showEffect = false; // 停止繪製已離開畫布的特效
    } // 結束特效離場判斷
  } // 結束特效位置更新
  if (showEffect) { // 特效仍在畫布範圍內時繪製目前影格
    const effectFrame = floor((millis() - effectStartTime) / frameDuration) % effectFrameCount; // 循環播放特效的五張影格
    push(); // 暫存畫布狀態以便依方向翻轉特效
    translate(effectX, effectY); // 將繪圖原點移至特效中心
    scale(facingDirection, 1); // 讓特效朝角色面向的方向飛行
    image(effectSheet, 0, 0, effectDisplayWidth, effectDisplayHeight, effectFrame * effectFrameWidth, 0, effectFrameWidth, effectSheet.height); // 繪製縮放並裁切後的特效影格
    pop(); // 還原畫布狀態避免影響後續繪圖
  } // 結束特效繪製
} // 結束畫面繪製函式

function keyPressed() { // 處理鍵盤按下事件
  if (keyCode === 32 && !spaceKeyLatched) { // 確認空白鍵首次按下且尚未鎖存
    spaceKeyLatched = true; // 鎖存空白鍵以避免長按重複觸發
    if (actionState === 'idle') { // 只有角色閒置時才開始招式
      actionState = 'attack'; // 切換至招式播放狀態
      actionStartTime = millis(); // 記錄招式動畫起始時間
    } // 結束閒置狀態檢查
    return false; // 防止空白鍵捲動網頁
  } // 結束空白鍵處理
} // 結束鍵盤按下事件

function keyReleased() { // 處理鍵盤放開事件
  if (keyCode === 32) { // 確認放開的是空白鍵
    spaceKeyLatched = false; // 解除空白鍵鎖存以允許下次觸發
    return false; // 防止空白鍵放開時執行瀏覽器預設動作
  } // 結束空白鍵放開處理
} // 結束鍵盤放開事件

function windowResized() { // 在瀏覽器視窗尺寸改變時調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布繼續填滿整個視窗
} // 結束視窗尺寸調整函式