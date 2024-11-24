import { Sprite } from "./sprite.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const friction = 0.9;

canvas.width = 1024;
canvas.height = 576;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let playerBarrierHealth = 100;
let enemyBarrierHealth = 100;

let playerMainHealth = 200;
let enemyMainHealth = 200;

let keys = {
  a: {
    pressed: false,
    lastPressedTime: 0,
  },
  d: {
    pressed: false,
    lastPressedTime: 0,
  },
  w: {
    pressed: false,
  },
  // Additional keys for Player 2 (enemy)
  f: {
    pressed: false,
    lastPressedTime: 0,
  },
  h: {
    pressed: false,
    lastPressedTime: 0,
  },
  t: {
    pressed: false,
  },
  o: {
    pressed: false,
  },
  // ShiftRight: {
  //   pressed: false,
  // }
};

let lastKey;
let lastEnemyKey;
let canJump = true;
let canEnemyJump = true;
let isDashing = false;
let isEnemyDashing = false;
let dashDuration = 150;
let dashTimeout = 100;
let enemyDashDuration = 150;
let enemyDashTimeout = 100;
let timerID;

let barrierparticles = [];
let barrierTarget = null;

// Barrier properties
const barrier = {
  color: "rgba(255, 255, 0, 0.7)",
  glowColor: "rgba(255, 255, 0, 0.9)",
  thickness: 5,
  radiusX: 35, // Horizontal radius for rounded sides
  radiusY: 80, // Vertical radius for rounded sides
  offset: 35, // Distance from the sprite
  particleCount: 20, // Number of particles on the barrier path
};

const player = new Sprite({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 6 },
  context: ctx,
  height: 150,
  lastDirection: "right",
});

const enemy = new Sprite({
  position: { x: 400, y: 100 },
  velocity: { x: 0, y: 6 },
  context: ctx,
  height: 150,
  lastDirection: "left",
});

function createParticles(target) {
  barrierparticles = []; // Clear any existing particles

  // Only create particles if the target has barrier health
  if (
    (target === player && playerBarrierHealth > 0) ||
    (target === enemy && enemyBarrierHealth > 0)
  ) {
    for (let i = 0; i < barrier.particleCount; i++) {
      const side = Math.random() < 0.5 ? -1 : 1; // -1 for left, 1 for right
      const angle = Math.random() * Math.PI; // Random position along the curve

      const offset = barrier.offset + 2 * side; // 2-unit offset for particles from barrier

      // Create particles along the curved path
      barrierparticles.push({
        side: side,
        angle: angle,
        x:
          target.position.x +
          side * (target.width / 2) +
          side * Math.sin(angle) * barrier.radiusX +
          target.width / 2,
        y:
          target.position.y +
          target.height / 2 +
          Math.cos(angle) * barrier.radiusY,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.5,
        speedX: Math.cos(angle) * 0.1 * side,
        speedY: Math.sin(angle) * 0.1,
      });
    }
  }
}

// Draw particles around the target (player or enemy)
function drawParticles(target) {
  // Only draw particles if the target has barrier health
  if (
    (target === player && playerBarrierHealth > 0) ||
    (target === enemy && enemyBarrierHealth > 0)
  ) {
    barrierparticles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 0, ${particle.alpha})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update particle position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Check if particle goes out of bounds, reposition based on the bracket style
      if (
        particle.side === -1 && // Left side
        (particle.x > target.position.x - target.width / 2 - barrier.offset ||
          particle.y < target.position.y - barrier.radiusY ||
          particle.y > target.position.y + barrier.radiusY)
      ) {
        // Reposition for the left bracket
        particle.x = target.position.x - target.width / 2 - barrier.offset;
        particle.y =
          target.position.y -
          barrier.radiusY +
          Math.random() * (2 * barrier.radiusY);
        particle.speedX = 0; // No horizontal movement for side brackets
        particle.speedY = (Math.random() - 0.5) * 0.3; // Slight vertical movement for effect
      } else if (
        particle.side === 1 && // Right side
        (particle.x < target.position.x + target.width / 2 + barrier.offset ||
          particle.y < target.position.y - barrier.radiusY ||
          particle.y > target.position.y + barrier.radiusY)
      ) {
        // Reposition for the right bracket
        particle.x = target.position.x + target.width / 2 + barrier.offset;
        particle.y =
          target.position.y -
          barrier.radiusY +
          Math.random() * (2 * barrier.radiusY);
        particle.speedX = 0; // No horizontal movement for side brackets
        particle.speedY = (Math.random() - 0.5) * 0.3; // Slight vertical movement for effect
      }
    });
  }
}

function determineWinner(){
  clearTimeout(timerID)
  const winnerText = document.querySelector(".winner-text");
    document.querySelector(".victory-image").style.display = "block"
    if(enemyMainHealth == playerMainHealth){
      if(enemyBarrierHealth == playerBarrierHealth) winnerText.innerHTML = "Tie!"
      else if (enemyBarrierHealth > playerBarrierHealth) winnerText.innerHTML = "Player 2 Wins!"
      else winnerText.innerHTML = "Player 1 Wins!"
    }else if(enemyMainHealth > playerMainHealth){
      winnerText.innerHTML = "Player 2 Wins!"
    }else{
      winnerText.innerHTML = "Player 1 Wins!"
    }
}

let time_left = 60;
function decrementTimer(){
  timerID = setTimeout(decrementTimer, 1000);
  if(time_left > 0) {
    time_left--;
    document.querySelector('.timer').innerHTML = time_left;
  }else{
    determineWinner()
  }
}

decrementTimer();

function animate() {
  window.requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  // Draw barrier around the target if activated
  if (barrierTarget) {
    createParticles(barrierTarget);
    drawParticles(barrierTarget);
  }

  //handle player attack direction / viewing direction
  if (player.lastDirection === "left") {
    player.attack1box.width = -100 + player.width;
  } else {
    player.attack1box.width = 100;
  }

  if (enemy.lastDirection === "left") {
    enemy.attack1box.width = -100 + enemy.width;
  } else {
    enemy.attack1box.width = 100;
  }

  // Player boundaries
  if (player.position.x < 0) {
    player.position.x = 0;
  } else if (player.position.x + player.width > canvas.width) {
    player.position.x = canvas.width - player.width;
  }

  if (player.position.y < 0) {
    player.position.y = 0;
  } else if (player.position.y + player.height > canvas.height) {
    player.position.y = canvas.height - player.height;
    player.velocity.y = 0.2;
  }

  // Enemy boundaries
  if (enemy.position.x < 0) {
    enemy.position.x = 0;
  } else if (enemy.position.x + enemy.width > canvas.width) {
    enemy.position.x = canvas.width - enemy.width;
  }

  if (enemy.position.y < 0) {
    enemy.position.y = 0;
  } else if (enemy.position.y + enemy.height > canvas.height) {
    enemy.position.y = canvas.height - enemy.height;
    enemy.velocity.y = 0.2;
  }

  // Player movement
  if (!isDashing) {
    if (keys.a.pressed && lastKey === "a") {
      player.velocity.x = -5;
    } else if (keys.d.pressed && lastKey === "d") {
      player.velocity.x = 5;
    }
    player.velocity.x *= friction;
  }

  // Enemy movement
  if (!isEnemyDashing) {
    if (keys.f.pressed && lastEnemyKey === "f") {
      enemy.velocity.x = -5;
    } else if (keys.h.pressed && lastEnemyKey === "h") {
      enemy.velocity.x = 5;
    }
    enemy.velocity.x *= friction;
  }

  // Player jump
  if (keys.w.pressed && canJump) {
    dashDuration = 400;
    if (keys.d.pressed) {
      handleDash("right", player); // Dash right during jump if double-pressed
      player.velocity.y = -10;
    } else if (keys.a.pressed) {
      handleDash("left", player); // Dash left during jump if double-pressed
      player.velocity.y = -10;
    } else {
      player.velocity.y = -8;
    }

    canJump = false;
    setTimeout(() => {
      canJump = true;
    }, 700);
  }

  // Enemy jump
  if (keys.t.pressed && canEnemyJump) {
    enemyDashDuration = 400;
    if (keys.h.pressed) {
      handleDash("right", enemy); // Dash right during jump if double-pressed
      enemy.velocity.y = -10;
    } else if (keys.f.pressed) {
      handleDash("left", enemy); // Dash left during jump if double-pressed
      enemy.velocity.y = -10;
    } else {
      enemy.velocity.y = -8;
    }

    canEnemyJump = false;
    setTimeout(() => {
      canEnemyJump = true;
    }, 700);
  }

  //detect for collision
  // Calculate the actual attack box bounds for the player based on direction
  const playerAttackBoxStartX =
    player.attack1box.width >= 0
      ? player.attack1box.position.x
      : player.attack1box.position.x + player.attack1box.width;

  const playerAttackBoxEndX =
    player.attack1box.width >= 0
      ? player.attack1box.position.x + player.attack1box.width
      : player.attack1box.position.x;

  // Calculate the actual attack box bounds for the enemy based on direction
  const enemyAttackBoxStartX =
    enemy.attack1box.width >= 0
      ? enemy.attack1box.position.x
      : enemy.attack1box.position.x + enemy.attack1box.width;

  const enemyAttackBoxEndX =
    enemy.attack1box.width >= 0
      ? enemy.attack1box.position.x + enemy.attack1box.width
      : enemy.attack1box.position.x;

  // Collision detection for player's attack on enemy
  if (
    playerAttackBoxEndX >= enemy.position.x &&
    playerAttackBoxStartX <= enemy.position.x + enemy.width &&
    player.attack1box.position.y + player.attack1box.height >=
      enemy.position.y &&
    player.attack1box.position.y <= enemy.position.y + enemy.height &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    if (barrierTarget == enemy) {
      hitBarrier(enemy);
    } else {
      console.log("Player hits Enemy!", player.attack1box.position);
      enemyMainHealth -= 40; 
      const enemyHealthUI = document.querySelector(".enemyHealth");
      enemyHealthUI.style.width =
      enemyMainHealth > 0 ? enemyMainHealth / 2 + "%" : "0%";
    }
  }

  // Collision detection for enemy's attack on player
  if (
    enemyAttackBoxEndX >= player.position.x &&
    enemyAttackBoxStartX <= player.position.x + player.width &&
    enemy.attack1box.position.y + enemy.attack1box.height >=
      player.position.y &&
    enemy.attack1box.position.y <= player.position.y + player.height &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    if (barrierTarget == player) hitBarrier(player);
    else {
      console.log("Enemy hits Player!", enemy.attack1box.position);
      playerMainHealth-= 40; // Reduce enemy barrier health by 10
      const playerHealthUI = document.querySelector(".playerHealth");
      playerHealthUI.style.width =
        playerMainHealth > 0 ? playerMainHealth / 2 + "%" : "0%";
    }
  }
if(playerMainHealth <= 0 || enemyMainHealth <= 0) determineWinner();
  
}

function hitBarrier(target) {
  if (target === player && playerBarrierHealth > 0) {
    console.log("player barrier damaged");
    playerBarrierHealth -= 30; // Reduce enemy barrier health by 10
    const playerBarrier = document.querySelector(".playerBarrier");
    playerBarrier.style.width =
      playerBarrierHealth > 0 ? playerBarrierHealth + "%" : "0%";
    if (playerBarrierHealth <= 0) {
      barrierTarget = null; // Remove barrier if health is 0
    }
  } else if (target === enemy && enemyBarrierHealth > 0) {
    console.log("enemy barrier damaged");
    enemyBarrierHealth -= 30; // Reduce enemy barrier health by 10
    const enemyBarrier = document.querySelector(".enemyBarrier");
    enemyBarrier.style.width =
      enemyBarrierHealth > 0 ? enemyBarrierHealth + "%" : "0%";
    if (enemyBarrierHealth <= 0) {
      barrierTarget = null; // Remove barrier if health is 0
    }
  }
}

animate();

function handleDash(direction, character) {
  if (character === player && !isDashing) {
    isDashing = true;
    character.velocity.x = direction === "right" ? 5 : -5;
    clearTimeout(dashTimeout);
    dashTimeout = setTimeout(() => {
      isDashing = false;
    }, dashDuration);
  } else if (character === enemy && !isEnemyDashing) {
    isEnemyDashing = true;
    character.velocity.x = direction === "right" ? 5 : -5;
    clearTimeout(enemyDashTimeout);
    enemyDashTimeout = setTimeout(() => {
      isEnemyDashing = false;
    }, enemyDashDuration);
  }
}

window.addEventListener("keydown", (e) => {
  const currentTime = Date.now();

  switch (e.key) {
    // Player controls
    case "d":
      if (currentTime - keys.d.lastPressedTime < 300 && !keys.d.pressed) {
        handleDash("right", player);
      } else if (!keys.d.pressed) {
        player.velocity.x = 1;
      }
      keys.d.lastPressedTime = currentTime;
      keys.d.pressed = true;
      setTimeout(() => {
        keys.d.pressed = false;
      }, 150);
      lastKey = "d";
      player.lastDirection = "right";
      break;

    case "a":
      if (currentTime - keys.a.lastPressedTime < 300 && !keys.a.pressed) {
        handleDash("left", player);
      } else if (!keys.a.pressed) {
        player.velocity.x = -1;
      }
      keys.a.lastPressedTime = currentTime;
      keys.a.pressed = true;
      player.lastDirection = "left";
      setTimeout(() => {
        keys.a.pressed = false;
      }, 150);
      lastKey = "a";
      player.attack1box.position.x =
        player.attack1box.position.x - player.width;
      break;

    case "w":
      if (!keys.w.pressed) {
        keys.w.pressed = true;
      }
      break;

    // Enemy controls (TFGH)
    case "h":
      if (currentTime - keys.h.lastPressedTime < 300 && !keys.h.pressed) {
        handleDash("right", enemy);
      } else if (!keys.h.pressed) {
        enemy.velocity.x = 1;
      }
      keys.h.lastPressedTime = currentTime;
      keys.h.pressed = true;
      setTimeout(() => {
        keys.h.pressed = false;
      }, 150);
      lastEnemyKey = "h";
      enemy.lastDirection = "right";
      break;

    case "f":
      if (currentTime - keys.f.lastPressedTime < 300 && !keys.f.pressed) {
        handleDash("left", enemy);
      } else if (!keys.f.pressed) {
        enemy.velocity.x = -1;
      }
      keys.f.lastPressedTime = currentTime;
      keys.f.pressed = true;
      setTimeout(() => {
        keys.f.pressed = false;
      }, 150);
      lastEnemyKey = "f";
      enemy.lastDirection = "left";
      break;

    case "t":
      if (!keys.t.pressed) {
        keys.t.pressed = true;
      }
      break;

    //attacks

    case "j":
      player.attack();
      break;

    case "ArrowLeft":
      enemy.attack();
      break;

    case "o": // Activate barrier around player
      keys.o.pressed = true;
      barrierTarget = player;
      break;
    case " ": // Activate barrier around enemy
      // keys.ShiftRight.pressed = true;
      barrierTarget = enemy;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    // Player controls
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      keys.w.pressed = false;
      break;

    // Enemy controls (TFGH)
    case "h":
      keys.h.pressed = false;
      break;
    case "f":
      keys.f.pressed = false;
      break;
    case "t":
      keys.t.pressed = false;
      break;

    case "o":
      keys.o.pressed = false;
      barrierTarget = null;
      break;
    case " ":
      barrierTarget = null;
      break;
  }
});



document.getElementById("rematch-button").addEventListener("click", rematch);

function rematch(){
  location.reload();
}
