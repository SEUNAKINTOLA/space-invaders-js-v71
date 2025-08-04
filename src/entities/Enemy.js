/**
 * @fileoverview Enemy system implementation providing base enemy class and derived enemy types
 * with different behaviors and characteristics.
 * 
 * @module entities/Enemy
 * @requires none
 */

// Constants for enemy types and configurations
const ENEMY_TYPES = {
    BASIC: 'basic',
    FLYING: 'flying',
    ARMORED: 'armored'
};

const DEFAULT_ENEMY_CONFIG = {
    health: 100,
    speed: 5,
    damage: 10,
    scoreValue: 100
};

/**
 * Base Enemy class representing core enemy functionality
 * @class Enemy
 */
class Enemy {
    /**
     * Create a new Enemy instance
     * @param {Object} config - Enemy configuration object
     * @param {number} config.x - Initial X position
     * @param {number} config.y - Initial Y position
     * @param {number} [config.health] - Enemy health points
     * @param {number} [config.speed] - Movement speed
     * @param {number} [config.damage] - Damage dealt to player
     * @param {string} [config.type] - Enemy type identifier
     */
    constructor(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Enemy configuration object is required');
        }

        // Required properties
        if (typeof config.x !== 'number' || typeof config.y !== 'number') {
            throw new Error('Initial position (x, y) must be provided as numbers');
        }

        // Core properties
        this.x = config.x;
        this.y = config.y;
        this.health = config.health || DEFAULT_ENEMY_CONFIG.health;
        this.speed = config.speed || DEFAULT_ENEMY_CONFIG.speed;
        this.damage = config.damage || DEFAULT_ENEMY_CONFIG.damage;
        this.type = config.type || ENEMY_TYPES.BASIC;
        this.isActive = true;
        this.scoreValue = config.scoreValue || DEFAULT_ENEMY_CONFIG.scoreValue;

        // State flags
        this.isStunned = false;
        this.isInvulnerable = false;
    }

    /**
     * Update enemy state and position
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (!this.isActive || this.isStunned) return;

        this._updatePosition(deltaTime);
        this._updateState();
    }

    /**
     * Handle damage taken by the enemy
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} - Whether the enemy was defeated
     */
    takeDamage(amount) {
        if (!this.isActive || this.isInvulnerable) return false;
        
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Damage amount must be a positive number');
        }

        this.health -= amount;

        if (this.health <= 0) {
            this._onDefeat();
            return true;
        }

        return false;
    }

    /**
     * Check if enemy collides with a given point or object
     * @param {Object} point - Point or object to check collision with
     * @param {number} point.x - X coordinate
     * @param {number} point.y - Y coordinate
     * @returns {boolean} - Whether collision occurred
     */
    checkCollision(point) {
        // Basic collision detection - can be overridden by specific enemy types
        const collisionRadius = 20; // Default collision radius
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) < collisionRadius;
    }

    /**
     * Reset enemy to initial state
     * @param {Object} config - Reset configuration
     */
    reset(config = {}) {
        this.health = config.health || DEFAULT_ENEMY_CONFIG.health;
        this.isActive = true;
        this.isStunned = false;
        this.isInvulnerable = false;
    }

    // Private methods
    
    /**
     * Update enemy position based on current state and behavior
     * @private
     * @param {number} deltaTime - Time elapsed since last update
     */
    _updatePosition(deltaTime) {
        // Base movement behavior - can be overridden by specific enemy types
        this.x += this.speed * deltaTime;
    }

    /**
     * Update enemy state based on current conditions
     * @private
     */
    _updateState() {
        // Base state update logic - can be overridden by specific enemy types
        if (this.health <= 0) {
            this.isActive = false;
        }
    }

    /**
     * Handle enemy defeat
     * @private
     */
    _onDefeat() {
        this.isActive = false;
        // Additional defeat logic can be added here
    }
}

/**
 * Flying Enemy type with specific behavior
 * @extends Enemy
 */
class FlyingEnemy extends Enemy {
    constructor(config) {
        super({ ...config, type: ENEMY_TYPES.FLYING });
        this.altitude = config.altitude || 100;
        this.oscillationSpeed = config.oscillationSpeed || 2;
        this.time = 0;
    }

    _updatePosition(deltaTime) {
        super._updatePosition(deltaTime);
        this.time += deltaTime;
        this.y += Math.sin(this.time * this.oscillationSpeed) * this.speed * deltaTime;
    }
}

/**
 * Armored Enemy type with enhanced defense
 * @extends Enemy
 */
class ArmoredEnemy extends Enemy {
    constructor(config) {
        super({ ...config, type: ENEMY_TYPES.ARMORED });
        this.armor = config.armor || 50;
    }

    takeDamage(amount) {
        const reducedDamage = amount * (100 - this.armor) / 100;
        return super.takeDamage(reducedDamage);
    }
}

// Export enemy system components
export {
    Enemy as default,
    FlyingEnemy,
    ArmoredEnemy,
    ENEMY_TYPES
};