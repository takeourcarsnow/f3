// --- START OF FILE simulation.js ---

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

            case 'fluid':
            case 'springs':
                {
                    const isSprings = options.mode === 'springs';
                    const forceMultiplier = isSprings ? 0.03 : 0.2; // Different multipliers
                    const targetDistance = isSprings ? 25 : 0;

                    for (let other of nearbyParticles) {
                        if (other === this) continue;
                        const dx = other.x - this.x;
                        const dy = other.y - this.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < 2500 && distSq > 0) {
                            const dist = Math.sqrt(distSq);
                            const force = (dist - targetDistance) * forceMultiplier * options.speedMultiplier;
                            const invDist = 1 / dist;
                            this.velocityX += dx * invDist * force;
                            this.velocityY += dy * invDist * force;
                        }
                    }
                }
                break;

            default:
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
            this.velocityX = (u1 * cos - vy1 * sin) * bounce;
            this.velocityY = (vy1 * cos + u1 * sin) * bounce;
            other.velocityX = (u2 * cos - vy2 * sin) * other.options.bounce;
            other.velocityY = (vy2 * cos + u2 * sin) * other.options.bounce;

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
            particleCount: 100,
            colorMode: 'kinetic',
            singleColor: '#00ff88',
            particleType: 'circle',
            physicsMode: 'normal',
            sizeMode: 'uniform',
            sizeRange: [4, 32],
            speedMultiplier: 0.5,
            gravity: 0,
            windForce: 0,
            explosionForce: 5.0
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
        const { particleCount, sizeMode, sizeRange, colorMode, singleColor, particleType, physicsMode, speedMultiplier } = this.options;
        const particlePoolWasEmpty = this.particlePool.length === 0;

        // Try to reuse particles from the pool
        while (this.particles.length < particleCount) {
            if (this.particlePool.length > 0) {
                const particle = this.particlePool.pop();
                // Correctly update particle size based on sizeMode
                const size = sizeMode === 'uniform' ? sizeRange[1] : utils.randomRange(...sizeRange);

                // Update particle options if needed (only if they have changed)
                if (particle.options.size !== size || particle.options.sizeMode !== sizeMode || particle.options.particleType !== particleType ||
                    particle.options.physicsMode !== physicsMode || particle.options.speedMultiplier !== speedMultiplier) {

                    particle.options.size = size; // Update the size properly
                    particle.options.sizeMode = sizeMode;
                    particle.options.sizeRange = sizeRange;
                    particle.options.colorMode = colorMode;
                    particle.options.singleColor = singleColor;
                    particle.options.type = particleType;
                    particle.options.mode = physicsMode;
                    particle.options.speedMultiplier = speedMultiplier;
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
                    speedMultiplier
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

        updateParticleCount(particleSlider.value);
        particleSlider.addEventListener('input', () => updateParticleCount(particleSlider.value));

        // Size Slider
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue'); // Get the sizeValue element
        sizeSlider.addEventListener('input', (e) => {
            const maxSize = parseInt(e.target.value);
            const minSize = Math.max(2, maxSize >> 3);
            this.options.sizeRange = [minSize, maxSize];
            sizeValue.textContent = `${minSize.toFixed(1)}-${maxSize.toFixed(1)}`; // Update sizeValue

            // Adjust max particle count based on size (optimized)
            const avgSize = (minSize + maxSize) / 2;
            const sizeMultiplier = Math.max(0.2, 16 / avgSize);
            const adjustedMax = Math.floor(1000 * sizeMultiplier);

            if (this.options.particleCount > adjustedMax) {
                this.options.particleCount = adjustedMax;
                particleValue.textContent = adjustedMax;
                particleSlider.value = adjustedMax;
            }
            // Update size in existing particles
            for (let p of this.particles) {
                if (this.options.sizeMode === 'random') {
                    p.options.size = utils.randomRange(minSize, maxSize);
                } else {
                    p.options.size = maxSize;
                }
            }

            this.createParticles();
        });

        // Size Mode
        document.getElementById('sizeMode')?.addEventListener('change', (e) => {
            this.options.sizeMode = e.target.value;

            // Update size in existing particles based on new mode
            for (let p of this.particles) {
                if (this.options.sizeMode === 'random') {
                    p.options.size = utils.randomRange(...this.options.sizeRange);
                } else {
                    p.options.size = this.options.sizeRange[1]; // Max size for uniform
                }
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

        document.getElementById('physicsMode')?.addEventListener('change', (e) => {
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
            const physicsMode = document.getElementById('physicsMode');
            physicsMode.selectedIndex = (physicsMode.selectedIndex + 1) % physicsMode.options.length;
            physicsMode.dispatchEvent(new Event('change'));
        });
        document.getElementById('toggleUI')?.addEventListener('click', () => this.toggleUI());
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

        for (let particle of this.particles) {
            // Add to dirty rects before update
            this.dirtyRects.push({
                x: Math.max(0, Math.floor(particle.x - particle.options.size * 2)),
                y: Math.max(0, Math.floor(particle.y - particle.options.size * 2)),
                width: Math.min(this.canvasWidth, Math.ceil(particle.options.size * 4)),
                height: Math.min(this.canvasHeight, Math.ceil(particle.options.size * 4))
            });

            const nearbyParticles = this.getNearbyParticles(particle);
            particle.update(
                this.gravityX + this.options.windForce + this.sensorGravityX,
                this.gravityY + this.options.gravity + this.sensorGravityY,
                deltaTime,
                this.mouseX,
                this.mouseY,
                nearbyParticles
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

        // Rebuild spatial grid (consider optimizing the frequency)
        this.buildSpatialGrid();

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