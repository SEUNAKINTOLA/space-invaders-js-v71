/**
 * @fileoverview Input handler module for player ship movement controls.
 * Manages both keyboard and touch input events.
 * 
 * @module js/input
 */

// Constants for key mappings
const KEYS = {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
    UP: ['ArrowUp', 'w', 'W'],
    DOWN: ['ArrowDown', 's', 'S'],
};

// Movement configuration
const INPUT_CONFIG = {
    touchThreshold: 20, // minimum pixels for touch movement
    multiTouchEnabled: true,
    preventDefaultEvents: true,
};

/**
 * Class representing the input handler for player movement
 */
class InputHandler {
    /**
     * Create an input handler
     * @param {Object} options - Configuration options
     * @param {boolean} [options.enableKeyboard=true] - Enable keyboard controls
     * @param {boolean} [options.enableTouch=true] - Enable touch controls
     */
    constructor(options = {}) {
        // Input state
        this.inputState = {
            left: false,
            right: false,
            up: false,
            down: false,
        };

        // Touch state tracking
        this.touchStart = { x: 0, y: 0 };
        this.isTouching = false;

        // Configuration
        this.options = {
            enableKeyboard: true,
            enableTouch: true,
            ...options,
        };

        this.initializeInputHandlers();
    }

    /**
     * Initialize event listeners for input handling
     * @private
     */
    initializeInputHandlers() {
        if (this.options.enableKeyboard) {
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
        }

        if (this.options.enableTouch) {
            window.addEventListener('touchstart', this.handleTouchStart.bind(this));
            window.addEventListener('touchmove', this.handleTouchMove.bind(this));
            window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        }
    }

    /**
     * Handle keydown events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        try {
            if (KEYS.LEFT.includes(event.key)) {
                this.inputState.left = true;
            }
            if (KEYS.RIGHT.includes(event.key)) {
                this.inputState.right = true;
            }
            if (KEYS.UP.includes(event.key)) {
                this.inputState.up = true;
            }
            if (KEYS.DOWN.includes(event.key)) {
                this.inputState.down = true;
            }

            if (INPUT_CONFIG.preventDefaultEvents) {
                event.preventDefault();
            }
        } catch (error) {
            console.error('Error handling keydown event:', error);
        }
    }

    /**
     * Handle keyup events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        try {
            if (KEYS.LEFT.includes(event.key)) {
                this.inputState.left = false;
            }
            if (KEYS.RIGHT.includes(event.key)) {
                this.inputState.right = false;
            }
            if (KEYS.UP.includes(event.key)) {
                this.inputState.up = false;
            }
            if (KEYS.DOWN.includes(event.key)) {
                this.inputState.down = false;
            }
        } catch (error) {
            console.error('Error handling keyup event:', error);
        }
    }

    /**
     * Handle touch start events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchStart(event) {
        try {
            const touch = event.touches[0];
            this.touchStart.x = touch.clientX;
            this.touchStart.y = touch.clientY;
            this.isTouching = true;

            if (INPUT_CONFIG.preventDefaultEvents) {
                event.preventDefault();
            }
        } catch (error) {
            console.error('Error handling touch start event:', error);
        }
    }

    /**
     * Handle touch move events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchMove(event) {
        try {
            if (!this.isTouching) return;

            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchStart.x;
            const deltaY = touch.clientY - this.touchStart.y;

            // Reset all states first
            this.inputState.left = false;
            this.inputState.right = false;
            this.inputState.up = false;
            this.inputState.down = false;

            // Update states based on touch movement
            if (Math.abs(deltaX) > INPUT_CONFIG.touchThreshold) {
                this.inputState.left = deltaX < 0;
                this.inputState.right = deltaX > 0;
            }

            if (Math.abs(deltaY) > INPUT_CONFIG.touchThreshold) {
                this.inputState.up = deltaY < 0;
                this.inputState.down = deltaY > 0;
            }

            if (INPUT_CONFIG.preventDefaultEvents) {
                event.preventDefault();
            }
        } catch (error) {
            console.error('Error handling touch move event:', error);
        }
    }

    /**
     * Handle touch end events
     * @private
     * @param {TouchEvent} event - The touch event
     */
    handleTouchEnd(event) {
        try {
            this.isTouching = false;
            this.inputState = {
                left: false,
                right: false,
                up: false,
                down: false,
            };
        } catch (error) {
            console.error('Error handling touch end event:', error);
        }
    }

    /**
     * Get current input state
     * @returns {Object} Current input state
     */
    getInputState() {
        return { ...this.inputState };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        if (this.options.enableKeyboard) {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }

        if (this.options.enableTouch) {
            window.removeEventListener('touchstart', this.handleTouchStart);
            window.removeEventListener('touchmove', this.handleTouchMove);
            window.removeEventListener('touchend', this.handleTouchEnd);
        }
    }
}

export default InputHandler;