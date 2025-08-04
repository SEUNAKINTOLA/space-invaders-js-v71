/**
 * @fileoverview Game initialization and main loop management module.
 * Handles canvas setup, game loop timing, and core game state.
 * 
 * @module game
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants and Configuration
const GAME_CONFIG = {
    FPS: 60,
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#000000'
};

/**
 * Represents the main game controller
 */
class Game {
    /**
     * Creates a new Game instance
     * @param {string} canvasId - The ID of the canvas element
     * @throws {Error} If canvas element is not found
     */
    constructor(canvasId) {
        this.initializeCanvas(canvasId);
        this.lastFrameTime = 0;
        this.isRunning = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
    }

    /**
     * Initializes the canvas and context
     * @private
     * @param {string} canvasId - The ID of the canvas element
     * @throws {Error} If canvas element is not found or context cannot be created
     */
    initializeCanvas(canvasId) {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas element with id '${canvasId}' not found`);
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D context');
            }

            // Set canvas dimensions
            this.canvas.width = GAME_CONFIG.WIDTH;
            this.canvas.height = GAME_CONFIG.HEIGHT;

            // Setup canvas properties
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        } catch (error) {
            console.error('Canvas initialization failed:', error);
            throw error;
        }
    }

    /**
     * Starts the game loop
     * @public
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    /**
     * Stops the game loop
     * @public
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main game loop
     * @private
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Update FPS counter
        this.updateFpsCounter(timestamp);

        // Clear canvas
        this.clear();

        // Update game state
        this.update(deltaTime);

        // Render frame
        this.render();

        // Schedule next frame
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    /**
     * Updates FPS counter
     * @private
     * @param {number} timestamp - Current timestamp
     */
    updateFpsCounter(timestamp) {
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }
    }

    /**
     * Clears the canvas
     * @private
     */
    clear() {
        this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Updates game state
     * @private
     * @param {number} deltaTime - Time elapsed since last frame in milliseconds
     */
    update(deltaTime) {
        // To be implemented by game logic
    }

    /**
     * Renders the current frame
     * @private
     */
    render() {
        // To be implemented by game logic
        
        // Debug info
        this.renderDebugInfo();
    }

    /**
     * Renders debug information
     * @private
     */
    renderDebugInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }

    /**
     * Resizes the canvas to match the specified dimensions
     * @public
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

/**
 * Creates and returns a new Game instance
 * @param {string} canvasId - The ID of the canvas element
 * @returns {Game} New Game instance
 */
export function createGame(canvasId) {
    return new Game(canvasId);
}

export default Game;