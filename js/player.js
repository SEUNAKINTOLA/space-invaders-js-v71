/**
 * @fileoverview Player ship class implementation with keyboard movement controls
 * @module js/player
 */

// Constants for player movement configuration
const MOVEMENT_CONFIG = {
    SPEED: 5,
    MAX_SPEED: 10,
    ACCELERATION: 0.2,
    DECELERATION: 0.1,
    ROTATION_SPEED: 3
};

// Key mappings for controls
const KEY_MAPPINGS = {
    UP: ['ArrowUp', 'w'],
    DOWN: ['ArrowDown', 's'],
    LEFT: ['ArrowLeft', 'a'],
    RIGHT: ['ArrowRight', 'd']
};

/**
 * Represents a player-controlled ship in the game
 * @class Player
 */
export class Player {
    /**
     * Creates a new Player instance
     * @param {number} x - Initial x coordinate
     * @param {number} y - Initial y coordinate
     * @param {number} width - Player ship width
     * @param {number} height - Player ship height
     */
    constructor(x = 0, y = 0, width = 32, height = 32) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Movement state
        this.velocity = {
            x: 0,
            y: 0
        };
        this.rotation = 0;
        this.isMoving = false;

        // Input state
        this.keys = new Set();

        // Bind event listeners
        this.#setupEventListeners();
    }

    /**
     * Sets up keyboard event listeners
     * @private
     */
    #setupEventListeners() {
        window.addEventListener('keydown', (event) => {
            this.keys.add(event.key);
        });

        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.key);
        });
    }

    /**
     * Updates player position and handles movement
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        try {
            this.#handleMovement(deltaTime);
            this.#applyBoundaries();
        } catch (error) {
            console.error('Error updating player:', error);
        }
    }

    /**
     * Handles player movement based on keyboard input
     * @private
     * @param {number} deltaTime - Time elapsed since last update
     */
    #handleMovement(deltaTime) {
        // Rotation
        if (this.#isKeyPressed('LEFT')) {
            this.rotation -= MOVEMENT_CONFIG.ROTATION_SPEED * deltaTime;
        }
        if (this.#isKeyPressed('RIGHT')) {
            this.rotation += MOVEMENT_CONFIG.ROTATION_SPEED * deltaTime;
        }

        // Forward/Backward movement
        if (this.#isKeyPressed('UP')) {
            this.#accelerate(deltaTime);
        } else if (this.#isKeyPressed('DOWN')) {
            this.#decelerate(deltaTime);
        } else {
            this.#applyFriction(deltaTime);
        }

        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    /**
     * Checks if any key for a given action is pressed
     * @private
     * @param {string} action - The action to check
     * @returns {boolean}
     */
    #isKeyPressed(action) {
        return KEY_MAPPINGS[action].some(key => this.keys.has(key));
    }

    /**
     * Applies acceleration to the player
     * @private
     * @param {number} deltaTime - Time elapsed since last update
     */
    #accelerate(deltaTime) {
        const angle = this.rotation * (Math.PI / 180);
        this.velocity.x += Math.cos(angle) * MOVEMENT_CONFIG.ACCELERATION * deltaTime;
        this.velocity.y += Math.sin(angle) * MOVEMENT_CONFIG.ACCELERATION * deltaTime;

        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > MOVEMENT_CONFIG.MAX_SPEED) {
            const scale = MOVEMENT_CONFIG.MAX_SPEED / speed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
    }

    /**
     * Applies deceleration to the player
     * @private
     * @param {number} deltaTime - Time elapsed since last update
     */
    #decelerate(deltaTime) {
        const angle = this.rotation * (Math.PI / 180);
        this.velocity.x -= Math.cos(angle) * MOVEMENT_CONFIG.DECELERATION * deltaTime;
        this.velocity.y -= Math.sin(angle) * MOVEMENT_CONFIG.DECELERATION * deltaTime;
    }

    /**
     * Applies friction to slow down the player
     * @private
     * @param {number} deltaTime - Time elapsed since last update
     */
    #applyFriction(deltaTime) {
        this.velocity.x *= (1 - MOVEMENT_CONFIG.DECELERATION * deltaTime);
        this.velocity.y *= (1 - MOVEMENT_CONFIG.DECELERATION * deltaTime);
    }

    /**
     * Keeps the player within game boundaries
     * @private
     */
    #applyBoundaries() {
        // Assuming game boundaries are defined by canvas dimensions
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const bounds = {
            left: 0,
            right: canvas.width,
            top: 0,
            bottom: canvas.height
        };

        this.x = Math.max(this.width / 2, Math.min(bounds.right - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(bounds.bottom - this.height / 2, this.y));
    }

    /**
     * Gets the current player state
     * @returns {Object} Current player state
     */
    getState() {
        return {
            position: { x: this.x, y: this.y },
            velocity: { ...this.velocity },
            rotation: this.rotation,
            dimensions: { width: this.width, height: this.height }
        };
    }
}