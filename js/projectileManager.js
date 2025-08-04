/**
 * @fileoverview Projectile Management System
 * Handles creation, updating, and cleanup of projectiles in the game.
 * 
 * @module projectileManager
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants and configuration
const PROJECTILE_CONFIG = {
    DEFAULT_SPEED: 10,
    MAX_PROJECTILES: 50,
    CLEANUP_THRESHOLD: -100, // Distance beyond which projectiles are removed
    DEFAULT_DAMAGE: 10
};

/**
 * @typedef {Object} ProjectileOptions
 * @property {number} x - Starting X position
 * @property {number} y - Starting Y position
 * @property {number} [speed=10] - Projectile speed
 * @property {number} [angle=0] - Direction angle in radians
 * @property {number} [damage=10] - Damage value
 * @property {string} [type='default'] - Projectile type
 */

/**
 * Manages game projectiles including creation, updates, and cleanup
 */
class ProjectileManager {
    /**
     * Initialize the projectile management system
     */
    constructor() {
        this.projectiles = new Set();
        this.lastUpdate = performance.now();
    }

    /**
     * Create a new projectile
     * @param {ProjectileOptions} options - Projectile configuration options
     * @returns {Object} Created projectile object
     * @throws {Error} If maximum projectile limit is reached
     */
    createProjectile(options) {
        if (this.projectiles.size >= PROJECTILE_CONFIG.MAX_PROJECTILES) {
            throw new Error('Maximum projectile limit reached');
        }

        try {
            const projectile = {
                x: options.x,
                y: options.y,
                speed: options.speed || PROJECTILE_CONFIG.DEFAULT_SPEED,
                angle: options.angle || 0,
                damage: options.damage || PROJECTILE_CONFIG.DEFAULT_DAMAGE,
                type: options.type || 'default',
                created: performance.now(),
                velocityX: Math.cos(options.angle) * (options.speed || PROJECTILE_CONFIG.DEFAULT_SPEED),
                velocityY: Math.sin(options.angle) * (options.speed || PROJECTILE_CONFIG.DEFAULT_SPEED)
            };

            this.projectiles.add(projectile);
            return projectile;
        } catch (error) {
            console.error('Error creating projectile:', error);
            throw new Error('Failed to create projectile');
        }
    }

    /**
     * Update all projectiles
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    update(deltaTime) {
        try {
            for (const projectile of this.projectiles) {
                // Update position
                projectile.x += projectile.velocityX * (deltaTime / 1000);
                projectile.y += projectile.velocityY * (deltaTime / 1000);

                // Clean up projectiles that are out of bounds
                if (this.isOutOfBounds(projectile)) {
                    this.projectiles.delete(projectile);
                }
            }
        } catch (error) {
            console.error('Error updating projectiles:', error);
        }
    }

    /**
     * Check if a projectile is out of bounds
     * @private
     * @param {Object} projectile - Projectile to check
     * @returns {boolean} True if projectile is out of bounds
     */
    isOutOfBounds(projectile) {
        return projectile.x < PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
               projectile.y < PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
               projectile.x > window.innerWidth + PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
               projectile.y > window.innerHeight + PROJECTILE_CONFIG.CLEANUP_THRESHOLD;
    }

    /**
     * Get all active projectiles
     * @returns {Set<Object>} Set of active projectiles
     */
    getProjectiles() {
        return this.projectiles;
    }

    /**
     * Remove a specific projectile
     * @param {Object} projectile - Projectile to remove
     * @returns {boolean} True if projectile was successfully removed
     */
    removeProjectile(projectile) {
        return this.projectiles.delete(projectile);
    }

    /**
     * Clear all projectiles
     */
    clearAll() {
        this.projectiles.clear();
    }

    /**
     * Check collision between projectile and target
     * @param {Object} projectile - Projectile object
     * @param {Object} target - Target object with x, y, width, height properties
     * @returns {boolean} True if collision detected
     */
    checkCollision(projectile, target) {
        if (!projectile || !target) return false;

        return projectile.x >= target.x &&
               projectile.x <= target.x + target.width &&
               projectile.y >= target.y &&
               projectile.y <= target.y + target.height;
    }
}

// Export as singleton to ensure single instance across the game
const projectileManager = new ProjectileManager();
Object.freeze(projectileManager);

export default projectileManager;