/**
 * @fileoverview Time management and game loop utilities.
 * Provides precise timing controls for game updates and rendering with fixed timestep.
 * 
 * @module engine/time
 */

// Constants for time management
const TIME_CONFIG = {
    /** Default fixed timestep in milliseconds */
    FIXED_TIMESTEP: 1000 / 60, // 60 FPS
    /** Maximum delta time to prevent spiral of death */
    MAX_DELTA_TIME: 100,
    /** Maximum number of update steps per frame to prevent freezing */
    MAX_UPDATES_PER_FRAME: 5
};

/**
 * Time manager class handling game loop timing and statistics
 */
class TimeManager {
    constructor(config = {}) {
        // Initialize timing properties
        this.fixedTimestep = config.fixedTimestep || TIME_CONFIG.FIXED_TIMESTEP;
        this.maxDeltaTime = config.maxDeltaTime || TIME_CONFIG.MAX_DELTA_TIME;
        this.maxUpdatesPerFrame = config.maxUpdatesPerFrame || TIME_CONFIG.MAX_UPDATES_PER_FRAME;

        // Time tracking
        this.lastTime = 0;
        this.accumulator = 0;
        this.currentTime = 0;
        
        // Statistics
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // State
        this.isRunning = false;
        this.animationFrameId = null;
    }

    /**
     * Starts the game loop
     * @param {Function} updateFn Update function to be called with fixed timestep
     * @param {Function} renderFn Render function to be called for each frame
     * @throws {Error} If update or render functions are not provided
     */
    start(updateFn, renderFn) {
        if (typeof updateFn !== 'function' || typeof renderFn !== 'function') {
            throw new Error('Update and render functions must be provided');
        }

        this.isRunning = true;
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;
        this.frameCount = 0;

        const gameLoop = (currentTime) => {
            if (!this.isRunning) return;

            // Calculate delta time
            let deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            // Clamp delta time to prevent spiral of death
            deltaTime = Math.min(deltaTime, this.maxDeltaTime);

            // Accumulate time debt
            this.accumulator += deltaTime;

            // Update game state with fixed timestep
            let updateCount = 0;
            while (this.accumulator >= this.fixedTimestep && 
                   updateCount < this.maxUpdatesPerFrame) {
                updateFn(this.fixedTimestep);
                this.accumulator -= this.fixedTimestep;
                updateCount++;
            }

            // If we still have accumulator time, we need to interpolate
            const alpha = this.accumulator / this.fixedTimestep;

            // Render the frame
            renderFn(alpha);

            // Update FPS counter
            this.frameCount++;
            if (currentTime - this.fpsUpdateTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
                this.fpsUpdateTime = currentTime;
                this.frameCount = 0;
            }

            // Schedule next frame
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };

        // Start the game loop
        this.animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Returns current FPS value
     * @returns {number} Current frames per second
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Returns fixed update interval in milliseconds
     * @returns {number} Fixed timestep value
     */
    getFixedTimestep() {
        return this.fixedTimestep;
    }
}

/**
 * Creates and returns a configured TimeManager instance
 * @param {Object} config Configuration options for TimeManager
 * @returns {TimeManager} New TimeManager instance
 */
export function createTimeManager(config = {}) {
    return new TimeManager(config);
}

/**
 * Utility function to create a simple timer
 * @returns {Object} Timer object with start, stop, and getElapsed methods
 */
export function createTimer() {
    let startTime = 0;
    let isRunning = false;

    return {
        start() {
            if (!isRunning) {
                startTime = performance.now();
                isRunning = true;
            }
        },
        
        stop() {
            isRunning = false;
        },
        
        getElapsed() {
            if (!isRunning) return 0;
            return performance.now() - startTime;
        }
    };
}

export default {
    TimeManager,
    createTimeManager,
    createTimer,
    TIME_CONFIG
};