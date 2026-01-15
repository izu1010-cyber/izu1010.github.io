const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

// Game State
let score = 0;
let gameLoop;
let isGameRunning = false;
let roadY = 0;
let speed = 5;

// Player Car
const player = {
    x: 120, // Center lane approx
    y: 400,
    width: 40,
    height: 70,
    color: '#ef4444', // Red
    speed: 5
};

// Enemy Cars
let enemies = [];
const lanes = [30, 130, 230]; // 3 lanes x position (approx center of lanes 0-100, 100-200, 200-300?) 
// Actually canvas is 300 wide. lanes: 0-100, 100-200, 200-300. Center of lanes: 50, 150, 250.
const laneCenters = [50, 150, 250];

function initGame() {
    score = 0;
    scoreElement.innerText = score;
    player.x = 130;  // Middle lane
    enemies = [];
    speed = 5;
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

    // Update Score
    score++;
    scoreElement.innerText = Math.floor(score / 10);

    // Increase difficulty
    if (score % 500 === 0) speed += 0.5;

    // Scroll Road (Visual only)
    roadY += speed;
    if (roadY > 40) roadY = 0;

    // Spawn Enemies
    if (Math.random() < 0.02) {
        spawnEnemy();
    }

    // Update Enemies
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += speed * 0.8; // Enemies move slower than background effectively coming down
        // Or actually, enemies are static relative to road, so they move at road speed? 
        // Let's say enemies are slower cars, so we pass them. They move down screen.

        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
            continue;
        }

        // Collision Check
        if (checkCollision(player, enemies[i])) {
            gameOver();
            return;
        }
    }

    draw();
    gameLoop = requestAnimationFrame(update);
}

function spawnEnemy() {
    const lane = Math.floor(Math.random() * 3);
    const enemy = {
        x: laneCenters[lane] - 20, // Center in lane
        y: -100,
        width: 40,
        height: 70,
        color: getRandomColor()
    };

    // Prevent overlapping spawn (simple check)
    if (enemies.some(e => Math.abs(e.y - enemy.y) < 150)) return;

    enemies.push(enemy);
}

function getRandomColor() {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function draw() {
    // Fill Road
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Lane Markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);

    ctx.beginPath();
    ctx.moveTo(100, -40 + roadY);
    ctx.lineTo(100, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(200, -40 + roadY);
    ctx.lineTo(200, canvas.height);
    ctx.stroke();

    // Draw Grass/Shoulders
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, 10, canvas.height);
    ctx.fillRect(290, 0, 10, canvas.height);

    // Draw Enemies
    enemies.forEach(car => drawCar(car));

    // Draw Player
    drawCar(player);
}

function drawCar(car) {
    ctx.fillStyle = car.color;
    // Main body
    ctx.fillRect(car.x, car.y, car.width, car.height);

    // Roof/Windshield
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(car.x + 5, car.y + 15, car.width - 10, 20); // Windshield
    ctx.fillRect(car.x + 5, car.y + 45, car.width - 10, 10); // Rear window

    // Headlights/Taillights
    ctx.fillStyle = '#fef08a'; // Yellow
    ctx.fillRect(car.x + 2, car.y + 2, 8, 5);
    ctx.fillRect(car.x + car.width - 10, car.y + 2, 8, 5);
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
    finalScoreElement.innerText = Math.floor(score / 10);
    gameOverScreen.classList.add('active');
}

// Controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;

    if (e.key === 'ArrowLeft') {
        if (player.x > 30) player.x -= 100; // Move Lane Left
    } else if (e.key === 'ArrowRight') {
        if (player.x < 200) player.x += 100; // Move Lane Right
    }
});
