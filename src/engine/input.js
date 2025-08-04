/**
 * @fileoverview Input Management System
 * Handles keyboard and touch input events for the game engine.
 * Provides a unified interface for checking input states and managing bindings.
 * 
 * @module engine/input
 */

// Constants for key states
const KEY_STATES = {
    PRESSED: 1,
    HELD: 2,
    RELEASED: 3,
    IDLE: 4
};

/**
 * Input Manager class responsible for handling keyboard and touch input
 */
class InputManager {
    constructor() {
        // Initialize input state maps
        this.keyStates = new Map();
        this.previousKeyStates = new Map();
        this.touchStates = new Map();
        
        // Binding maps for custom key mappings
        this.keyBindings = new Map();
        
        // Touch tracking
        this.touchStartPosition = { x: 0, y: 0 };
        this.touchCurrentPosition = { x: 0, y: 0 };
        this.isTouching = false;

        // Bind event handlers
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);

        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     * @private
     */
    initializeEventListeners() {
        try {
            // Keyboard events
            window.addEventListener('keydown', this.boundHandleKeyDown);
            window.addEventListener('keyup', this.boundHandleKeyUp);

            // Touch events
            window.addEventListener('touchstart', this.boundHandleTouchStart);
            window.addEventListener('touchmove', this.boundHandleTouchMove);
            window.addEventListener('touchend', this.boundHandleTouchEnd);
        } catch (error) {
            console.error('Failed to initialize input event listeners:', error);
        }
    }

    /**
     * Handle keydown events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (!this.keyStates.has(key)) {
            this.keyStates.set(key, KEY_STATES.PRESSED);
        }
    }

    /**
     * Handle keyup events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keyStates.set(key, KEY_STATES.RELEASED);
    }

    /**
     * Handle touch start events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.touchStartPosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        this.touchCurrentPosition = { ...this.touchStartPosition };
        this.isTouching = true;
    }

    /**
     * Handle touch move events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.touchCurrentPosition = {
            x: touch.clientX,
            y: touch.clientY
        };
    }

    /**
     * Handle touch end events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.isTouching = false;
    }

    /**
     * Update input states - should be called once per frame
     * @public
     */
    update() {
        // Update previous key states
        this.previousKeyStates = new Map(this.keyStates);

        // Update key states
        for (const [key, state] of this.keyStates) {
            if (state === KEY_STATES.PRESSED) {
                this.keyStates.set(key, KEY_STATES.HELD);
            } else if (state === KEY_STATES.RELEASED) {
                this.keyStates.set(key, KEY_STATES.IDLE);
            }
        }
    }

    /**
     * Check if a key was just pressed this frame
     * @public
     * @param {string} key - The key to check
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return this.keyStates.get(key.toLowerCase()) === KEY_STATES.PRESSED;
    }

    /**
     * Check if a key is being held down
     * @public
     * @param {string} key - The key to check
     * @returns {boolean}
     */
    isKeyHeld(key) {
        return this.keyStates.get(key.toLowerCase()) === KEY_STATES.HELD;
    }

    /**
     * Check if a key was just released this frame
     * @public
     * @param {string} key - The key to check
     * @returns {boolean}
     */
    isKeyReleased(key) {
        return this.keyStates.get(key.toLowerCase()) === KEY_STATES.RELEASED;
    }

    /**
     * Get the current touch position
     * @public
     * @returns {{x: number, y: number}}
     */
    getTouchPosition() {
        return { ...this.touchCurrentPosition };
    }

    /**
     * Get the touch movement delta
     * @public
     * @returns {{x: number, y: number}}
     */
    getTouchDelta() {
        return {
            x: this.touchCurrentPosition.x - this.touchStartPosition.x,
            y: this.touchCurrentPosition.y - this.touchStartPosition.y
        };
    }

    /**
     * Clean up event listeners
     * @public
     */
    destroy() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        window.removeEventListener('keyup', this.boundHandleKeyUp);
        window.removeEventListener('touchstart', this.boundHandleTouchStart);
        window.removeEventListener('touchmove', this.boundHandleTouchMove);
        window.removeEventListener('touchend', this.boundHandleTouchEnd);
    }
}

// Export a singleton instance
const inputManager = new InputManager();
export default inputManager;