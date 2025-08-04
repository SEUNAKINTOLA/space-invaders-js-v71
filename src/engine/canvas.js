/**
 * @fileoverview Canvas management module for handling HTML5 Canvas initialization and operations
 * Provides a robust Canvas class for managing canvas element, context, and resize handling
 * 
 * @module engine/canvas
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Default configuration for canvas initialization
 * @constant {Object}
 */
const DEFAULT_CONFIG = {
    width: 800,
    height: 600,
    contextType: '2d',
    smoothing: false,
    backgroundColor: '#000000'
};

/**
 * Manages HTML5 Canvas element and provides utility methods for canvas operations
 */
export class Canvas {
    /**
     * Creates a new Canvas instance
     * @param {Object} config - Canvas configuration options
     * @param {number} [config.width] - Canvas width in pixels
     * @param {number} [config.height] - Canvas height in pixels
     * @param {string} [config.contextType] - Canvas context type ('2d' or 'webgl')
     * @param {boolean} [config.smoothing] - Enable/disable image smoothing
     * @param {string} [config.backgroundColor] - Canvas background color
     * @throws {Error} If canvas creation or context acquisition fails
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initialize();
    }

    /**
     * Initializes the canvas element and context
     * @private
     * @throws {Error} If canvas creation or context acquisition fails
     */
    initialize() {
        try {
            // Create canvas element
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext(this.config.contextType);

            if (!this.context) {
                throw new Error(`Failed to get ${this.config.contextType} context`);
            }

            // Configure canvas
            this.setDimensions(this.config.width, this.config.height);
            this.configureContext();

            // Setup event listeners
            this.setupResizeHandler();
        } catch (error) {
            throw new Error(`Canvas initialization failed: ${error.message}`);
        }
    }

    /**
     * Configures the canvas rendering context
     * @private
     */
    configureContext() {
        if (this.context instanceof CanvasRenderingContext2D) {
            this.context.imageSmoothingEnabled = this.config.smoothing;
        }
        this.clear();
    }

    /**
     * Sets up window resize event handler
     * @private
     */
    setupResizeHandler() {
        window.addEventListener('resize', this.handleResize.bind(this), false);
    }

    /**
     * Handles window resize events
     * @private
     */
    handleResize() {
        // Implement responsive resize logic if needed
        // This is a placeholder for custom resize behavior
    }

    /**
     * Sets canvas dimensions
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @throws {Error} If dimensions are invalid
     */
    setDimensions(width, height) {
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            throw new Error('Invalid canvas dimensions');
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.configureContext(); // Reconfigure context after resize
    }

    /**
     * Clears the canvas
     */
    clear() {
        if (this.context instanceof CanvasRenderingContext2D) {
            this.context.fillStyle = this.config.backgroundColor;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Gets the canvas element
     * @returns {HTMLCanvasElement} The canvas element
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Gets the rendering context
     * @returns {CanvasRenderingContext2D|WebGLRenderingContext} The rendering context
     */
    getContext() {
        return this.context;
    }

    /**
     * Gets current canvas dimensions
     * @returns {{width: number, height: number}} Canvas dimensions
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    /**
     * Destroys the canvas instance and removes event listeners
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.canvas.remove();
    }
}

/**
 * Creates and returns a new Canvas instance
 * @param {Object} config - Canvas configuration
 * @returns {Canvas} New Canvas instance
 */
export const createCanvas = (config) => {
    return new Canvas(config);
};