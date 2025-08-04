/**
 * @fileoverview Enemy system implementation including movement patterns and wave management
 * @module enemy
 */

// Constants for enemy configuration
const ENEMY_CONFIG = {
    MOVEMENT_PATTERNS: {
        LINEAR: 'linear',
        SINE_WAVE: 'sine',
        ZIGZAG: 'zigzag'
    },
    DEFAULT_SPEED: 2,
    DEFAULT_HEALTH: 100,
    WAVE_INTERVAL: 5000, // milliseconds between waves
    SPAWN_DELAY: 1000    // milliseconds between enemy spawns
};

/**
 * Represents a single enemy entity in the game
 * @class Enemy
 */
class Enemy {
    /**
     * Create a new enemy
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} pattern - Movement pattern type
     * @param {Object} [options={}] - Additional enemy options
     */
    constructor(x, y, pattern, options = {}) {
        this.x = x;
        this.y = y;
        this.pattern = pattern;
        this.speed = options.speed || ENEMY_CONFIG.DEFAULT_SPEED;
        this.health = options.health || ENEMY_CONFIG.DEFAULT_HEALTH;
        this.amplitude = options.amplitude || 50; // For sine wave movement
        this.frequency = options.frequency || 0.02;
        this.startY = y; // Store initial Y for sine wave calculation
        this.active = true;
        this.timeAlive = 0;

        // Validate movement pattern
        if (!Object.values(ENEMY_CONFIG.MOVEMENT_PATTERNS).includes(pattern)) {
            throw new Error(`Invalid movement pattern: ${pattern}`);
        }
    }

    /**
     * Update enemy position based on movement pattern
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (!this.active) return;

        this.timeAlive += deltaTime;

        switch (this.pattern) {
            case ENEMY_CONFIG.MOVEMENT_PATTERNS.LINEAR:
                this._updateLinearMovement(deltaTime);
                break;
            case ENEMY_CONFIG.MOVEMENT_PATTERNS.SINE_WAVE:
                this._updateSineWaveMovement(deltaTime);
                break;
            case ENEMY_CONFIG.MOVEMENT_PATTERNS.ZIGZAG:
                this._updateZigzagMovement(deltaTime);
                break;
            default:
                console.warn(`Unhandled movement pattern: ${this.pattern}`);
        }
    }

    /**
     * Handle enemy taking damage
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the enemy was destroyed
     */
    takeDamage(amount) {
        if (!this.active) return false;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    /**
     * Destroy the enemy
     */
    destroy() {
        this.active = false;
    }

    // Private movement pattern implementations
    _updateLinearMovement(deltaTime) {
        this.x -= this.speed * deltaTime;
    }

    _updateSineWaveMovement(deltaTime) {
        this.x -= this.speed * deltaTime;
        this.y = this.startY + Math.sin(this.x * this.frequency) * this.amplitude;
    }

    _updateZigzagMovement(deltaTime) {
        this.x -= this.speed * deltaTime;
        this.y += Math.sin(this.timeAlive * this.frequency) * this.speed * deltaTime;
    }
}

/**
 * Manages enemy waves and spawning
 * @class EnemyWaveManager
 */
class EnemyWaveManager {
    /**
     * Create a new wave manager
     * @param {Object} [options={}] - Wave manager options
     */
    constructor(options = {}) {
        this.currentWave = 0;
        this.enemies = [];
        this.waveInterval = options.waveInterval || ENEMY_CONFIG.WAVE_INTERVAL;
        this.spawnDelay = options.spawnDelay || ENEMY_CONFIG.SPAWN_DELAY;
        this.lastSpawnTime = 0;
        this.waveActive = false;
    }

    /**
     * Start a new wave of enemies
     * @param {number} waveNumber - Wave number to start
     */
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveActive = true;
        this._generateWavePattern();
    }

    /**
     * Update all active enemies and handle wave progression
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // Update existing enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.active) {
                enemy.update(deltaTime);
                return true;
            }
            return false;
        });

        // Handle wave spawning
        if (this.waveActive) {
            this._handleSpawning(deltaTime);
        }
    }

    /**
     * Generate enemy spawn pattern for current wave
     * @private
     */
    _generateWavePattern() {
        // Wave difficulty increases with wave number
        const enemyCount = Math.floor(5 + this.currentWave * 1.5);
        const patterns = Object.values(ENEMY_CONFIG.MOVEMENT_PATTERNS);
        
        this.wavePattern = Array(enemyCount).fill().map(() => ({
            pattern: patterns[Math.floor(Math.random() * patterns.length)],
            speed: ENEMY_CONFIG.DEFAULT_SPEED * (1 + this.currentWave * 0.1),
            health: ENEMY_CONFIG.DEFAULT_HEALTH * (1 + this.currentWave * 0.2)
        }));
    }

    /**
     * Handle enemy spawning timing
     * @param {number} deltaTime - Time elapsed since last update
     * @private
     */
    _handleSpawning(deltaTime) {
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime >= this.spawnDelay) {
            if (this.wavePattern && this.wavePattern.length > 0) {
                const enemyConfig = this.wavePattern.shift();
                this._spawnEnemy(enemyConfig);
                this.lastSpawnTime = currentTime;
            } else {
                this.waveActive = false;
            }
        }
    }

    /**
     * Spawn a new enemy with given configuration
     * @param {Object} config - Enemy configuration
     * @private
     */
    _spawnEnemy(config) {
        const enemy = new Enemy(
            800, // Start from right side of screen
            Math.random() * 600, // Random Y position
            config.pattern,
            {
                speed: config.speed,
                health: config.health
            }
        );
        this.enemies.push(enemy);
    }
}

export { Enemy, EnemyWaveManager, ENEMY_CONFIG };