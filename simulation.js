// Optimized Utilities
const utils = {
    lerp: (start, end, amt) => (1 - amt) * start + amt * end,
    clamp: (value, min, max) => Math.max(min, Math.min(value, max)),
    randomRange: (min, max) => Math.random() * (max - min) + min,
    // Optimized distance calculation
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    getRandomColor: (mode = 'rainbow', singleColor = null) => {
        if (mode === 'single' && singleColor) return singleColor;

        // Pre-calculate and store HSL values for color modes
        switch (mode) {
            case 'rainbow':
                return `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
            case 'neon':
                const neonColors = [
                    '#ff0088', '#00ff99', '#00ffff', '#ff9900', '#ff00ff', '#ffff00'
                ];
                return neonColors[Math.floor(Math.random() * neonColors.length)];
            case 'cool':
                return `hsl(${Math.floor(utils.randomRange(180, 300))}, 70%, 60%)`;
            case 'warm':
                return `hsl(${Math.floor(utils.randomRange(0, 60))}, 80%, 60%)`;
            case 'pastel':
                return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
            case 'kinetic':
                return `hsl(0, 80%, 60%)`; // Base color, modified by speed
            default:
                return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
        }
    },

    getKineticColor: (speed, maxSpeed) => {
        // Optimize hue calculation
        const hue = Math.floor((speed / maxSpeed) * 240);
        return `hsl(${hue}, 80%, 60%)`;
    },
    //perlin noise
    fade: (t) => t * t * t * (t * (t * 6 - 15) + 10),

    lerp: (t, a, b) => a + t * (b - a),

    grad: (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },

    p: [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180],

    perm: [],

    setup: function () {
        for (let i = 0; i < 256; i++) {
            this.perm[i] = this.p[i];
        }
        for (let i = 0; i < 256; i++) {
            this.perm[i + 256] = this.perm[i];
        }
    },

    perlinNoise: function (x, y, z) {
        if (this.perm.length === 0) {
            this.setup(); // Initialize perm if it hasn't been already
        }
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))));
    }
};

// Particle Class with Optimizations
class Particle {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Default options (spread into options to reduce lookups)
        this.options = {
            size: utils.randomRange(4, 32),
            friction: 0.97,
            bounce: 0.85,
            mode: 'normal',
            type: 'circle',
            speedMultiplier: 0.5,
            colorMode: 'rainbow',
            singleColor: null,
            ...options,
        };

        this.color = this.options.color || utils.getRandomColor(this.options.colorMode, this.options.singleColor);
        this.mass = this.options.size * 0.1;
        this.rotation = 0;
        this.rotationSpeed = utils.randomRange(-0.02, 0.02) * this.options.speedMultiplier;
        this.colorUpdateCounter = 0;
        this.maxSpeed = 15 * this.options.speedMultiplier; // Pre-calculate maxSpeed

        // Poolable properties (initialized in reset)
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;

        this.reset();
    }

    reset() {
        const { canvas, options } = this;
        this.x = utils.randomRange(0, canvas.width);
        this.y = utils.randomRange(0, canvas.height);
        this.velocityX = utils.randomRange(-2, 2) * options.speedMultiplier;
        this.velocityY = utils.randomRange(-2, 2) * options.speedMultiplier;
        this.rotation = utils.randomRange(0, Math.PI * 2);
    }

    updateColor() {
        if (this.options.colorMode !== 'kinetic') return;

        this.colorUpdateCounter++;
        if (this.colorUpdateCounter < 5) return; // Update color every 5 frames

        // Optimized speed calculation
        const speedSq = this.velocityX * this.velocityX + this.velocityY * this.velocityY;
        this.color = utils.getKineticColor(Math.sqrt(speedSq), this.maxSpeed);
        this.colorUpdateCounter = 0;
    }

    update(gravityX, gravityY, deltaTime, mouseX, mouseY, nearbyParticles = []) {
        const dt = deltaTime * 0.001;
        const { options, maxSpeed } = this;

        // Interaction modes
        switch (options.mode) {
            case 'vortex':
                { // Use block scope for temp variables
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 22500) {
                        const force = (150 - Math.sqrt(distSq)) / 150;
                        const acc = force * 0.05 * options.speedMultiplier;
                        this.velocityX += dy * acc;
                        this.velocityY -= dx * acc;
                    }
                }
                break;

            case 'attract':
                {
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 40000) {
                        const force = (200 - Math.sqrt(distSq)) / 200;
                        const acc = force * 0.02 * options.speedMultiplier;
                        this.velocityX += dx * acc;
                        this.velocityY += dy * acc;
                    }
                }
                break;

            case 'repel':
                {
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 22500) {
                        const force = (150 - Math.sqrt(distSq)) / 150;
                        const acc = force * 0.05 * options.speedMultiplier;
                        this.velocityX += dx * acc;
                        this.velocityY += dy * acc;
                    }
                }
                break;
            case 'turbulence':
                // Add random, swirling motion (CORRECTED)
                const turbulenceStrength = this.options.turbulenceStrength;
                const turbulenceScale = this.options.turbulenceScale;

                // Use Perlin noise (or another noise function) for smooth randomness
                const noiseX = utils.perlinNoise(this.x * turbulenceScale, this.y * turbulenceScale, performance.now() * 0.001);
                const noiseY = utils.perlinNoise(this.x * turbulenceScale + 1000, this.y * turbulenceScale + 1000, performance.now() * 0.001);

                // Modify velocity based on noise, but don't let it increase indefinitely
                const turbulenceInfluence = 0.2; // How much the noise affects velocity (0.0 - 1.0)

                //this.velocityX = utils.lerp(this.velocityX, this.velocityX + noiseX * turbulenceStrength, turbulenceInfluence);
                //this.velocityY = utils.lerp(this.velocityY, this.velocityY + noiseY * turbulenceStrength, turbulenceInfluence);
                this.velocityX += noiseX * turbulenceStrength * options.speedMultiplier;
                this.velocityY += noiseY * turbulenceStrength * options.speedMultiplier;

                // Add a small amount of damping to prevent particles from getting stuck
                const damping = 0.95;
                this.velocityX *= damping;
                this.velocityY *= damping;
                break;

            default: // mode: 'normal'
                this.velocityX += gravityX * 30 * dt * options.speedMultiplier;
                this.velocityY += gravityY * 30 * dt * options.speedMultiplier;
        }

        // Apply physics
        this.velocityX *= options.friction;
        this.velocityY *= options.friction;

        // Limit speed
        const currentSpeedSq = this.velocityX * this.velocityX + this.velocityY * this.velocityY;
        const maxSpeedSq = maxSpeed * maxSpeed;
        if (currentSpeedSq > maxSpeedSq) {
            const ratio = maxSpeed / Math.sqrt(currentSpeedSq);
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Update rotation
        if (options.type !== 'circle') {
            this.rotation += this.rotationSpeed;
        }

        // Update color (if kinetic)
        this.updateColor();

        // Handle collisions (optimized to use nearbyParticles)
        this.handleCollisions(nearbyParticles);
        this.handleBoundaries();
    }

    handleCollisions(nearbyParticles) {
        const { options } = this;
        for (let other of nearbyParticles) {
            if (other === this) continue;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distSq = dx * dx + dy * dy;

            // Collision radius based on shape
            let thisRadius = options.size;
            let otherRadius = other.options.size;
            if (options.type === 'square') thisRadius *= Math.SQRT2;
            if (other.options.type === 'square') otherRadius *= Math.SQRT2;
            if (options.type === 'triangle') thisRadius *= 1.5;
            if (other.options.type === 'triangle') otherRadius *= 1.5;

            const minDistance = thisRadius + otherRadius;
            const minDistanceSq = minDistance * minDistance;

            if (distSq >= minDistanceSq || distSq === 0) continue; // No collision or exactly overlapping

            const distance = Math.sqrt(distSq);
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate velocities
            const vx1 = this.velocityX * cos + this.velocityY * sin;
            const vy1 = this.velocityY * cos - this.velocityX * sin;
            const vx2 = other.velocityX * cos + other.velocityY * sin;
            const vy2 = other.velocityY * cos - other.velocityX * sin;

            // Collision reaction (optimized)
            const m1 = this.mass;
            const m2 = other.mass;
            const mSum = m1 + m2;
            const u1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / mSum;
            const u2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / mSum;

            // Update velocities
            const bounce = options.bounce; // Cache for potential slight optimization
            const collisionDamping = 0.97; // Damping to reduce oscillations
            this.velocityX = (u1 * cos - vy1 * sin) * bounce * collisionDamping;
            this.velocityY = (vy1 * cos + u1 * sin) * bounce * collisionDamping;
            other.velocityX = (u2 * cos - vy2 * sin) * other.options.bounce * collisionDamping;
            other.velocityY = (vy2 * cos + u2 * sin) * other.options.bounce * collisionDamping;

            // Prevent overlapping (optimized)
            const overlap = minDistance - distance;
            const separation = overlap * 0.5;
            const invDist = 1 / distance;
            const separationX = dx * invDist * separation;
            const separationY = dy * invDist * separation;

            this.x -= separationX;
            this.y -= separationY;
            other.x += separationX;
            other.y += separationY;

            // Rotation transfer
            if (options.type !== 'circle' || other.options.type !== 'circle') {
                const rotationTransfer = 0.2;
                const avgRotation = (this.rotationSpeed + other.rotationSpeed) * 0.5;
                this.rotationSpeed = avgRotation * (1 + rotationTransfer);
                other.rotationSpeed = avgRotation * (1 - rotationTransfer);
            }
        }
    }

    handleBoundaries() {
        const { canvas, options } = this;
        let margin = options.size;

        if (options.type === 'square') margin *= Math.SQRT2;
        if (options.type === 'triangle') margin *= 1.5;

        const bounce = -options.bounce; // Pre-calculate for slight optimization

        if (this.x < margin) {
            this.x = margin;
            this.velocityX *= bounce;
            this.rotationSpeed *= 0.8;
        } else if (this.x > canvas.width - margin) {
            this.x = canvas.width - margin;
            this.velocityX *= bounce;
            this.rotationSpeed *= 0.8;
        }

        if (this.y < margin) {
            this.y = margin;
            this.velocityY *= bounce;
            this.rotationSpeed *= 0.8;
        } else if (this.y > canvas.height - margin) {
            this.y = canvas.height - margin;
            this.velocityY *= bounce;
            this.rotationSpeed *= 0.8;
        }
    }

    draw() {
        const { ctx, options } = this;
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Use bitwise shift for triangle size calculation (minor optimization)
        const size = options.type === 'triangle' ? options.size << 1 : options.size;

        switch (options.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(-size, size >> 1);
                ctx.lineTo(size, size >> 1);
                ctx.lineTo(0, -size);
                ctx.closePath();
                ctx.fill();
                break;
            default: // square
                ctx.fillRect(-size, -size, size * 2, size * 2);
        }

        ctx.restore();
    }
}

// Particle System with Optimizations
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.particles = [];
        this.gravityX = 0;
        this.gravityY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastTime = 0;
        this.fpsTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.isRunning = true;

        this.useSensor = true;
        this.sensorGravityX = 0;
        this.sensorGravityY = 0;

        // Default options
        this.options = {
            particleCount: 191,
            colorMode: 'kinetic',
            singleColor: '#00ff88',
            particleType: 'circle',
            physicsMode: 'normal',
            sizeMode: 'uniform', // Default to uniform size
            sizeRange: [12, 12],
            speedMultiplier: 0.5,
            gravity: 0,
            windForce: 0,
            explosionForce: 5.0,
            turbulenceStrength: 0.5,
            turbulenceScale: 0.1
        };

        // Spatial Partitioning (Grid-based)
        this.gridSize = 100;
        this.grid = [];

        // Particle Pool
        this.particlePool = [];

        // Cache canvas dimensions
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        // Dirty rectangles optimization
        this.dirtyRects = [];

        this.init();
        this.bindEvents();
        this.bindControls();
    }

    init() {
        this.resize();
        this.createParticles();
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    createParticles() {
        const { particleCount, sizeMode, sizeRange, colorMode, singleColor, particleType, physicsMode, speedMultiplier, turbulenceStrength, turbulenceScale } = this.options;
        const particlePoolWasEmpty = this.particlePool.length === 0;

        // Try to reuse particles from the pool
        while (this.particles.length < particleCount) {
            if (this.particlePool.length > 0) {
                const particle = this.particlePool.pop();
                // Correctly update particle size based on sizeMode
                const size = sizeMode === 'uniform' ? sizeRange[1] : utils.randomRange(...sizeRange);

                // Update particle options if needed (only if they have changed)
                if (particle.options.size !== size || particle.options.sizeMode !== sizeMode || particle.options.particleType !== particleType ||
                    particle.options.physicsMode !== physicsMode || particle.options.speedMultiplier !== speedMultiplier ||
                    particle.options.turbulenceStrength !== turbulenceStrength || particle.options.turbulenceScale !== turbulenceScale) {

                    particle.options.size = size; // Update the size properly
                    particle.options.sizeMode = sizeMode;
                    particle.options.sizeRange = sizeRange;
                    particle.options.colorMode = colorMode;
                    particle.options.singleColor = singleColor;
                    particle.options.type = particleType;
                    particle.options.mode = physicsMode;
                    particle.options.speedMultiplier = speedMultiplier;
                    particle.options.turbulenceStrength = turbulenceStrength; // ADDED
                    particle.options.turbulenceScale = turbulenceScale;     // ADDED
                }

                if (particle.options.colorMode === 'single' && particle.color !== singleColor) {
                    particle.color = singleColor;
                }

                particle.reset();
                this.particles.push(particle);
            } else {
                // Create new particle only if the pool is empty
                const size = sizeMode === 'uniform' ? sizeRange[1] : utils.randomRange(...sizeRange);
                this.particles.push(new Particle(this.canvas, {
                    size, // Apply size correctly to new particles
                    colorMode,
                    singleColor,
                    type: particleType,
                    mode: physicsMode,
                    speedMultiplier,
                    turbulenceStrength, // ADDED
                    turbulenceScale      // ADDED
                }));
            }
        }

        // Remove extra particles if count is reduced
        while (this.particles.length > particleCount) {
            this.particlePool.push(this.particles.pop());
        }

        // Only rebuild spatial grid if the particle pool was initially empty or if particles were added/removed
        if (particlePoolWasEmpty || this.particles.length !== particleCount) {
            this.buildSpatialGrid();
        }
    }

    // Build Spatial Grid
    buildSpatialGrid() {
        const { canvasWidth, canvasHeight, gridSize } = this;
        const cols = Math.ceil(canvasWidth / gridSize);
        const rows = Math.ceil(canvasHeight / gridSize);

        this.grid = [];
        for (let i = 0; i < rows; i++) {
            this.grid[i] = [];
            for (let j = 0; j < cols; j++) {
                this.grid[i][j] = [];
            }
        }

        for (let particle of this.particles) {
            const cellX = Math.floor(particle.x / gridSize);
            const cellY = Math.floor(particle.y / gridSize);
            // Check for out-of-bounds cells
            if (cellX >= 0 && cellX < cols && cellY >= 0 && cellY < rows) {
                this.grid[cellY][cellX].push(particle);
            }
        }
    }

    // Get particles in nearby cells
    getNearbyParticles(particle) {
        const { gridSize } = this;
        const cellX = Math.floor(particle.x / gridSize);
        const cellY = Math.floor(particle.y / gridSize);

        const nearbyParticles = [];
        for (let i = cellY - 1; i <= cellY + 1; i++) {
            for (let j = cellX - 1; j <= cellX + 1; j++) {
                if (this.grid[i] && this.grid[i][j]) {
                    nearbyParticles.push(...this.grid[i][j]);
                }
            }
        }

        return nearbyParticles;
    }

    explodeAtPoint(x, y, radius = 200) {
        const radiusSq = radius * radius;
        const { explosionForce } = this.options;
        for (let particle of this.particles) {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < radiusSq) {
                const force = (1 - Math.sqrt(distanceSq) / radius) * explosionForce;
                const angle = Math.atan2(dy, dx);
                // Combine random and directional velocity for a more natural explosion
                particle.velocityX += Math.cos(angle) * force * 20 + utils.randomRange(-1, 1);
                particle.velocityY += Math.sin(angle) * force * 20 + utils.randomRange(-1, 1);
            }
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        const moveHandler = (x, y) => {
            this.mouseX = x;
            this.mouseY = y;
            // Pre-calculate center for slight optimization
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;
            this.gravityX = (x - centerX) * 0.005;
            this.gravityY = (y - centerY) * 0.005;
        };

        this.canvas.addEventListener('mousemove', (e) => {
            moveHandler(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            moveHandler(touch.clientX, touch.clientY);
        }, { passive: false });

        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'h':
                    this.toggleUI();
                    break;
                case ' ':
                    e.preventDefault();
                    this.isRunning = !this.isRunning;
                    if (this.isRunning) this.update(0);
                    break;
                case 'r':
                    this.reset();
                    break;
                case 'm':
                    {
                        const physicsMode = document.getElementById('physicsMode');
                        // Use a more efficient way to cycle through options
                        physicsMode.selectedIndex = (physicsMode.selectedIndex + 1) % physicsMode.options.length;
                        physicsMode.dispatchEvent(new Event('change'));
                    }
                    break;
                case 'e':
                    this.explodeAtPoint(this.mouseX, this.mouseY);
                    break;
            }
        });

        // Device Motion (Optimized)
        if (window.DeviceMotionEvent) {
            const permissionBtn = document.getElementById('requestMotionPermission');
            const sensorToggle = document.getElementById('sensorToggle');
            sensorToggle.checked = true;

            const handleDeviceMotion = (event) => {
                if (!this.useSensor) return;
                // Access properties directly for slight optimization
                this.sensorGravityX = -event.accelerationIncludingGravity.x * 0.2;
                this.sensorGravityY = event.accelerationIncludingGravity.y * 0.2;
            };

            const addDeviceMotionListener = () => {
                window.addEventListener('devicemotion', handleDeviceMotion);
                permissionBtn.style.display = 'none';
            };

            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                permissionBtn.style.display = 'block';
                permissionBtn.addEventListener('click', () => {
                    DeviceMotionEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                addDeviceMotionListener();
                            } else {
                                console.warn('Device Motion permission denied.');
                            }
                        })
                        .catch(console.error);
                });
            } else {
                addDeviceMotionListener();
            }
        }

        // Toggle Sensor Input
        document.getElementById('sensorToggle')?.addEventListener('change', (e) => {
            this.useSensor = e.target.checked;
            if (!this.useSensor) {
                this.sensorGravityX = 0;
                this.sensorGravityY = 0;
            }
        });
    }

    bindControls() {
        // Particle Slider (Optimized with logarithmic scale)
        const particleSlider = document.getElementById('particleSlider');
        const particleValue = document.getElementById('particleValue');
        const minParticles = 1;
        const maxParticles = 1000;
        const logMin = Math.log(minParticles);
        const logMax = Math.log(maxParticles);

        function getParticleCount(sliderValue) {
            // Optimized logarithmic scale calculation
            return Math.round(Math.exp(logMin + (sliderValue / 100) * (logMax - logMin)));
        }

        const updateParticleCount = (sliderValue) => {
            const count = getParticleCount(sliderValue);
            particleValue.textContent = count;
            this.options.particleCount = count;
            this.createParticles();
        };
		
		        // Set initial particle count to 191 (for the UI display)
        particleSlider.value = ((Math.log(191) - logMin) / (logMax - logMin)) * 100;
        updateParticleCount(particleSlider.value);

        // Handle slider input
        particleSlider.addEventListener('input', () => updateParticleCount(particleSlider.value));

        // Size Slider (Logarithmic)
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        const minSize = 2; // Minimum size
        const maxSize = 32; // Maximum size
        const logMinSize = Math.log(minSize);
        const logMaxSize = Math.log(maxSize);

        // Function to calculate size from slider value (logarithmic)
        function getSize(sliderValue) {
            const logValue = logMinSize + (sliderValue / 100) * (logMaxSize - logMinSize);
            return Math.round(Math.exp(logValue));
        }

        // Function to update size based on slider position
        const updateSize = (sliderValue) => {
            const size = getSize(sliderValue);
            this.options.sizeRange = [minSize, size]; // Update sizeRange with min and max
            sizeValue.textContent = `${minSize.toFixed(1)}-${size.toFixed(1)}`;

            // Adjust max particle count based on size
            const sizeMultiplier = Math.max(0.2, 16 / size);
            const adjustedMax = Math.floor(1000 * sizeMultiplier);
            const particleSlider = document.getElementById('particleSlider');
            const particleValue = document.getElementById('particleValue');

            if (this.options.particleCount > adjustedMax) {
                this.options.particleCount = adjustedMax;
                particleValue.textContent = adjustedMax;
                particleSlider.value = adjustedMax; // Update particle slider as well
            }

            // Update size in existing particles
            for (let p of this.particles) {
                p.options.size = this.options.sizeMode === 'random' ? utils.randomRange(...this.options.sizeRange) : size;
            }

            this.createParticles();
        };

        // Set initial size to 12 (for the UI display)
        sizeSlider.value = ((Math.log(12) - logMinSize) / (logMaxSize - logMinSize)) * 100;
        updateSize(sizeSlider.value);

        // Handle slider input
        sizeSlider.addEventListener('input', () => {
            updateSize(sizeSlider.value);
        });

        // Size Mode Checkbox
        const sizeModeCheckbox = document.getElementById('sizeMode');
        sizeModeCheckbox.checked = this.options.sizeMode === 'uniform'; // Set initial state

        sizeModeCheckbox.addEventListener('change', (e) => {
            this.options.sizeMode = e.target.checked ? 'uniform' : 'random';

            // Correctly update size in existing particles based on new mode
            const { sizeRange } = this.options;
            for (let p of this.particles) {
                p.options.size =
                    this.options.sizeMode === 'random'
                        ? utils.randomRange(...sizeRange)
                        : sizeRange[1]; // Max size for uniform
            }

            this.createParticles();
        });

        // Other Controls (Simplified and optimized where possible)
        document.getElementById('speedSlider')?.addEventListener('input', (e) => {
            this.options.speedMultiplier = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.options.speedMultiplier.toFixed(1);
            // Update speedMultiplier in particle options directly
            for (let p of this.particles) {
                p.options.speedMultiplier = this.options.speedMultiplier;
                p.maxSpeed = 15 * this.options.speedMultiplier;
            }
        });

        document.getElementById('gravitySlider')?.addEventListener('input', (e) => {
            this.options.gravity = parseFloat(e.target.value);
            document.getElementById('gravityValue').textContent = this.options.gravity.toFixed(1);
        });

        document.getElementById('windSlider')?.addEventListener('input', (e) => {
            this.options.windForce = parseFloat(e.target.value);
            document.getElementById('windValue').textContent = this.options.windForce.toFixed(1);
        });

        document.getElementById('particleType')?.addEventListener('change', (e) => {
            this.options.particleType = e.target.value;
            // Update type in particle options directly
            for (let p of this.particles) {
                p.options.type = e.target.value;
            }
        });

        const colorMode = document.getElementById('colorMode');
        const colorPicker = document.getElementById('colorPicker');

        colorMode.value = 'kinetic'; // Default

        colorMode.addEventListener('change', (e) => {
            this.options.colorMode = e.target.value;
            colorPicker.style.display = e.target.value === 'single' ? 'block' : 'none';
            // Update colorMode in particle options and color directly
            for (let p of this.particles) {
                p.options.colorMode = e.target.value;
                p.color = e.target.value === 'single'
                    ? this.options.singleColor
                    : utils.getRandomColor(e.target.value);
            }
        });

        colorPicker.addEventListener('input', (e) => {
            this.options.singleColor = e.target.value;
            if (this.options.colorMode === 'single') {
                for (let p of this.particles) {
                    p.color = e.target.value;
                }
            }
        });

        // Physics Mode (removed fluid and spring modes)
        const physicsModeSelect = document.getElementById('physicsMode');
        physicsModeSelect.innerHTML = `
            <option value="normal">Normal</option>
            <option value="vortex">Vortex</option>
            <option value="attract">Attract</option>
            <option value="repel">Repel</option>
            <option value="turbulence">Turbulence</option>
        `;

        physicsModeSelect.addEventListener('change', (e) => {
            this.options.physicsMode = e.target.value;
            document.getElementById('currentMode').textContent = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
            // Update mode in particle options directly
            for (let p of this.particles) {
                p.options.mode = e.target.value;
            }
        });

        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('explodeBtn')?.addEventListener('click', () => this.explodeAtPoint(this.mouseX, this.mouseY));
        document.getElementById('modeBtn')?.addEventListener('click', () => {
            physicsModeSelect.selectedIndex = (physicsModeSelect.selectedIndex + 1) % physicsModeSelect.options.length;
            physicsModeSelect.dispatchEvent(new Event('change'));
        });
        document.getElementById('toggleUI')?.addEventListener('click', () => this.toggleUI());

        // Turbulence Strength Slider
        const turbulenceStrengthSlider = document.getElementById('turbulenceStrengthSlider');
        const turbulenceStrengthValue = document.getElementById('turbulenceStrengthValue');
        turbulenceStrengthSlider.value = this.options.turbulenceStrength;
        turbulenceStrengthValue.textContent = this.options.turbulenceStrength.toFixed(1);

        turbulenceStrengthSlider.addEventListener('input', (e) => {
            const strength = parseFloat(e.target.value);
            this.options.turbulenceStrength = strength;
            turbulenceStrengthValue.textContent = strength.toFixed(1);

            //update particles turbulence
            for (let p of this.particles) {
                p.options.turbulenceStrength = this.options.turbulenceStrength;
            }
        });

        // Turbulence Scale Slider
        const turbulenceScaleSlider = document.getElementById('turbulenceScaleSlider');
        const turbulenceScaleValue = document.getElementById('turbulenceScaleValue');
        turbulenceScaleSlider.value = this.options.turbulenceScale;
        turbulenceScaleValue.textContent = this.options.turbulenceScale.toFixed(2);

        turbulenceScaleSlider.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.options.turbulenceScale = scale;
            turbulenceScaleValue.textContent = scale.toFixed(2);

            //update particles turbulence
            for (let p of this.particles) {
                p.options.turbulenceScale = this.options.turbulenceScale;
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.buildSpatialGrid();
    }

    updateFPS(timestamp) {
        this.frameCount++;
        if (timestamp - this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            // Update FPS counter less frequently
            if (this.frameCount % 10 === 0) {
                document.getElementById('fps').textContent = `FPS: ${this.fps}`;
            }
            this.frameCount = 0;
            this.fpsTime = timestamp;
        }
    }

    update(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.updateFPS(timestamp);

        // Optimized clearing with dirty rectangles
        if (this.dirtyRects.length > 0) {
            // Use a Set to avoid duplicate dirty rectangles
            const uniqueDirtyRects = new Set();
            for (let rect of this.dirtyRects) {
                uniqueDirtyRects.add(JSON.stringify(rect));
            }
            this.dirtyRects = Array.from(uniqueDirtyRects).map(JSON.parse);

            for (let rect of this.dirtyRects) {
                this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
            }
            this.dirtyRects = [];
        } else {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        // Perform multiple collision iterations
        const collisionIterations = 3;
        for (let i = 0; i < collisionIterations; i++) {
            this.buildSpatialGrid();
            for (let particle of this.particles) {
                const nearbyParticles = this.getNearbyParticles(particle);
                particle.handleCollisions(nearbyParticles);
            }
        }

        // Sort particles by Y position (approximate depth sorting)
        this.particles.sort((a, b) => a.y - b.y);

        for (let particle of this.particles) {
            // Add to dirty rects before update
            this.dirtyRects.push({
                x: Math.max(0, Math.floor(particle.x - particle.options.size * 2)),
                y: Math.max(0, Math.floor(particle.y - particle.options.size * 2)),
                width: Math.min(this.canvasWidth, Math.ceil(particle.options.size * 4)),
                height: Math.min(this.canvasHeight, Math.ceil(particle.options.size * 4))
            });

            particle.update(
                this.gravityX + this.options.windForce + this.sensorGravityX,
                this.gravityY + this.options.gravity + this.sensorGravityY,
                deltaTime,
                this.mouseX,
                this.mouseY,
                [] // Pass an empty array, as nearbyParticles are not needed here anymore
            );

            // Add to dirty rects after update
            this.dirtyRects.push({
                x: Math.max(0, Math.floor(particle.x - particle.options.size * 2)),
                y: Math.max(0, Math.floor(particle.y - particle.options.size * 2)),
                width: Math.min(this.canvasWidth, Math.ceil(particle.options.size * 4)),
                height: Math.min(this.canvasHeight, Math.ceil(particle.options.size * 4))
            });

            particle.draw();
        }

        requestAnimationFrame((t) => this.update(t));
    }

    reset() {
        // Clear the canvas efficiently
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Return particles to the pool (optimized)
        this.particlePool.push(...this.particles);
        this.particles.length = 0;

        this.createParticles();
    }

    toggleUI() {
        document.body.classList.toggle('ui-hidden');
    }
}

// Initialize ParticleSystem after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const particleSystem = new ParticleSystem(canvas);
    particleSystem.update(0);
});
