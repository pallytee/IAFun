let particles = [];
const numParticles = 1000;
let leftPerson = { x: 0, y: 0 };
let rightPerson = { x: 0, y: 0 };
let isActive = false;
let isFrogActive = false;
let isTogetherActive = false;
let input;
let frogs = [];
const NUM_FROGS = 50;

function setup() {
    let canvas = createCanvas(7680, 742);
    canvas.parent('p5-container');
    
    // Initialize particles and frogs
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    
    for (let i = 0; i < NUM_FROGS; i++) {
        frogs.push(new Frog());
    }

    // Get the input element from HTML
    input = select('#word-input');
    input.input(handleInput);
}

function handleInput() {
    let word = input.value().toLowerCase();
    if (word.includes('mushroom')) {
        isActive = true;
        leftPerson.x = mouseX;
        leftPerson.y = mouseY;
        rightPerson.x = width/2 - mouseX;
        rightPerson.y = mouseY;
        input.value('');
        input.attribute('placeholder', "Type 'frog'...");
    }
    if (word.includes('frog')) {
        isFrogActive = true;
        input.value('');
        input.attribute('placeholder', "Type 'together'...");
    }
    if (word.includes('together')) {
        isTogetherActive = true;
        // Give particles and frogs random velocities
        particles.forEach(p => {
            p.chaosMode = true;
            p.vx = random(-10, 10);
            p.vy = random(-10, 10);
        });
        frogs.forEach(f => {
            f.chaosMode = true;
            f.vx = random(-10, 10);
            f.vy = random(-10, 10);
        });
        input.value('');
        input.attribute('placeholder', "Watch the chaos unfold...");
    }
}

function draw() {
    background(0, 20);

    if (isTogetherActive) {
        // Chaotic mode - everything moves freely
        for (let particle of particles) {
            particle.updateChaos();
            particle.display();
        }
        for (let frog of frogs) {
            frog.updateChaos();
            frog.display();
        }
    } else {
        // Normal mode - split screen
        if (isActive) {
            leftPerson.x = constrain(mouseX, 0, width/2);
            leftPerson.y = mouseY;
            
            for (let particle of particles) {
                if (particle.x < width/2) {
                    if (isActive) {
                        particle.update();
                    }
                    particle.display();
                }
            }
        }

        if (isFrogActive) {
            for (let frog of frogs) {
                if (frog.x > width/2) {
                    frog.update();
                    frog.display();
                }
            }
        }
    }
}

class Particle {
    constructor() {
        this.resetPosition();
        this.size = random(15, 30);
        this.speed = random(2, 4);
        this.color = color(random(200, 255), random(50, 150), random(50, 150));
        this.capHeight = this.size * 0.6;
        this.stemWidth = this.size * 0.3;
        this.stemHeight = this.size * 0.4;
        this.chaosMode = false;
        this.vx = 0;
        this.vy = 0;
    }

    resetPosition() {
        this.x = random(width/2);
        this.y = random(height);
    }

    updateChaos() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        // Add some randomness
        this.vx += random(-0.5, 0.5);
        this.vy += random(-0.5, 0.5);
        
        // Limit speed
        this.vx = constrain(this.vx, -15, 15);
        this.vy = constrain(this.vy, -15, 15);
    }

    update() {
        if (!this.chaosMode) {
            let dLeft = dist(this.x, this.y, leftPerson.x, leftPerson.y);
            let angle = atan2(leftPerson.y - this.y, leftPerson.x - this.x);
            this.x = constrain(this.x + cos(angle) * this.speed, 0, width/2);
            this.y += sin(angle) * this.speed;

            if (dLeft < 30) {
                this.resetPosition();
            }
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        
        // Draw mushroom stem
        noStroke();
        fill(240);
        rect(-this.stemWidth/2, 0, this.stemWidth, this.stemHeight);
        
        // Draw mushroom cap
        fill(this.color);
        beginShape();
        vertex(-this.size/2, 0);
        vertex(-this.size/2, -this.capHeight/2);
        vertex(0, -this.capHeight);
        vertex(this.size/2, -this.capHeight/2);
        vertex(this.size/2, 0);
        endShape(CLOSE);
        
        fill(255);
        let numDots = floor(random(3, 6));
        for(let i = 0; i < numDots; i++) {
            let dotX = random(-this.size/3, this.size/3);
            let dotY = random(-this.capHeight, -this.capHeight/3);
            rect(dotX, dotY, 4, 4);
        }
        pop();
    }
}

class Frog {
    constructor() {
        this.reset();
        this.size = random(30, 50);
        this.color = color(random(50, 100), random(150, 200), random(50, 100));
        this.jumpHeight = random(100, 200);
        this.jumpSpeed = random(0.02, 0.05);
        this.chaosMode = false;
        this.vx = 0;
        this.vy = 0;
    }

    reset() {
        this.x = random(width/2, width);
        this.y = height - 50;
        this.startY = this.y;
        this.jumpPhase = random(TWO_PI);
    }

    updateChaos() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        // Add some randomness
        this.vx += random(-0.5, 0.5);
        this.vy += random(-0.5, 0.5);
        
        // Limit speed
        this.vx = constrain(this.vx, -15, 15);
        this.vy = constrain(this.vy, -15, 15);
    }

    update() {
        if (!this.chaosMode) {
            this.jumpPhase += this.jumpSpeed;
            this.y = this.startY - sin(this.jumpPhase) * this.jumpHeight;
            
            if (this.jumpPhase > TWO_PI) {
                this.reset();
            }
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        
        fill(this.color);
        noStroke();
        
        rect(-this.size/2, -this.size/2, this.size, this.size);
        
        fill(255);
        rect(-this.size/3, -this.size/2, this.size/6, this.size/6);
        rect(this.size/6, -this.size/2, this.size/6, this.size/6);
        
        fill(0);
        rect(-this.size/3, -this.size/2, this.size/12, this.size/12);
        rect(this.size/6, -this.size/2, this.size/12, this.size/12);
        
        fill(this.color);
        rect(-this.size/2, 0, this.size/4, this.size/2);
        rect(this.size/4, 0, this.size/4, this.size/2);
        
        pop();
    }
}

function mouseMoved() {
    if (isActive && !isTogetherActive) {
        leftPerson.x = constrain(mouseX, 0, width/2);
        leftPerson.y = mouseY;
    }
}

function mouseReleased() {
    setTimeout(() => {
        if (!isTogetherActive) {
            isActive = false;
        }
    }, 3000);
}