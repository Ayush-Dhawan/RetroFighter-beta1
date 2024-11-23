const canvasHeight = 576 * 1.2;
const baseGravity = 0.2; // Base gravity without x-velocity influence
const friction = 0.99; // Factor to simulate air resistance

export class Sprite {
    constructor({ position, velocity, context, height, lastDirection }) {
        this.position = position;
        this.velocity = velocity;
        this.context = context;
        this.height = height;
        this.width = 50;
        this.lastDirection = lastDirection;
        this.attack1box = {
            position: this.position,
            width: 100,
            height: 50
        }
        this.isAttacking = false;
    }

    draw() {
        this.context.fillStyle = "red";
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height); // height, width

        //attack box 1
        if(this.isAttacking){
            this.context.fillStyle = "green";
            this.context.fillRect(this.attack1box.position.x, this.attack1box.position.y, this.attack1box.width, this.attack1box.height)
        }
    }

    update() {
        this.draw();

        // Calculate gravity with a factor based on the absolute x velocity
        const gravity = baseGravity + Math.abs(this.velocity.x) * 0.01;

        // Apply gravity to vertical velocity
        if (this.position.y + this.height + this.velocity.y >= canvasHeight) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity;
        }

        // Apply friction to horizontal velocity
        this.velocity.x *= friction;

        // Update position with current velocities
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

       
    }

    attack(){
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}
