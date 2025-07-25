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
    velocityX: 5,
    velocityY: 5,
    color: '#fff'
};

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
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
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Reverse direction
    ball.velocityX = -ball.velocityX;
    // Randomize Y again
    ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
    ball.speed = 5;
}

// Mouse movement for player paddle
canvas.addEventListener('mousemove', evt => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp paddle inside canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Collision detection helper
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// AI movement (simple: follow the ball with some smoothing)
function moveAI() {
    let center = ai.y + ai.height / 2;
    if (ball.y < center - 10) ai.y -= 4;
    else if (ball.y > center + 10) ai.y += 4;
    // Clamp AI paddle inside canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top/bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width + ball.radius; // Prevent sticking
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angle = collidePoint * (Math.PI / 4); // Max 45deg
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        // Increase speed
        ball.speed += 0.2;
    }

    // AI paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.radius; // Prevent sticking
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);
        let angle = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        ball.speed += 0.2;
    }

    // Score logic
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    moveAI();
}

function render() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#111");
    // Center line
    for (let i = 0; i < canvas.height; i += 25) {
        drawRect(canvas.width / 2 - 1, i, 2, 15, "#fff4");
    }
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    // Draw scores
    drawText(player.score, canvas.width / 4, 40, "#fff");
    drawText(ai.score, 3 * canvas.width / 4, 40, "#fff");
}

function game() {
    update();
    render();
    requestAnimationFrame(game);
}

game();