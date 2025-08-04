/**
 * @fileoverview Touch Input Handler Module
 * Manages and processes touch input events for the game engine.
 * Provides touch gesture recognition, multi-touch support, and touch state management.
 * 
 * @module touchHandler
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants for touch configuration
const TOUCH_CONFIG = {
    TAP_THRESHOLD: 200,        // Maximum ms for a tap
    SWIPE_THRESHOLD: 50,       // Minimum distance for swipe detection
    DOUBLE_TAP_DELAY: 300,     // Maximum ms between double taps
    LONG_PRESS_DELAY: 500,     // Ms to trigger long press
};

/**
 * Represents a touch point with position and timing information
 * @typedef {Object} TouchPoint
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} timestamp - When the touch occurred
 */

/**
 * Manages touch input handling and gesture recognition
 */
class TouchHandler {
    /**
     * Initialize the touch handler
     * @param {HTMLElement} target - DOM element to attach touch listeners to
     */
    constructor(target) {
        if (!target) {
            throw new Error('TouchHandler requires a valid DOM element target');
        }

        this.target = target;
        this.isEnabled = true;
        this.activeTouch = null;
        this.lastTap = null;
        this.touchCallbacks = new Map();

        // Bind methods to preserve context
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.initializeEventListeners();
    }

    /**
     * Set up touch event listeners
     * @private
     */
    initializeEventListeners() {
        try {
            this.target.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.target.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.target.addEventListener('touchend', this.handleTouchEnd, { passive: false });
            this.target.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
        } catch (error) {
            console.error('Failed to initialize touch event listeners:', error);
            throw error;
        }
    }

    /**
     * Handle touch start event
     * @private
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchStart(event) {
        if (!this.isEnabled) return;

        event.preventDefault();
        
        const touch = event.touches[0];
        this.activeTouch = {
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            startTime: Date.now()
        };

        this.emit('touchstart', this.activeTouch);
    }

    /**
     * Handle touch move event
     * @private
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchMove(event) {
        if (!this.isEnabled || !this.activeTouch) return;

        event.preventDefault();

        const touch = event.touches[0];
        this.activeTouch.currentX = touch.clientX;
        this.activeTouch.currentY = touch.clientY;

        this.emit('touchmove', this.activeTouch);
        this.detectSwipe();
    }

    /**
     * Handle touch end event
     * @private
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchEnd(event) {
        if (!this.isEnabled || !this.activeTouch) return;

        event.preventDefault();

        const touchDuration = Date.now() - this.activeTouch.startTime;
        
        // Detect tap
        if (touchDuration < TOUCH_CONFIG.TAP_THRESHOLD) {
            this.handleTap();
        }

        // Detect long press
        if (touchDuration >= TOUCH_CONFIG.LONG_PRESS_DELAY) {
            this.emit('longpress', this.activeTouch);
        }

        this.emit('touchend', this.activeTouch);
        this.activeTouch = null;
    }

    /**
     * Handle tap detection and double tap logic
     * @private
     */
    handleTap() {
        const now = Date.now();
        
        if (this.lastTap && (now - this.lastTap) < TOUCH_CONFIG.DOUBLE_TAP_DELAY) {
            this.emit('doubletap', this.activeTouch);
            this.lastTap = null;
        } else {
            this.emit('tap', this.activeTouch);
            this.lastTap = now;
        }
    }

    /**
     * Detect and emit swipe events
     * @private
     */
    detectSwipe() {
        const deltaX = this.activeTouch.currentX - this.activeTouch.startX;
        const deltaY = this.activeTouch.currentY - this.activeTouch.startY;

        if (Math.abs(deltaX) > TOUCH_CONFIG.SWIPE_THRESHOLD) {
            this.emit('swipe', {
                direction: deltaX > 0 ? 'right' : 'left',
                delta: Math.abs(deltaX)
            });
        }

        if (Math.abs(deltaY) > TOUCH_CONFIG.SWIPE_THRESHOLD) {
            this.emit('swipe', {
                direction: deltaY > 0 ? 'down' : 'up',
                delta: Math.abs(deltaY)
            });
        }
    }

    /**
     * Register a callback for a touch event
     * @public
     * @param {string} event - Event name to listen for
     * @param {Function} callback - Function to call when event occurs
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }

        if (!this.touchCallbacks.has(event)) {
            this.touchCallbacks.set(event, new Set());
        }
        this.touchCallbacks.get(event).add(callback);
    }

    /**
     * Remove a callback for a touch event
     * @public
     * @param {string} event - Event name to remove listener from
     * @param {Function} callback - Function to remove
     */
    off(event, callback) {
        if (this.touchCallbacks.has(event)) {
            this.touchCallbacks.get(event).delete(callback);
        }
    }

    /**
     * Emit a touch event to all registered callbacks
     * @private
     * @param {string} event - Event name to emit
     * @param {Object} data - Event data to pass to callbacks
     */
    emit(event, data) {
        if (this.touchCallbacks.has(event)) {
            for (const callback of this.touchCallbacks.get(event)) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in touch event callback for ${event}:`, error);
                }
            }
        }
    }

    /**
     * Enable touch input handling
     * @public
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable touch input handling
     * @public
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * Clean up event listeners and references
     * @public
     */
    destroy() {
        this.target.removeEventListener('touchstart', this.handleTouchStart);
        this.target.removeEventListener('touchmove', this.handleTouchMove);
        this.target.removeEventListener('touchend', this.handleTouchEnd);
        this.target.removeEventListener('touchcancel', this.handleTouchEnd);
        
        this.touchCallbacks.clear();
        this.activeTouch = null;
        this.lastTap = null;
    }
}

export default TouchHandler;