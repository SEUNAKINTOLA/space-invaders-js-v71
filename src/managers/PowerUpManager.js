/**
 * @fileoverview PowerUpManager handles the spawning, management, and application
 * of power-up effects in the game. It manages power-up lifecycle, from creation
 * to cleanup.
 * 
 * @module PowerUpManager
 */

// Power-up type definitions and configurations
const POWER_UP_TYPES = {
    SPEED_BOOST: 'speedBoost',
    SHIELD: 'shield',
    DOUBLE_POINTS: 'doublePoints',
    WEAPON_UPGRADE: 'weaponUpgrade',
    HEALTH_RESTORE: 'healthRestore'
};

// Power-up configuration
const POWER_UP_CONFIG = {
    [POWER_UP_TYPES.SPEED_BOOST]: {
        duration: 10000,
        multiplier: 1.5,
        probability: 0.2
    },
    [POWER_UP_TYPES.SHIELD]: {
        duration: 15000,
        probability: 0.15
    },
    [POWER_UP_TYPES.DOUBLE_POINTS]: {
        duration: 20000,
        multiplier: 2,
        probability: 0.1
    },
    [POWER_UP_TYPES.WEAPON_UPGRADE]: {
        duration: 30000,
        probability: 0.1
    },
    [POWER_UP_TYPES.HEALTH_RESTORE]: {
        healAmount: 50,
        probability: 0.15
    }
};

class PowerUpManager {
    /**
     * Creates a new PowerUpManager instance.
     * @param {Object} gameContext - The game context object
     */
    constructor(gameContext) {
        if (!gameContext) {
            throw new Error('GameContext is required for PowerUpManager');
        }

        this.gameContext = gameContext;
        this.activePowerUps = new Map();
        this.powerUpTimers = new Map();
        this.isInitialized = false;
    }

    /**
     * Initializes the PowerUpManager.
     * @returns {void}
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('PowerUpManager is already initialized');
            return;
        }

        this.isInitialized = true;
        this.bindEvents();
    }

    /**
     * Binds necessary event listeners.
     * @private
     */
    bindEvents() {
        // Add event listeners for power-up collection, etc.
        this.gameContext.eventEmitter?.on('powerUpCollected', 
            (powerUp) => this.applyPowerUp(powerUp));
    }

    /**
     * Spawns a power-up at the specified position.
     * @param {Object} position - The spawn position {x, y}
     * @returns {Object|null} The spawned power-up object or null if spawn failed
     */
    spawnPowerUp(position) {
        try {
            const powerUpType = this.getRandomPowerUpType();
            if (!powerUpType) return null;

            const powerUp = {
                id: this.generatePowerUpId(),
                type: powerUpType,
                position: { ...position },
                config: POWER_UP_CONFIG[powerUpType],
                timestamp: Date.now()
            };

            return powerUp;
        } catch (error) {
            console.error('Error spawning power-up:', error);
            return null;
        }
    }

    /**
     * Applies a power-up effect to the player.
     * @param {Object} powerUp - The power-up to apply
     * @returns {boolean} Success status of power-up application
     */
    applyPowerUp(powerUp) {
        if (!powerUp || !powerUp.type) {
            console.error('Invalid power-up object');
            return false;
        }

        try {
            const { type, config } = powerUp;
            
            // Clear existing power-up of the same type if it exists
            this.clearExistingPowerUp(type);

            // Apply the power-up effect
            this.activePowerUps.set(type, powerUp);

            // Handle different power-up types
            switch (type) {
                case POWER_UP_TYPES.HEALTH_RESTORE:
                    this.handleHealthRestore(config.healAmount);
                    break;
                default:
                    this.startPowerUpTimer(type, config.duration);
            }

            this.gameContext.eventEmitter?.emit('powerUpActivated', powerUp);
            return true;
        } catch (error) {
            console.error('Error applying power-up:', error);
            return false;
        }
    }

    /**
     * Starts a timer for temporary power-ups.
     * @private
     * @param {string} type - The power-up type
     * @param {number} duration - Duration in milliseconds
     */
    startPowerUpTimer(type, duration) {
        if (!duration) return;

        const timerId = setTimeout(() => {
            this.deactivatePowerUp(type);
        }, duration);

        this.powerUpTimers.set(type, timerId);
    }

    /**
     * Deactivates a power-up effect.
     * @param {string} type - The power-up type to deactivate
     */
    deactivatePowerUp(type) {
        const powerUp = this.activePowerUps.get(type);
        if (!powerUp) return;

        this.activePowerUps.delete(type);
        clearTimeout(this.powerUpTimers.get(type));
        this.powerUpTimers.delete(type);

        this.gameContext.eventEmitter?.emit('powerUpDeactivated', powerUp);
    }

    /**
     * Clears an existing power-up of the same type.
     * @private
     * @param {string} type - The power-up type to clear
     */
    clearExistingPowerUp(type) {
        if (this.activePowerUps.has(type)) {
            this.deactivatePowerUp(type);
        }
    }

    /**
     * Generates a random power-up type based on probability.
     * @private
     * @returns {string|null} The selected power-up type or null
     */
    getRandomPowerUpType() {
        const random = Math.random();
        let probabilitySum = 0;

        for (const [type, config] of Object.entries(POWER_UP_CONFIG)) {
            probabilitySum += config.probability;
            if (random <= probabilitySum) {
                return type;
            }
        }

        return null;
    }

    /**
     * Generates a unique power-up ID.
     * @private
     * @returns {string} Unique identifier
     */
    generatePowerUpId() {
        return `powerup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Handles health restoration power-up.
     * @private
     * @param {number} amount - Amount of health to restore
     */
    handleHealthRestore(amount) {
        this.gameContext.player?.heal(amount);
    }

    /**
     * Checks if a specific power-up is active.
     * @param {string} type - The power-up type to check
     * @returns {boolean} Whether the power-up is active
     */
    isPowerUpActive(type) {
        return this.activePowerUps.has(type);
    }

    /**
     * Cleans up all active power-ups and timers.
     */
    cleanup() {
        this.activePowerUps.forEach((_, type) => {
            this.deactivatePowerUp(type);
        });
        
        this.activePowerUps.clear();
        this.powerUpTimers.clear();
        this.isInitialized = false;
    }
}

export default PowerUpManager;