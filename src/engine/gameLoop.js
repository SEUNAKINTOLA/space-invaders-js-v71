/**
 * @fileoverview Game Loop Architecture Implementation
 * Provides a fixed timestep game loop with interpolated rendering
 * 
 * Features:
 * - Fixed timestep updates for consistent physics/logic
 * - Interpolated rendering for smooth animations
 * - Frame timing and FPS calculation
 * - Configurable update rate
 * - Panic mode for slow devices
 */

// Constants for game loop configuration
const DEFAULT_CONFIG = {
    updateRate: 1 / 60, // 60 fps
    maxFrameTime: 0.25, // Maximum time to process in one frame (seconds)
    maxUpdateSteps: 240, // Maximum update steps per frame to prevent spiral of death
    fpsBufferSize: 60, // Number of frames to average for FPS calculation
};

/**
 * GameLoop class handles the main game loop architecture
 * Uses fixed timestep updates with interpolated rendering
 */
export class GameLoop {
    /**
     * @param {Object} config - Configuration options
     * @param {function} updateFn - Update function for game logic
     * @param {function} renderFn - Render function for game graphics
     */
    constructor(config = {}, updateFn = null, renderFn = null) {
        // Merge provided config with defaults
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // Core loop callbacks
        this.update = updateFn || (() => {});
        this.render = renderFn || (() => {});
        
        // Timing variables
        this.accumulator = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // State
        this.isRunning = false;
        this.frameHistory = new Array(this.config.fpsBufferSize).fill(0);
        
        // Bind methods
        this.tick = this.tick.bind(this);
    }

    /**
     * Starts the game loop
     * @throws {Error} If the loop is already running
     */
    start() {
        if (this.isRunning) {
            throw new Error('Game loop is already running');
        }

        this.isRunning = true;
        this.lastTime = performance.now() / 1000; // Convert to seconds
        requestAnimationFrame(this.tick);
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main loop tick function
     * @private
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    tick(currentTime) {
        if (!this.isRunning) return;

        // Convert to seconds
        currentTime = currentTime / 1000;

        // Calculate frame time
        let frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update FPS calculation
        this.updateFPS(frameTime);

        // Prevent spiral of death
        if (frameTime > this.config.maxFrameTime) {
            frameTime = this.config.maxFrameTime;
        }

        // Accumulate time to process
        this.accumulator += frameTime;

        // Fixed timestep updates
        let updateSteps = 0;
        while (this.accumulator >= this.config.updateRate && 
               updateSteps < this.config.maxUpdateSteps) {
            try {
                this.update(this.config.updateRate);
            } catch (error) {
                console.error('Error in update function:', error);
            }
            
            this.accumulator -= this.config.updateRate;
            updateSteps++;
        }

        // Calculate interpolation alpha for rendering
        const alpha = this.accumulator / this.config.updateRate;

        // Render frame
        try {
            this.render(alpha);
        } catch (error) {
            console.error('Error in render function:', error);
        }

        // Schedule next frame
        requestAnimationFrame(this.tick);
    }

    /**
     * Updates FPS calculation
     * @private
     * @param {number} frameTime - Time taken for current frame
     */
    updateFPS(frameTime) {
        this.frameHistory[this.frameCount % this.config.fpsBufferSize] = frameTime;
        this.frameCount++;

        if (this.frameCount >= this.config.fpsBufferSize) {
            const averageFrameTime = this.frameHistory.reduce((a, b) => a + b) / 
                                   this.config.fpsBufferSize;
            this.fps = Math.round(1 / averageFrameTime);
        }
    }

    /**
     * Gets the current FPS
     * @returns {number} Current FPS value
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Sets new update and render functions
     * @param {function} updateFn - New update function
     * @param {function} renderFn - New render function
     */
    setCallbacks(updateFn, renderFn) {
        this.update = updateFn || this.update;
        this.render = renderFn || this.render;
    }
}

export default GameLoop;