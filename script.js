const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 12, paddleHeight = 100;
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4ae",
};
const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#e44",
    speed: 4
};
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 6,
    velocityX: 6,
    velocityY: 3,
    color: "#fff"
};

let playerScore = 0, aiScore = 0;

// Draw functions
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
    ctx.font = "40px Segoe UI, Arial";
    ctx.fillText(text, x, y);
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.velocityY = (Math.random() * 2 - 1) * ball.speed * 0.75;
}

// Collision detection
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// Game update
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Collide with top/bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY *= -1;
    }

    // Collide with paddles
    let hitPaddle = null;
    if (ball.x - ball.radius < player.x + player.width && collision(ball, player)) {
        hitPaddle = player;
    } else if (ball.x + ball.radius > ai.x && collision(ball, ai)) {
        hitPaddle = ai;
    }

    if (hitPaddle) {
        // Calculate angle
        let collidePoint = (ball.y - (hitPaddle.y + hitPaddle.height / 2));
        collidePoint = collidePoint / (hitPaddle.height / 2);
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = (hitPaddle === player) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.5; // Gradually increase ball speed
    }

    // Score update
    if (ball.x - ball.radius < 0) {
        aiScore++;
        resetBall();
        ball.speed = 6;
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        ball.speed = 6;
    }

    // AI movement (simple tracking)
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) {
        ai.y -= ai.speed;
    } else if (ball.y > aiCenter + 10) {
        ai.y += ai.speed;
    }
    // Clamp AI paddle within canvas
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

// Render everything
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#333");

    // Draw middle dashed line
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([16, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles, ball, scores
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    drawText(playerScore, canvas.width / 4, 50, "#4ae");
    drawText(aiScore, canvas.width * 3 / 4, 50, "#e44");
}

// Main game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Mouse movement for player paddle
canvas.addEventListener("mousemove", e => {
    // Move player's paddle to mouse's Y position (clamped)
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});

// Start game
resetBall();
game();