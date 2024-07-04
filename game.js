const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const player = {
    x: 50,
    y: canvasHeight - 60,
    width: 40,
    height: 40,
    speed: 5,
    dx: 0,
    dy: 0,
    jumpHeight: -20, // Increased jump height
    gravity: 1,
    isJumping: false,
    isOnGround: true,
    lives: 3,
    speedBoost: false,
    invincible: false
};

const kong = {
    x: canvasWidth / 2 - 50,
    y: 50,
    width: 100,
    height: 100
};

const captive = {
    x: canvasWidth / 2 - 20,
    y: kong.y + kong.height,
    width: 40,
    height: 40
};

const barrels = [];
const barrelInterval = 2000;
let lastBarrelTime = 0;
let score = 0;
let level = 1;

const powerUps = [];
const powerUpTypes = ['speed', 'invincible'];
const powerUpInterval = 10000;
let lastPowerUpTime = 0;

const levels = [
    // Level 1
    [
        { x: 0, y: canvasHeight - 20, width: canvasWidth, height: 20 },
        { x: 150, y: 400, width: 500, height: 20 },
        { x: 0, y: 300, width: 300, height: 20 },
        { x: 500, y: 200, width: 300, height: 20 }
    ],
    // Level 2
    [
        { x: 0, y: canvasHeight - 20, width: canvasWidth, height: 20 },
        { x: 100, y: 450, width: 600, height: 20 },
        { x: 0, y: 350, width: 400, height: 20 },
        { x: 450, y: 250, width: 350, height: 20 },
        { x: 100, y: 150, width: 600, height: 20 }
    ]
];

let platforms = levels[0];
const ladders = [
    { x: 200, y: 300, width: 20, height: 100 },
    { x: 600, y: 200, width: 20, height: 200 }
];

function drawPlayer() {
    ctx.fillStyle = player.invincible ? 'purple' : 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawKong() {
    ctx.fillStyle = 'brown';
    ctx.fillRect(kong.x, kong.y, kong.width, kong.height);
}

function drawCaptive() {
    ctx.fillStyle = 'red';
    ctx.fillRect(captive.x, captive.y, captive.width, captive.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawLadders() {
    ctx.fillStyle = 'yellow';
    ladders.forEach(ladder => {
        ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
    });
}

function drawBarrels() {
    ctx.fillStyle = 'orange';
    barrels.forEach(barrel => {
        ctx.beginPath();
        ctx.arc(barrel.x, barrel.y, barrel.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.type === 'speed') {
            ctx.fillStyle = 'cyan';
        } else if (powerUp.type === 'invincible') {
            ctx.fillStyle = 'gold';
        }
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);
}

function drawLives() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Lives: ' + player.lives, canvasWidth - 100, 30);
}

function drawLevel() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Level: ' + level, canvasWidth / 2 - 40, 30);
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Apply gravity
    if (!player.isOnGround) {
        player.dy += player.gravity;
    }

    // Check for collisions with platforms
    player.isOnGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
                player.isOnGround = true;
                player.dy = 0;
                player.y = platform.y - player.height;
        }
    });

    // Check for collisions with canvas boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvasWidth) player.x = canvasWidth - player.width;
    if (player.y + player.height > canvasHeight) {
        player.y = canvasHeight - player.height;
        player.isOnGround = true;
        player.dy = 0;
    }
}

function updateBarrels() {
    barrels.forEach(barrel => {
        barrel.y += barrel.dy;
        barrel.x += barrel.dx;

        // Check for collisions with platforms
        platforms.forEach(platform => {
            if (barrel.x - barrel.radius < platform.x + platform.width &&
                barrel.x + barrel.radius > platform.x &&
                barrel.y + barrel.radius > platform.y &&
                barrel.y - barrel.radius < platform.y + platform.height) {
                barrel.dy = 0;
                barrel.y = platform.y - barrel.radius;

                // Alternate barrel direction
                if (barrel.dx === 0) {
                    barrel.dx = barrel.speed;
                } else if (barrel.x - barrel.radius <= platform.x) {
                    barrel.dx = barrel.speed;
                } else if (barrel.x + barrel.radius >= platform.x + platform.width) {
                    barrel.dx = -barrel.speed;
                }
            }
        });

        // Remove barrels that fall off the screen
        if (barrel.y - barrel.radius > canvasHeight) {
            barrels.splice(barrels.indexOf(barrel), 1);
            score += 10; // Increase score for each barrel avoided
        }
    });

    // Check for collisions with player
    barrels.forEach(barrel => {
        if (!player.invincible && barrel.x - barrel.radius < player.x + player.width &&
            barrel.x + barrel.radius > player.x &&
            barrel.y + barrel.radius > player.y &&
            barrel.y - barrel.radius < player.y + player.height) {
            player.lives -= 1; // Decrease lives on collision
            barrels.splice(barrels.indexOf(barrel), 1); // Remove barrel on collision
            if (player.lives <= 0) {
                alert('Game Over! Final Score: ' + score);
                document.location.reload();
            }
        }
    });
}

function createBarrel() {
    const barrel = {
        x: kong.x + kong.width / 2,
        y: kong.y + kong.height,
        radius: 15,
        speed: 3 + level, // Increase barrel speed with level
        dx: 0,
        dy: 2
    };
    barrels.push(barrel);
}

function createPowerUp() {
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const powerUp = {
        x: Math.random() * (canvasWidth - 20),
        y: Math.random() * (canvasHeight - 20),
        width: 20,
        height: 20,
        type: type
    };
    powerUps.push(powerUp);
}

function updatePowerUps() {
    powerUps.forEach(powerUp => {
        // Check for collisions with player
        if (powerUp.x < player.x + player.width &&
            powerUp.x + powerUp.width > player.x &&
            powerUp.y < player.y + player.height &&
            powerUp.y + powerUp.height > player.y) {
            if (powerUp.type === 'speed') {
                player.speedBoost = true;
                setTimeout(() => player.speedBoost = false, 5000);
            } else if (powerUp.type === 'invincible') {
                player.invincible = true;
                setTimeout(() => player.invincible = false, 5000);
            }
            powerUps.splice(powerUps.indexOf(powerUp), 1); // Remove power-up on collision
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawPlayer();
    drawKong();
    drawCaptive();
    drawPlatforms();
    drawLadders();
    drawBarrels();
    drawPowerUps();
    drawScore();
    drawLives();
    drawLevel();
}

function update() {
    updatePlayer();
    updateBarrels();
    updatePowerUps();

    // Check for winning condition
    if (player.x < captive.x + captive.width &&
        player.x + player.width > captive.x &&
        player.y < captive.y + captive.height &&
        player.y + player.height > captive.y) {
        score += 100; // Increase score for reaching the captive
        level += 1; // Increase level
        if (level > levels.length) {
            alert('You Win! Final Score: ' + score);
            document.location.reload();
        } else {
            platforms = levels[level - 1];
            player.x = 50;
            player.y = canvasHeight - 60;
            barrels.length = 0;
        }
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);

    // Create barrels at intervals
    if (Date.now() - lastBarrelTime > barrelInterval) {
        createBarrel();
        lastBarrelTime = Date.now();
    }

    // Create power-ups at intervals
    if (Date.now() - lastPowerUpTime > powerUpInterval) {
        createPowerUp();
        lastPowerUpTime = Date.now();
    }
}

function moveRight() {
    player.dx = player.speedBoost ? player.speed * 2 : player.speed;
}

function moveLeft() {
    player.dx = player.speedBoost ? -player.speed * 2 : -player.speed;
}

function stop() {
    player.dx = 0;
}

function jump() {
    if (player.isOnGround) {
        player.dy = player.jumpHeight;
        player.isOnGround = false;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
    if (e.key === 'ArrowUp' || e.key === 'w') jump();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') stop();
    if (e.key === 'ArrowLeft' || e.key === 'a') stop();
});

loop();