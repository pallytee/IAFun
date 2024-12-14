let particles = [];
const numParticles = 1000;
let leftPerson = { x: 0, y: 0 };
let rightPerson = { x: 0, y: 0 };
let isActive = false;
let isFrogActive = false;
let isTogetherActive = false;
let isSalsaActive = false;
let isDancehallActive = false;
let isTangoActive = false;
let input;
let frogs = [];
const NUM_FROGS = 50;
let dancehallBeat = 0;
let tangoPhase = 0;

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
        input.attribute('placeholder', "Type 'salsa' to dance...");
    }
    if (word.includes('salsa')) {
        isSalsaActive = true;
        isDancehallActive = false;
        isTangoActive = false;
        isTogetherActive = false;
        // Add salsa movement patterns
        particles.forEach(p => {
            p.salsaMode = true;
            p.chaosMode = false;
            p.dancehallMode = false;
            p.tangoMode = false;
            p.salsaPhase = random(TWO_PI);
            p.salsaSpeed = random(0.02, 0.05);
        });
        frogs.forEach(f => {
            f.salsaMode = true;
            f.chaosMode = false;
            f.dancehallMode = false;
            f.tangoMode = false;
            f.salsaPhase = random(TWO_PI);
            f.salsaSpeed = random(0.02, 0.05);
        });
        input.value('');
        input.attribute('placeholder', "Type 'dancehall' to change the beat...");
    }
    if (word.includes('dancehall')) {
        isDancehallActive = true;
        isSalsaActive = false;
        isTangoActive = false;
        isTogetherActive = false;
        // Add dancehall movement patterns
        particles.forEach(p => {
            p.dancehallMode = true;
            p.salsaMode = false;
            p.chaosMode = false;
            p.tangoMode = false;
            p.dancehallPhase = random(TWO_PI);
            p.dancehallAmplitude = random(30, 80);
        });
        frogs.forEach(f => {
            f.dancehallMode = true;
            f.salsaMode = false;
            f.chaosMode = false;
            f.tangoMode = false;
            f.dancehallPhase = random(TWO_PI);
            f.dancehallAmplitude = random(50, 100);
        });
        input.value('');
        input.attribute('placeholder', "Type 'tango' for a romantic dance...");
    }
    if (word.includes('tango')) {
        isTangoActive = true;
        isDancehallActive = false;
        isSalsaActive = false;
        isTogetherActive = false;
        
        // Pair up mushrooms and frogs for tango
        for(let i = 0; i < Math.min(particles.length, frogs.length); i++) {
            particles[i].tangoMode = true;
            particles[i].salsaMode = false;
            particles[i].chaosMode = false;
            particles[i].dancehallMode = false;
            particles[i].tangoPartner = frogs[i];
            particles[i].tangoPhase = random(TWO_PI);
            
            frogs[i].tangoMode = true;
            frogs[i].salsaMode = false;
            frogs[i].chaosMode = false;
            frogs[i].dancehallMode = false;
            frogs[i].tangoPartner = particles[i];
            frogs[i].tangoPhase = particles[i].tangoPhase;
        }
        
        input.value('');
        input.attribute('placeholder', "Watch them tango...");
    }
}

function draw() {
    background(0, 20);
    dancehallBeat += 0.1; // Control the beat speed
    tangoPhase += 0.02; // Slow, romantic pace

    if (isTangoActive) {
        // Tango mode
        for (let i = 0; i < Math.min(particles.length, frogs.length); i++) {
            particles[i].updateTango();
            particles[i].display();
            frogs[i].updateTango();
            frogs[i].display();
        }
    } else if (isDancehallActive) {
        // Dancehall mode
        for (let particle of particles) {
            particle.updateDancehall();
            particle.display();
        }
        for (let frog of frogs) {
            frog.updateDancehall();
            frog.display();
        }
    } else if (isSalsaActive) {
        // Salsa dance mode
        for (let particle of particles) {
            particle.updateSalsa();
            particle.display();
        }
        for (let frog of frogs) {
            frog.updateSalsa();
            frog.display();
        }
    } else if (isTogetherActive) {
        // Chaotic mode
        for (let particle of particles) {
            particle.updateChaos();
            particle.display();
        }
        for (let frog of frogs) {
            frog.updateChaos();
            frog.display();
        }
    } else {
        // Normal split-screen mode
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
        this.salsaMode = false;
        this.salsaPhase = 0;
        this.salsaSpeed = 0;
        this.originalX = 0;
        this.originalY = 0;
        this.tangoMode = false;
        this.tangoPartner = null;
        this.tangoPhase = 0;
        this.tangoLeading = true;
        this.dancehallMode = false;
        this.dancehallPhase = 0;
        this.dancehallAmplitude = random(30, 80);
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

    updateSalsa() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;
        
        // Create figure-8 salsa movement
        this.salsaPhase += this.salsaSpeed;
        this.x = this.originalX + sin(this.salsaPhase) * 100;
        this.y = this.originalY + sin(2 * this.salsaPhase) * 50;
    }

    updateTango() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;

        // Create elegant tango movements
        this.tangoPhase += 0.02;
        
        // Figure-8 pattern with dramatic pauses
        let progress = this.tangoPhase % TWO_PI;
        let pause = sin(progress * 2) < 0.2; // Create dramatic pauses
        
        if (!pause) {
            // Lead dancer movement
            let radius = 100;
            let figure8X = sin(progress) * radius;
            let figure8Y = sin(2 * progress) * radius/2;
            
            this.x = this.originalX + figure8X;
            this.y = this.originalY + figure8Y;
            
            // Partner follows with slight delay
            if (this.tangoPartner) {
                this.tangoPartner.x = this.x - figure8X * 0.5;
                this.tangoPartner.y = this.y - figure8Y * 0.5;
            }
        }
        
        // Add slight rotation during movement
        this.rotation = sin(this.tangoPhase) * 0.2;
    }

    updateDancehall() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;

        // Create energetic dancehall movements
        this.dancehallPhase += 0.1;
        let bounce = abs(sin(dancehallBeat)) * this.dancehallAmplitude;
        let shake = cos(this.dancehallPhase * 2) * 20;
        
        this.x = this.originalX + shake;
        this.y = this.originalY - bounce;
        
        // Add some rotation to the display
        this.rotation = sin(this.dancehallPhase) * 0.3;
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
        this.salsaMode = false;
        this.salsaPhase = 0;
        this.salsaSpeed = 0;
        this.originalX = 0;
        this.originalY = 0;
        this.tangoMode = false;
        this.tangoPartner = null;
        this.tangoPhase = 0;
        this.tangoLeading = false;
        this.dancehallMode = false;
        this.dancehallPhase = 0;
        this.dancehallAmplitude = random(50, 100);
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

    updateSalsa() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;
        
        // Create salsa spin movement
        this.salsaPhase += this.salsaSpeed;
        this.x = this.originalX + cos(this.salsaPhase) * 75;
        this.y = this.originalY + sin(this.salsaPhase) * 75;
    }

    updateTango() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;
        
        // Follower movement is handled by leader
        if (!this.tangoLeading) {
            this.rotation = -sin(this.tangoPhase) * 0.2; // Counter-rotation to partner
        }
    }

    updateDancehall() {
        if (!this.originalX) this.originalX = this.x;
        if (!this.originalY) this.originalY = this.y;

        // Create more aggressive dancehall movements for frogs
        this.dancehallPhase += 0.15;
        let bounce = abs(sin(dancehallBeat * 1.5)) * this.dancehallAmplitude;
        let shake = cos(this.dancehallPhase * 3) * 30;
        
        this.x = this.originalX + shake;
        this.y = this.originalY - bounce;
        
        // Add some scaling effect
        this.scale = 1 + sin(this.dancehallPhase) * 0.2;
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