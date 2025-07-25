const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10, paddleHeight = 80;
const ballRadius = 10;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#4caf50',
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#f44336',
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    color: '#ffffff'
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "32px Arial";
    ctx.fillText(text, x, y);
}

// Reset ball with pause and direction
function resetBall(winner = "player") {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = 0;
    ball.velocityY = 0;

    setTimeout(() => {
        const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
        const direction = winner === "player" ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
    }, 1000); // 1 second delay
}

// Player controls
canvas.addEventListener('mousemove', evt => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Collision detection
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// Simple AI movement
function moveAI() {
    let center = ai.y + ai.height / 2;
    if (ball.y < center - 10) ai.y -= 4;
    else if (ball.y > center + 10) ai.y += 4;

    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Game logic update
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width + ball.radius;
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        ball.speed += 0.2;
    }

    // AI paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.radius;
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        ball.speed += 0.2;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall("ai");
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall("player");
    }

    moveAI();
}

// Drawing the game frame
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    // Midline
    for (let i = 0; i < canvas.height; i += 25) {
        drawRect(canvas.width / 2 - 1, i, 2, 15, "#fff4");
    }

    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    drawText(player.score, canvas.width / 4, 40, "#fff");
    drawText(ai.score, 3 * canvas.width / 4, 40, "#fff");
}

// Main game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Start game
resetBall("player");
game();
