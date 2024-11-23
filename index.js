import { Sprite } from "./sprite.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const friction = 0.9;

canvas.width = 1024 * 1.2;
canvas.height = 576 * 1.2;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

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

function animate() {
  window.requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

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
      player.velocity.y = -13;
    } else if (keys.a.pressed) {
      handleDash("left", player); // Dash left during jump if double-pressed
      player.velocity.y = -13;
    } else {
      player.velocity.y = -10;
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
      enemy.velocity.y = -13;
    } else if (keys.f.pressed) {
      handleDash("left", enemy); // Dash left during jump if double-pressed
      enemy.velocity.y = -13;
    } else {
      enemy.velocity.y = -10;
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
    player.attack1box.position.y + player.attack1box.height >= enemy.position.y &&
    player.attack1box.position.y <= enemy.position.y + enemy.height &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    console.log("Player hits Enemy!", player.attack1box.position);
  }

  // Collision detection for enemy's attack on player
  if (
    enemyAttackBoxEndX >= player.position.x &&
    enemyAttackBoxStartX <= player.position.x + player.width && 
    enemy.attack1box.position.y + enemy.attack1box.height >= player.position.y &&
    enemy.attack1box.position.y <= player.position.y + player.height &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    console.log("Enemy hits Player!", enemy.attack1box.position);
  }
}

animate();

function handleDash(direction, character) {
  if (character === player && !isDashing) {
    isDashing = true;
    character.velocity.x = direction === "right" ? 14 : -14;
    clearTimeout(dashTimeout);
    dashTimeout = setTimeout(() => {
      isDashing = false;
    }, dashDuration);
  } else if (character === enemy && !isEnemyDashing) {
    isEnemyDashing = true;
    character.velocity.x = direction === "right" ? 14 : -14;
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
        player.velocity.x = 5;
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
        player.velocity.x = -5;
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
        enemy.velocity.x = 5;
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
        enemy.velocity.x = -5;
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
      break
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
  }
});
