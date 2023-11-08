// 當文檔加載完成時執行函數
document.addEventListener('DOMContentLoaded', function () {
    const gameArea = document.getElementById('gameArea');  // 獲取遊戲區域的DOM元素
    const startButton = document.getElementById('startGame');  // 獲取開始遊戲按鈕的DOM元素
    const retryButton = document.getElementById("retryGame");  // 獲取重試遊戲按鈕的DOM元素
    let isGameOver = false;  // 遊戲是否結束的標志 
    let scrollSpeed = 2;  // 背景滾動速度  
    let enemyScrollSpeed = 18;  // 敵人滾動速度  
    let boosterpackSpeed = 4;  // 補充包滾動速度 
    startButton.addEventListener('click', startGame);  // 為開始按鈕添加點擊事件監聽器，執行startGame函數
    retryButton.addEventListener('click', retryGame);  // 為重試按鈕添加點擊事件監聽器，執行retryGame函數
    let backgroundScrollInterval;  // 背景滾動的間隔
    let obstacleMoveInterval;  // 障礙物移動的間隔 
    let currentMusicIndex = 0;  // 當前音樂索引 
    const musicElements = [  // 音樂元素的陣列 
        document.getElementById('bgMusic1'),
        document.getElementById('bgMusic2'),
        document.getElementById('bgMusic3'),
        document.getElementById('bgMusic4')
    ];

    let generateObstacleInterval;  // 生成障礙物的間隔
    let generateEnemyInterval;  // 生成敵人的間隔
    let generatePowerUpInterval;  // 生成提升包的間隔
    let enemyMoveInterval;  // 敵人移動的間隔 
    const enemies = [];  // 敵人陣列
    const startTime = new Date().getTime();  // 遊戲開始的時間戳

    function playNextMusic() {  // 播放下一首音樂的函數
        musicElements[currentMusicIndex].pause();  // 暫停當前音樂
        musicElements[currentMusicIndex].currentTime = 0;  // 重置當前音樂的播放時間

        currentMusicIndex = (currentMusicIndex + 1) % musicElements.length;  // 更新音樂索引

        musicElements[currentMusicIndex].play();  // 播放下一首音樂
    }

    // 為每一個音樂元素添加結束事件監聽器，當音樂播放結束時執行playNextMusic函數
    musicElements.forEach(musicEl => {  
        musicEl.onended = playNextMusic;
    });

    // 定義 startGame 函數，遊戲開始時調用
    function startGame() {
        isGameOver = false;  // 設置遊戲是否結束的標誌為 false
        startButton.style.display = 'none';  // 將開始遊戲按鈕隱藏
        // 創建兩個 img 元素用於背景
        const bg1 = document.createElement('img');
        const bg2 = document.createElement('img');
        // 設置這兩個背景圖片的來源路徑
        bg1.src = './asset/bg/forest4.png';
        bg2.src = './asset/bg/forest4.png';
        // 設置背景圖片的 CSS 樣式，使其絕對定位在頂部左側
        bg1.style.position = 'absolute';
        bg2.style.position = 'absolute';
        bg1.style.top = '0';
        bg1.style.left = '0';
        bg2.style.top = '0';
        // 設置背景圖片的寬度和高度
        bg1.style.width = '100%';  
        bg1.style.height = 'auto'; 
        bg2.style.width = '100%';  
        bg2.style.height = 'auto'; 
        // 將背景圖片添加到遊戲區域中
        gameArea.appendChild(bg1);
        gameArea.appendChild(bg2);
        // 初始化玩家分數和能量包數量
        let playerScore = 0;
        let powerUpCount = 0;
        // 播放背景音樂
        musicElements[currentMusicIndex].play();
        retryButton.style.display = 'none';  // 將重試遊戲按鈕隱藏
        const gameWidth = gameArea.offsetWidth;  // 獲取遊戲區域的寬度
        bg2.style.left = `${gameWidth}px`;  // 設置第二個背景圖片的左側位置為遊戲區域的寬度

        // 清除背景滾動的間隔，並設定新的間隔來滾動背景
        clearInterval(backgroundScrollInterval);
        backgroundScrollInterval = setInterval(function () {
            // 計算新的左邊距，並更新背景圖片的位置
            const newLeft1 = parseInt(bg1.style.left) - scrollSpeed;
            const newLeft2 = parseInt(bg2.style.left) - scrollSpeed;
            bg1.style.left = `${newLeft1}px`;
            bg2.style.left = `${newLeft2}px`;

            // 如果背景圖片滾動到一定位置，將其重置回遊戲區域的寬度
            if (newLeft1 <= -gameWidth) {
                bg1.style.left = `${newLeft2 + gameWidth}px`;
            }
            if (newLeft2 <= -gameWidth) {
                bg2.style.left = `${newLeft1 + gameWidth}px`;
            }
        }, 16);  // 這裡的 16 毫秒大概對應於 60FPS

        // 創建一個 img 元素用於玩家角色
        const playerImage = document.createElement('img');
        playerImage.src = './asset/player/player.png';  // 設置玩家角色圖片的來源路徑
        // 設置玩家角色圖片的 CSS 樣式
        playerImage.style.position = 'absolute';
        playerImage.style.bottom = '40px';
        playerImage.style.left = '10px';
        playerImage.style.width = '10%';  
        playerImage.style.height = '40%';
        // 將玩家角色圖片添加到遊戲區域中 
        gameArea.appendChild(playerImage);
        // 初始化跳躍高度、跳躍速度以及跳躍和下落的動畫
        let jumpHeight = 0;  
        const jumpSpeed = 4;
        let jumpAnimation;
        let fallAnimation;
        this.runningAnimation;  // 用於參考正在進行的跑步動畫
        let isColliding = false;  // 是否發生碰撞
        let playerAnimationFrame = 1;  // 玩家動畫的幀數

         // 定義開始跑步動畫的函數
        function startRunningAnimation() {
            clearInterval(this.runningAnimation);  // 清除正在進行的跑步動畫  
            this.runningAnimation = setInterval(function () {
                // 更新玩家動畫的幀數
                playerAnimationFrame++;
                if (playerAnimationFrame > 3) {
                    playerAnimationFrame = 1;
                }
                // 設置玩家角色圖片來源路徑
                playerImage.src = `./asset/player/player.png`;
            }, 150);  // 每150毫秒更新一次動畫幀數
        }

        startRunningAnimation();  // 調用開始跑步動畫的函數
        const bubbles = [];  // 初始化泡泡陣列，用於攻擊效果 
        let isAttacking = false;  // 是否正在攻擊的標誌

        // 監聽鍵盤按下事件
        document.addEventListener('keydown', function (e) {
            if (isGameOver) {  // 如果遊戲已經結束，則不執行任何操作
                return;
            }

            // 如果按下的是向上箭頭鍵，且沒有發生碰撞
            if (e.key === 'ArrowUp' && !isColliding) {
                clearInterval(this.runningAnimation);  // 清除跑步動畫
                clearInterval(jumpAnimation);  // 清除跳躍動畫 
                clearInterval(fallAnimation);  // 清除下降動畫 

                const jumpSound = document.getElementById('jumpSound');  // 獲取跳躍聲音元素
                jumpSound.currentTime = 0;  // 重置聲音播放位置 
                jumpSound.play();  // 播放跳躍聲音

                playerImage.src = `./asset/player/player.png`;  // 設定玩家圖片為跳躍狀態 
                jumpHeight = 100;  // 初始化跳躍高度 

                jumpAnimation = setInterval(function () {
                    playerImage.style.bottom = `${parseInt(playerImage.style.bottom) + jumpSpeed}px`;  // 更新玩家底部位置
                    jumpHeight -= jumpSpeed;  // 更新跳躍高度

                    // 如果跳躍高度降至一定程度，更改玩家圖片為下降狀態
                    if (jumpHeight <= 70) {
                        playerImage.src = `./asset/player/player.png`;  // 暫無變化，應該是更換為下降圖片 
                    }

                    // 如果跳躍高度為0，清除跳躍動畫，開始下降動畫
                    if (jumpHeight <= 0) { 
                        clearInterval(jumpAnimation);

                        playerImage.src = `./asset/player/player.png`;  // 暫無變化，應該是更換為正常圖片 
                        // 創建下降動畫
                        fallAnimation = setInterval(function () {
                            playerImage.style.bottom = `${parseInt(playerImage.style.bottom) - jumpSpeed}px`;  // 更新玩家底部位置

                             // 如果玩家回到初始位置，清除下降動畫，恢復跑步動畫
                            if (parseInt(playerImage.style.bottom) <= 40) {
                                playerImage.style.bottom = '40px';
                                clearInterval(fallAnimation);
                                playerImage.src = `./asset/player/player.png`;  // 暫無變化，應該是更換為跑步圖片 
                                startRunningAnimation();  // 重新開始跑步動畫 
                            }
                        }, 16);  // 每16毫秒更新一次位置，約等於60FPS
                    }
                }, 16);
            }

            // 如果按下的是空白鍵，且不是在攻擊狀態和碰撞狀態
            if (e.key === ' ' && !isAttacking && !isColliding) {
                const bubbleSound = document.getElementById('bubbleSound');  // 獲取泡泡聲音元素
                bubbleSound.currentTime = 0;  // 重置聲音播放位置 
                bubbleSound.play();  // 播放泡泡聲音
                const bubbleImage = document.createElement('img');  // 創建一個圖片元素作為泡泡
                bubbleImage.src = './asset/coffee.png';  // 設定泡泡圖片
                bubbleImage.style.position = 'absolute';  // 設定泡泡絕對定位
                bubbleImage.style.bottom = `${parseInt(playerImage.style.bottom) + 60}px`;  // 設定泡泡的底部位置
                const gameWidth = gameArea.offsetWidth;  // 獲取遊戲區域寬度  
                bubbleImage.style.left = `${parseInt(playerImage.style.left) + 80}px`;  // 設定泡泡的左側位置 
                gameArea.appendChild(bubbleImage);  // 將泡泡添加到遊戲區域
                bubbles.push(bubbleImage);  // 將泡泡添加到泡泡陣列
                isAttacking = true;  // 設定為攻擊狀態
                clearInterval(this.runningAnimation);  // 清除跑步動畫
                attackAnimationFrame = 1;  // 初始化攻擊動畫幀數
                playerImage.src = `./asset/player/player.png`;  // 設定玩家圖片為攻擊狀態

                // 創建攻擊動畫
                attackAnimation = setInterval(function () {
                    attackAnimationFrame++;  // 更新攻擊動畫幀數
                    // 如果攻擊動畫幀數超過3，重置動畫幀數，清除攻擊動畫，恢復跑步動畫
                    if (attackAnimationFrame > 3) {
                        attackAnimationFrame = 1;
                        clearInterval(attackAnimation);
                        isAttacking = false;
                        startRunningAnimation();  // 重新開始跑步動畫
                        return;
                    }
                    playerImage.src = `./asset/player/player.png`;  // 暫無變化，應該是更換攻擊動畫圖片
                }, 150);  // 每150毫秒更新一次動畫
            }

            // 判斷當按下空格鍵，且玩家角色不在攻擊狀態也沒有發生碰撞時
            if (e.key === ' ' && !isAttacking && !isColliding) {
                isAttacking = true;  // 將攻擊狀態設定為真
                clearInterval(this.runningAnimation);  // 清除正在進行的跑步動畫
                attackAnimationFrame = 1;  // 將攻擊動畫的幀數重置為1
                playerImage.src = `./asset/player/player.png`;  // 將玩家圖片設定為攻擊動作的圖片

                // 設置一個定時器，用於執行攻擊動畫
                attackAnimation = setInterval(function () {
                    attackAnimationFrame++;  // 增加攻擊動畫的幀數
                    // 如果攻擊動畫幀數大於3，則重置幀數，清除攻擊動畫，並使玩家角色恢復跑步動畫
                    if (attackAnimationFrame > 3) {
                        attackAnimationFrame = 1;  // 重置攻擊動畫幀數
                        clearInterval(attackAnimation);  // 清除攻擊動畫
                        isAttacking = false;  // 將攻擊狀態設定為假
                        startRunningAnimation();  // 調用 startRunningAnimation 函數使玩家角色恢復跑步動畫
                        return;  // 退出函數執行
                    }
                    playerImage.src = `./asset/player/player.png`;  // 循環播放攻擊動作的圖片
                }, 150);  // 每150毫秒更新一次攻擊動畫幀數
            }
        });

        // 監聽鍵盤彈起事件
        document.addEventListener('keyup', function (e) {
            if (isGameOver) {  // 如果遊戲已經結束，則不執行任何操作
                return;
            }

            // 如果釋放的是空白鍵，且處於攻擊狀態
            if (e.key === ' ' && isAttacking) {
                isAttacking = false;  // 設定不再攻擊
                clearInterval(attackAnimation);  // 清除攻擊動畫
                startRunningAnimation();  // 重新開始跑步動畫
            }
        });

        // 使用 setInterval 設置一個每16毫秒執行一次的定時器
        setInterval(function () {

            bubbles.forEach((bubble, index) => {  // 對 bubbles 數組中的每個 bubble 對象進行遍歷
                bubble.style.left = `${parseInt(bubble.style.left) + 5}px`;  // 將泡泡向右移動5個像素

                // 如果泡泡移出了屏幕（左邊界超過1000px），從遊戲區域中移除泡泡並從數組中刪除
                if (parseInt(bubble.style.left) > 1000) {
                    gameArea.removeChild(bubble);
                    bubbles.splice(index, 1);
                }

                // 對 enemies 數組中的每個 enemy 對象進行遍歷
                enemies.forEach((enemy, enemyIndex) => {
                    const bubbleRect = bubble.getBoundingClientRect();  // 獲取泡泡的位置和尺寸
                    const enemyRect = enemy.getBoundingClientRect();  // 獲取敵人的位置和尺寸

                    // 檢查泡泡和敵人是否相交，且敵人在遊戲區域內
                    if (bubbleRect.left < enemyRect.right &&
                        bubbleRect.right > enemyRect.left &&
                        bubbleRect.top < enemyRect.bottom &&
                        bubbleRect.bottom > enemyRect.top &&
                        enemyRect.right > 0 &&   
                        enemyRect.left < 945) { 
                        const enemyDeathSound = document.getElementById('enemyDeathSound');
                        enemyDeathSound.currentTime = 0;  // 重置死亡聲音播放位置 
                        enemyDeathSound.play();  // 播放死亡聲音
                        enemy.src = './asset/obstacle/devil/hurt/enemy_hurt.gif';  // 更改敵人圖片為受傷動畫

                        // 設置一個延遲，在1秒後移除敵人並從數組中刪除
                        setTimeout(() => {
                            gameArea.removeChild(enemy);
                            enemies.splice(enemyIndex, 1);
                        }, 1000);

                        // 移除泡泡並從數組中刪除
                        gameArea.removeChild(bubble);
                        bubbles.splice(index, 1);
                        playerScore += 1;   // 玩家分數增加，並更新顯示的分數
                        document.getElementById("playerScore").textContent = playerScore;
                    }
                });

                // 對 powerUps 數組中的每個 powerUp 對象進行遍歷
                powerUps.forEach((powerUp, powerUpIndex) => {
                    const bubbleRect = bubble.getBoundingClientRect();  // 獲取泡泡的位置和尺寸
                    const powerUpRect = powerUp.getBoundingClientRect();  // 獲取補充包的位置和尺寸

                    // 檢查泡泡和能量包是否相交，且能量包在遊戲區域內
                    if (bubbleRect.left < powerUpRect.right &&
                        bubbleRect.right > powerUpRect.left &&
                        bubbleRect.top < powerUpRect.bottom &&
                        bubbleRect.bottom > powerUpRect.top &&
                        powerUpRect.right > 0 &&    
                        powerUpRect.left < 948) {  
                        const healthRecoverySound = document.getElementById('healthRecoverySound');
                        healthRecoverySound.currentTime = 0;  // 重置恢復聲音播放位置 
                        healthRecoverySound.play();  // 播放恢復聲音
                        // 移除補充包並從數組中刪除
                        gameArea.removeChild(powerUp);
                        powerUps.splice(powerUpIndex, 1);
                        // 移除泡泡並從數組中刪除
                        gameArea.removeChild(bubble);
                        bubbles.splice(index, 1);

                        powerUpCount++;  // 補充包計數增加，並更新顯示的計數
                        document.getElementById("powerUpCounter").textContent = powerUpCount;
                    }
                });
            });
        }, 16);  // 這裡的 16 毫秒大約對應於每秒 60 次的更新頻率

        // obstacles 為存儲障礙物的數組
        const obstacles = []; 
        // BUFFER 和 MBUFFER 為障礙物的緩衝區域常量，用於調整障礙物的生成和移動
        const BUFFER = 10 
        const MBUFFER = 70; 
        this.runningAnimationTimeout;  // 用於參考跑步動畫的超時變量

        // 定義一個生成障礙物的函數
        function generateObstacle() {
            const obstacleImage = document.createElement('img');  // 創建一個新的 img 元素
            obstacleImage.src = './asset/obstacle/rock2.png';  // 設定該圖片的來源路徑
            obstacleImage.style.position = 'absolute';  // 將圖片位置設定為絕對定位
            obstacleImage.style.bottom = '20px';  // 將圖片固定在距離底部 20px 的位置  
            const gameWidth = gameArea.offsetWidth;  // 獲取遊戲區域的寬度  
            obstacleImage.style.left = `${gameWidth}px`;  // 將圖片放在遊戲區域的最右側
            gameArea.appendChild(obstacleImage);  // 將圖片元素添加到遊戲區域
            obstacles.push(obstacleImage);  // 將此障礙物添加到障礙物陣列
            obstacleImage.isHit = false;  // 為障礙物添加一個屬性，表示它尚未撞擊

            // 計算隨機時間用於生成下一個障礙物，時間範圍在6000至10000毫秒之間
            const randomObstacleTime = 6000 + Math.random() * 4000;  
            clearInterval(generateObstacleInterval);  // 清除當前的障礙物生成定時器
            generateObstacleInterval = setInterval(generateObstacle, randomObstacleTime);  // 使用新的隨機時間設定一個定時器以生成下一個障礙物
        }

        // 清除障礙物生成定時器並設置一個新的定時器，每8秒生成一個障礙物
        clearInterval(generateObstacleInterval);  
        generateObstacleInterval = setInterval(generateObstacle, 8000);                  

        // 清除障礙物移動定時器並設置一個新的定時器，用於障礙物的移動
        clearInterval(obstacleMoveInterval);
        obstacleMoveInterval = setInterval(function () {
            obstacles.forEach((obstacle, index) => {  // 遍歷障礙物陣列中的每個障礙物
                obstacle.style.left = `${parseInt(obstacle.style.left) - scrollSpeed}px`;  // 向左移動障礙物

                // 如果障礙物移出遊戲區域左側界限（-50px），則從遊戲區域移除障礙物並從陣列中刪除
                if (parseInt(obstacle.style.left) < -50) {
                    gameArea.removeChild(obstacle);
                    obstacles.splice(index, 1);
                    obstacle.isHit = false;  // 重置障礙物的撞擊狀態  
                }

                // 獲取玩家和障礙物的位置和尺寸
                const playerRect = playerImage.getBoundingClientRect();
                const obstacleRect = obstacle.getBoundingClientRect();

                // 檢查玩家是否與障礙物相撞
                if (!obstacle.isHit &&
                    playerRect.left + BUFFER < obstacleRect.right &&
                    playerRect.right - BUFFER > obstacleRect.left &&
                    playerRect.top + BUFFER < obstacleRect.bottom &&
                    playerRect.bottom - BUFFER > obstacleRect.top) {

                    isColliding = true;  // 設定碰撞狀態為真
                    playerImage.style.filter = 'brightness(0.5)';  // 將玩家圖像變暗表示受到傷害 
                    clearInterval(this.runningAnimation);  // 清除跑步動畫
                    clearTimeout(this.runningAnimationTimeout);  // 清除動畫的超時定時器
                    hideHeart();  // 執行隱藏心形圖示的函數 
                    obstacle.isHit = true;  // 設定障礙物為已撞擊狀態 

                    // 設置一個定時器，500毫秒後恢復玩家圖像的亮度
                    setTimeout(() => {
                        playerImage.style.filter = 'brightness(1)'; 
                    }, 500);  

                    // 設置一個定時器，在220毫秒後如果玩家沒有發生碰撞，則重新開始跑步動畫
                    runningAnimationTimeout = setTimeout(() => {
                        isColliding = false;  // 重置碰撞狀態為假
                        if (!isColliding) {
                            startRunningAnimation();  // 重新開始跑步動畫
                        }
                    }, 220);
                }
            });
        }, 16);  // 每16毫秒更新一次障礙物位置，約等於60FPS的更新頻率

        // 定義生成敵人的函數
        function generateEnemy() {
            const currentTime = new Date().getTime();  // 獲取當前時間的時間戳
            const elapsedTime = (currentTime - startTime) / 1000;  // 計算從遊戲開始到現在經過的時間（秒）  
            const statusBarHeight = document.querySelector('.statusBar').offsetHeight;  // 獲取狀態欄的高度 
            const obstacleHeight = 50;  // 障礙物的預設高度  
            // 計算敵人圖片的最大頂部位置，以防止敵人出現在狀態欄或障礙物下方
            const maxTopPosition = gameArea.offsetHeight - obstacleHeight - statusBarHeight;
            const enemyImage = document.createElement('img');  // 創建一個新的 img 元素用於敵人
            enemyImage.src = './asset/obstacle/devil/walk/enemy_walk.gif';  // 設定敵人圖片的來源路徑
            enemyImage.style.position = 'absolute';  // 設定敵人圖片為絕對定位
            // 設定敵人圖片的頂部位置，隨機在遊戲區域內合法範圍
            enemyImage.style.top = `${Math.random() * (maxTopPosition - statusBarHeight) + statusBarHeight}px`;  // 保證敵人出現在 statusBar 下面且在障礙物的上面
            const gameWidth = gameArea.offsetWidth;  // 獲取遊戲區域的寬度  
            enemyImage.style.left = `${gameWidth}px`;  // 設定敵人圖片出現在遊戲區域的最右側
            gameArea.appendChild(enemyImage);  // 將敵人圖片添加到遊戲區域
            enemies.push(enemyImage);  // 將敵人添加到敵人陣列   
            enemyImage.isHit = false;  // 為敵人設定一個未被擊中的標記

            // 根據遊戲已進行的時間來設定生成敵人的隨機間隔時間
            let randomEnemyTime; 
            if (elapsedTime < 5) {
                randomEnemyTime = 8000;  // 如果遊戲進行時間小於5秒，間隔時間為8秒  
            } else {
                // 否則間隔時間為7000至10000毫秒之間的隨機值
                randomEnemyTime = 7000 + Math.random() * 3000;  
            }

            // 清除之前的生成敵人定時器，並設定一個新的定時器以依據隨機時間生成敵人
            clearInterval(generateEnemyInterval);
            generateEnemyInterval = setInterval(generateEnemy, randomEnemyTime);
        }

        // 初始化生成敵人的定時器，每10秒生成一個敵人
        clearInterval(generateEnemyInterval);
        generateEnemyInterval = setInterval(generateEnemy, 10000);  

        // 清除移動敵人的定時器，並設定一個新的定時器以控制敵人的移動
        clearInterval(enemyMoveInterval);
        enemyMoveInterval = setInterval(function () {
            // 遍歷所有敵人
            enemies.forEach((enemy, index) => {
                enemy.style.left = `${parseInt(enemy.style.left) - enemyScrollSpeed}px`;  // 向左移動敵人
                if (parseInt(enemy.style.left) < -100) {  // 如果敵人移出螢幕，從遊戲區域和陣列中移除
                    gameArea.removeChild(enemy);
                    enemies.splice(index, 1);
                    enemy.isHit = false; 
                }

                // 獲取玩家和敵人的位置和尺寸
                const playerRect = playerImage.getBoundingClientRect();
                const enemyRect = enemy.getBoundingClientRect();

                // 如果敵人未被擊中且玩家與敵人發生碰撞
                if (!enemy.isHit &&
                    playerRect.left + MBUFFER < enemyRect.right &&
                    playerRect.right - MBUFFER > enemyRect.left &&
                    playerRect.top + MBUFFER < enemyRect.bottom &&
                    playerRect.bottom - MBUFFER > enemyRect.top) {

                    isColliding = true;  // 設定碰撞狀態為真
                    playerImage.style.filter = 'brightness(0.5)';  // 降低玩家圖像的亮度來表示受傷
                    clearInterval(this.runningAnimation);  // 清除跑步動畫
                    clearTimeout(this.runningAnimationTimeout);  // 清除跑步動畫的超時定時器
                    hideHeart();  // 執行隱藏心形圖示的函數
                    enemy.isHit = true;  // 標記敵人為已擊中狀態 

                    // 設置一個定時器，在500毫秒後恢復玩家圖像的亮度
                    setTimeout(() => {
                        playerImage.style.filter = 'brightness(1)'; 
                    }, 500);  

                     // 設置一個定時器，在1000毫秒後如果玩家沒有發生碰撞，則重新開始跑步動畫
                    runningAnimationTimeout = setTimeout(() => {
                        isColliding = false;  // 重置碰撞狀態為假
                        if (!isColliding) {
                            startRunningAnimation();  // 重新開始跑步動畫
                        }
                    }, 1000);
                }
            });
        }, 150);  // 每150毫秒更新一次敵人位置 

        // 定義一個函數用於隱藏愛心，通常表示玩家失去一個生命
        function hideHeart() {
            // 選擇所有未被標記為透明的愛心元素
            const visibleHearts = document.querySelectorAll('.heart:not(.transparent)');
            if (visibleHearts.length > 0) {  // 如果還有可見的愛心
                // 獲取最後一個愛心元素，將其背景圖片設置為透明
                visibleHearts[visibleHearts.length - 1].style.backgroundImage = "url('asset/transparent.png')";
                visibleHearts[visibleHearts.length - 1].classList.add('transparent');  // 為該愛心添加透明類別
            }

            // 如果只剩下一個可見的愛心，則調用 gameOver 函數結束遊戲
            if (visibleHearts.length === 1) { 
                gameOver();
            }
        }

        const powerUps = [];  // 初始化一個空陣列來存儲補充包
        let generatePowerUpInterval;  // 宣告一個變量用於儲存生成補充包的定時器 

        // 定義一個生成補充包的函數
        function generatePowerUp() {
            const statusBarHeight = document.querySelector('.statusBar').offsetHeight;  // 獲取狀態欄的高度  
            const obstacleHeight = 50;  // 設定障礙物的高度 
            const maxTopPosition = gameArea.offsetHeight - obstacleHeight - statusBarHeight;  // 計算補充包的最大頂部位置

            const powerUpImage = document.createElement('img');  // 創建一個新的圖片元素作為補充包
            powerUpImage.src = './asset/buff/bunny.png';  // 設定圖片的來源路徑  
            powerUpImage.style.position = 'absolute';  // 設定圖片位置為絕對定位
            // 設定圖片的頂部位置，使其出現在狀態欄下面且在障礙物上面
            powerUpImage.style.top = `${Math.random() * (maxTopPosition - statusBarHeight) + statusBarHeight}px`;
            const gameWidth = gameArea.offsetWidth;  // 獲取遊戲區域的寬度  
            powerUpImage.style.left = `${gameWidth}px`;  // 將圖片放置在遊戲區域的最右邊 
            gameArea.appendChild(powerUpImage);  // 將圖片元素添加到遊戲區域
            powerUps.push(powerUpImage);  // 將該補充包添加到 powerUps 數組

            const randomPowerUpTime = 7000 + Math.random() * 6000;  // 設定生成下一個補充包的隨機時間  
            clearInterval(generatePowerUpInterval);  // 清除當前的補充包生成定時器
            // 設定新的定時器以依據隨機時間生成補充包
            generatePowerUpInterval = setInterval(generatePowerUp, randomPowerUpTime);
        }

        // 初始化補充包生成的定時器，每10秒生成一個
        clearInterval(generatePowerUpInterval);
        generatePowerUpInterval = setInterval(generatePowerUp, 10000);  

        // 設定一個定時器，定期檢查並更新所有補充包的位置
        setInterval(function () {
            powerUps.forEach((powerUp, index) => {  // 遍歷 powerUps 數組中的每個元素
                powerUp.style.left = `${parseInt(powerUp.style.left) - boosterpackSpeed}px`;  // 向左移動補充包

                // 如果補充包移出了螢幕，從遊戲區域和數組中移除
                if (parseInt(powerUp.style.left) < -50) {
                    gameArea.removeChild(powerUp);
                    powerUps.splice(index, 1);
                }

                // 獲取玩家和補充包的位置和尺寸
                const playerRect = playerImage.getBoundingClientRect();
                const powerUpRect = powerUp.getBoundingClientRect();

                // 如果玩家接觸到補充包，則從遊戲區域和數組中移除
                if (playerRect.left + BUFFER < powerUpRect.right &&
                    playerRect.right - BUFFER > powerUpRect.left &&
                    playerRect.top + BUFFER < powerUpRect.bottom &&
                    playerRect.bottom - BUFFER > powerUpRect.top) {

                    gameArea.removeChild(powerUp);
                    powerUps.splice(index, 1);
                }
            });
        }, 16);  // 每16毫秒執行一次，約等於60FPS的更新頻率
    }

    // 定義 retryGame 函數，當玩家選擇重試遊戲時調用
    function retryGame() {
        retryButton.style.display = 'none';  // 隱藏重試按鈕
        // 清除所有相關的定時器和超時，以停止遊戲中的所有動畫和事件
        clearInterval(backgroundScrollInterval);
        clearInterval(obstacleMoveInterval);
        clearInterval(this.runningAnimation);
        clearTimeout(this.runningAnimationTimeout);
        clearInterval(enemyMoveInterval);
        clearInterval(generateObstacleInterval);
        clearInterval(generateEnemyInterval);
        clearInterval(generatePowerUpInterval);
    }

    // 定義 gameOver 函數，當玩家遊戲結束時調用
    function gameOver() {
        isGameOver = true;  // 設定遊戲結束的標記為真  
        document.querySelector('.gameOver').classList.remove('hidden');  // 顯示遊戲結束的提示
        // 清除所有相關的定時器和超時
        clearInterval(generateObstacleInterval);
        clearInterval(obstacleMoveInterval);
        clearInterval(generateEnemyInterval);
        clearInterval(enemyMoveInterval);
        clearInterval(generatePowerUpInterval);
        clearInterval(this.runningAnimation);
        clearTimeout(this.runningAnimationTimeout);

        // 更新遊戲結束的提示訊息
        const gameOverDiv = document.querySelector(".gameOver");
        gameOverDiv.innerHTML = `Game Over`;

        // 顯示開始按鈕，並設置其層級，準備讓玩家重新開始遊戲
        startButton.style.display = 'block';
        startButton.style.zIndex = 99;
        startButton.onclick = resetGame;  // 設置開始按鈕點擊後調用 resetGame 函數 
    }

    // 定義 resetGame 函數，用於重置遊戲
    function resetGame() {
        window.location.reload();  // 重新加載當前頁面，從而重新開始遊戲
    }

});