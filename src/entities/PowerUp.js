/**
 * @fileoverview Power-up system implementation that handles various power-up types
 * and their effects in the game.
 * 
 * @module entities/PowerUp
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants for power-up types
const POWER_UP_TYPES = {
    SPEED: 'speed',
    SHIELD: 'shield',
    WEAPON: 'weapon',
    HEALTH: 'health',
    SCORE_MULTIPLIER: 'scoreMultiplier'
};

// Configuration for power-up effects
const POWER_UP_CONFIG = {
    [POWER_UP_TYPES.SPEED]: {
        duration: 5000,
        multiplier: 1.5,
        maxStacks: 2
    },
    [POWER_UP_TYPES.SHIELD]: {
        duration: 8000,
        strength: 100,
        maxStacks: 1
    },
    [POWER_UP_TYPES.WEAPON]: {
        duration: 10000,
        damageBonus: 2,
        maxStacks: 1
    },
    [POWER_UP_TYPES.HEALTH]: {
        healAmount: 50,
        maxStacks: Infinity
    },
    [POWER_UP_TYPES.SCORE_MULTIPLIER]: {
        duration: 15000,
        multiplier: 2,
        maxStacks: 3
    }
};

/**
 * Base class for all power-up items in the game.
 */
class PowerUp {
    /**
     * @param {string} type - The type of power-up
     * @param {Object} position - The initial position {x, y}
     * @param {Object} [options={}] - Additional options for the power-up
     */
    constructor(type, position, options = {}) {
        if (!POWER_UP_TYPES[type.toUpperCase()]) {
            throw new Error(`Invalid power-up type: ${type}`);
        }

        this.type = type;
        this.position = { ...position };
        this.active = false;
        this.startTime = null;
        this.config = POWER_UP_CONFIG[type];
        this.options = options;
        this.id = `powerup_${type}_${Date.now()}`;
    }

    /**
     * Activates the power-up effect
     * @param {Object} target - The target entity to apply the power-up to
     * @returns {boolean} - Whether the activation was successful
     */
    activate(target) {
        if (!target) {
            throw new Error('No target provided for power-up activation');
        }

        if (this.active) {
            return false;
        }

        try {
            this.active = true;
            this.startTime = Date.now();
            this._applyEffect(target);
            return true;
        } catch (error) {
            console.error(`Error activating power-up: ${error.message}`);
            this.active = false;
            return false;
        }
    }

    /**
     * Updates the power-up state
     * @param {number} deltaTime - Time elapsed since last update
     * @param {Object} target - The target entity
     */
    update(deltaTime, target) {
        if (!this.active || !this.startTime) {
            return;
        }

        const elapsed = Date.now() - this.startTime;
        if (this.config.duration && elapsed >= this.config.duration) {
            this.deactivate(target);
        }
    }

    /**
     * Deactivates the power-up effect
     * @param {Object} target - The target entity
     */
    deactivate(target) {
        if (!this.active) {
            return;
        }

        try {
            this._removeEffect(target);
            this.active = false;
            this.startTime = null;
        } catch (error) {
            console.error(`Error deactivating power-up: ${error.message}`);
        }
    }

    /**
     * Applies the power-up effect to the target
     * @param {Object} target - The target entity
     * @protected
     */
    _applyEffect(target) {
        switch (this.type) {
            case POWER_UP_TYPES.SPEED:
                target.speed *= this.config.multiplier;
                break;
            case POWER_UP_TYPES.SHIELD:
                target.shield = (target.shield || 0) + this.config.strength;
                break;
            case POWER_UP_TYPES.WEAPON:
                target.damage *= this.config.damageBonus;
                break;
            case POWER_UP_TYPES.HEALTH:
                target.health = Math.min(
                    (target.health || 0) + this.config.healAmount,
                    target.maxHealth || Infinity
                );
                break;
            case POWER_UP_TYPES.SCORE_MULTIPLIER:
                target.scoreMultiplier = (target.scoreMultiplier || 1) * this.config.multiplier;
                break;
        }
    }

    /**
     * Removes the power-up effect from the target
     * @param {Object} target - The target entity
     * @protected
     */
    _removeEffect(target) {
        switch (this.type) {
            case POWER_UP_TYPES.SPEED:
                target.speed /= this.config.multiplier;
                break;
            case POWER_UP_TYPES.SHIELD:
                target.shield = Math.max(0, (target.shield || 0) - this.config.strength);
                break;
            case POWER_UP_TYPES.WEAPON:
                target.damage /= this.config.damageBonus;
                break;
            case POWER_UP_TYPES.SCORE_MULTIPLIER:
                target.scoreMultiplier = (target.scoreMultiplier || 1) / this.config.multiplier;
                break;
        }
    }

    /**
     * Checks if the power-up can stack with existing effects
     * @param {Object} target - The target entity
     * @returns {boolean} - Whether the power-up can stack
     */
    canStack(target) {
        const activeCount = target.activePowerUps?.filter(
            powerup => powerup.type === this.type
        ).length || 0;
        return activeCount < this.config.maxStacks;
    }
}

/**
 * Factory function to create power-ups
 * @param {string} type - The type of power-up to create
 * @param {Object} position - The initial position
 * @param {Object} [options] - Additional options
 * @returns {PowerUp} - A new power-up instance
 */
export function createPowerUp(type, position, options) {
    return new PowerUp(type, position, options);
}

export { POWER_UP_TYPES, PowerUp };