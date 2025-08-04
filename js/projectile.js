/**
 * @fileoverview Projectile system implementation for handling shooting mechanics
 * @module projectile
 * 
 * This module provides the Projectile class and related functionality for
 * managing projectiles in the game, including creation, movement, and collision.
 */

// Constants for projectile configuration
const PROJECTILE_CONFIG = {
    DEFAULT_SPEED: 10,
    DEFAULT_DAMAGE: 10,
    DEFAULT_LIFETIME: 3000, // milliseconds
    DEFAULT_SIZE: 5
};

/**
 * Represents a projectile in the game
 * @class Projectile
 */
export class Projectile {
    /**
     * Creates a new Projectile instance
     * @param {Object} config - The projectile configuration
     * @param {number} config.x - Initial X position
     * @param {number} config.y - Initial Y position
     * @param {number} config.angle - Direction angle in radians
     * @param {number} [config.speed=10] - Movement speed
     * @param {number} [config.damage=10] - Damage amount
     * @param {number} [config.size=5] - Projectile size
     * @param {number} [config.lifetime=3000] - Time before auto-destruction (ms)
     * @throws {Error} If required parameters are missing or invalid
     */
    constructor(config) {
        this.validateConfig(config);

        // Position and movement
        this.x = config.x;
        this.y = config.y;
        this.angle = config.angle;
        this.speed = config.speed || PROJECTILE_CONFIG.DEFAULT_SPEED;
        
        // Properties
        this.damage = config.damage || PROJECTILE_CONFIG.DEFAULT_DAMAGE;
        this.size = config.size || PROJECTILE_CONFIG.DEFAULT_SIZE;
        this.active = true;

        // Calculate velocity components
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;

        // Set up lifetime
        this.createdAt = Date.now();
        this.lifetime = config.lifetime || PROJECTILE_CONFIG.DEFAULT_LIFETIME;

        // Bind methods
        this.update = this.update.bind(this);
    }

    /**
     * Validates the configuration object
     * @private
     * @param {Object} config - Configuration to validate
     * @throws {Error} If configuration is invalid
     */
    validateConfig(config) {
        if (!config) {
            throw new Error('Projectile configuration is required');
        }

        const requiredParams = ['x', 'y', 'angle'];
        for (const param of requiredParams) {
            if (typeof config[param] !== 'number') {
                throw new Error(`Invalid or missing parameter: ${param}`);
            }
        }
    }

    /**
     * Updates the projectile's position and status
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     * @returns {boolean} Whether the projectile is still active
     */
    update(deltaTime) {
        if (!this.active) return false;

        // Check lifetime
        if (Date.now() - this.createdAt >= this.lifetime) {
            this.destroy();
            return false;
        }

        // Update position
        this.x += this.velocityX * (deltaTime / 1000);
        this.y += this.velocityY * (deltaTime / 1000);

        return true;
    }

    /**
     * Checks collision with a target
     * @param {Object} target - The target to check collision with
     * @param {number} target.x - Target X position
     * @param {number} target.y - Target Y position
     * @param {number} target.radius - Target collision radius
     * @returns {boolean} Whether collision occurred
     */
    checkCollision(target) {
        if (!this.active || !target) return false;

        const dx = this.x - target.x;
        const dy = this.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (this.size + target.radius);
    }

    /**
     * Destroys the projectile
     */
    destroy() {
        this.active = false;
    }

    /**
     * Gets the current position of the projectile
     * @returns {Object} Position object with x and y coordinates
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }

    /**
     * Gets the damage value of the projectile
     * @returns {number} Damage value
     */
    getDamage() {
        return this.damage;
    }

    /**
     * Checks if the projectile is still active
     * @returns {boolean} Active status
     */
    isActive() {
        return this.active;
    }
}

/**
 * Creates a projectile pool for efficient object reuse
 * @param {number} size - Pool size
 * @returns {Object} Projectile pool interface
 */
export function createProjectilePool(size = 50) {
    const pool = new Array(size).fill(null);
    let nextIndex = 0;

    return {
        /**
         * Gets a projectile from the pool
         * @param {Object} config - Projectile configuration
         * @returns {Projectile} New or reused projectile instance
         */
        get(config) {
            const projectile = pool[nextIndex] || new Projectile(config);
            pool[nextIndex] = projectile;
            nextIndex = (nextIndex + 1) % size;
            return projectile;
        },

        /**
         * Resets the pool
         */
        reset() {
            pool.fill(null);
            nextIndex = 0;
        }
    };
}