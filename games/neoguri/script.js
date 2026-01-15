const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

// Game constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const SPEED = 5;

// Game state
let score = 0;
let gameLoop;
let isGameRunning = false;
let frameCount = 0;

// Player
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    dy: 0,
    dx: 0,
    grounded: false,
    color: '#fbbf24' // warm amber
};

// Platforms
const platforms = [
    { x: 0, y: 350, width: 600, height: 50 }, // Ground
    { x: 200, y: 250, width: 100, height: 20 },
    { x: 400, y: 200, width: 100, height: 20 },
    { x: 50, y: 150, width: 100, height: 20 }
];

// Items (Apples)
let items = [];

// Enemies (Snakes)
let enemies = [];

function initGame() {
    score = 0;
    scoreElement.innerText = score;
    player.x = 50;
    player.y = 300;
    player.dy = 0;
    player.dx = 0;

    // Reset items
    items = [
        { x: 230, y: 220, width: 15, height: 15, collected: false },
        { x: 430, y: 170, width: 15, height: 15, collected: false },
        { x: 80, y: 120, width: 15, height: 15, collected: false },
        { x: 550, y: 320, width: 15, height: 15, collected: false }
    ];

    // Reset enemies
    enemies = [
        { x: 300, y: 330, width: 25, height: 20, speed: 2, dir: 1, type: 'snake' },
        { x: 450, y: 180, width: 20, height: 20, speed: 1.5, dir: -1, type: 'snake' }
    ];
}

function startGame() {
    initGame();
    isGameRunning = true;
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');

    if (gameLoop) cancelAnimationFrame(gameLoop);
    update();
}

function update() {
    if (!isGameRunning) return;

    frameCount++;

    // Player Movement
    player.dy += GRAVITY;
    player.y += player.dy;
    player.x += player.dx;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Platform Collision
    player.grounded = false;
    platforms.forEach(platform => {
        if (
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10 && // Check top collision only mostly
            player.x + player.width - 5 > platform.x &&
            player.x + 5 < platform.x + platform.width &&
            player.dy >= 0
        ) {
            player.grounded = true;
            player.dy = 0;
            player.y = platform.y - player.height;
        }
    });

    if (player.y > canvas.height) {
        // Fell off (shouldn't happen with full ground, but safe guard)
        gameOver();
    }

    // Item Collection
    items.forEach(item => {
        if (!item.collected && checkCollision(player, item)) {
            item.collected = true;
            score += 100;
            scoreElement.innerText = score;
            // Respawn item elsewhere after a while? For now simple clear.
            if (items.every(i => i.collected)) {
                // All collected, maybe respawn all?
                setTimeout(() => {
                    items.forEach(i => i.collected = false);
                }, 2000);
            }
        }
    });

    // Enemy Collision
    enemies.forEach(enemy => {
        // Move Enemy
        enemy.x += enemy.speed * enemy.dir;

        // Simple patrol logic
        if (enemy.x > canvas.width - 50 || enemy.x < 50) enemy.dir *= -1;

        if (checkCollision(player, enemy)) {
            gameOver();
        }
    });

    draw();
    gameLoop = requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background (Simple Classic Style)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    ctx.fillStyle = '#b45309'; // Ground color
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // Add "brick" detail
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
    });

    // Draw Items (Apples)
    items.forEach(item => {
        if (!item.collected) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Enemies (Snakes)
    enemies.forEach(enemy => {
        ctx.fillStyle = '#22c55e';
        // Wiggle effect
        const wiggle = Math.sin(frameCount * 0.2) * 2;
        ctx.fillRect(enemy.x, enemy.y + wiggle, enemy.width, enemy.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + (enemy.dir > 0 ? 15 : 2), enemy.y + 2 + wiggle, 4, 4);
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player Eyes (Racoon mask hint)
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + (player.dx >= 0 ? 18 : 2), player.y + 8, 8, 4);
    ctx.fillRect(player.x + (player.dx >= 0 ? 2 : 18), player.y + 8, 8, 4);
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(gameLoop);
    finalScoreElement.innerText = score;
    gameOverScreen.classList.add('active');
}

// Controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;

    if (e.key === 'ArrowLeft') {
        player.dx = -SPEED;
    } else if (e.key === 'ArrowRight') {
        player.dx = SPEED;
    } else if (e.code === 'Space') {
        if (player.grounded) {
            player.dy = JUMP_STRENGTH;
            player.grounded = false;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
});
