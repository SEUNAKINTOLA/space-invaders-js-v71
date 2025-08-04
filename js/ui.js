/**
 * @fileoverview UI module for handling game score display and updates
 * @module ui
 */

// Constants for score display configuration
const SCORE_CONFIG = {
    INITIAL_SCORE: 0,
    ANIMATION_DURATION: 300,
    SCORE_PREFIX: 'Score: ',
    HIGH_SCORE_PREFIX: 'High Score: ',
    SCORE_UPDATE_CLASS: 'score-update'
};

/**
 * Class responsible for managing and displaying the game score
 */
class ScoreDisplay {
    /**
     * @constructor
     * @param {string} scoreContainerId - DOM ID for the score container element
     * @param {string} highScoreContainerId - DOM ID for the high score container element
     */
    constructor(scoreContainerId = 'score-container', highScoreContainerId = 'high-score-container') {
        this.currentScore = SCORE_CONFIG.INITIAL_SCORE;
        this.highScore = this.loadHighScore();
        
        // Initialize DOM elements
        this.scoreElement = this.initializeScoreElement(scoreContainerId);
        this.highScoreElement = this.initializeHighScoreElement(highScoreContainerId);
        
        // Initial display
        this.updateDisplay();
    }

    /**
     * Initializes the score display element
     * @private
     * @param {string} containerId - DOM ID for the score container
     * @returns {HTMLElement} The score display element
     * @throws {Error} If the container element cannot be found
     */
    initializeScoreElement(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Score container element with ID '${containerId}' not found`);
        }
        return container;
    }

    /**
     * Initializes the high score display element
     * @private
     * @param {string} containerId - DOM ID for the high score container
     * @returns {HTMLElement} The high score display element
     * @throws {Error} If the container element cannot be found
     */
    initializeHighScoreElement(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`High score container element with ID '${containerId}' not found`);
        }
        return container;
    }

    /**
     * Loads the high score from local storage
     * @private
     * @returns {number} The stored high score or 0 if not found
     */
    loadHighScore() {
        try {
            const storedScore = localStorage.getItem('highScore');
            return storedScore ? parseInt(storedScore, 10) : SCORE_CONFIG.INITIAL_SCORE;
        } catch (error) {
            console.warn('Failed to load high score from local storage:', error);
            return SCORE_CONFIG.INITIAL_SCORE;
        }
    }

    /**
     * Saves the current high score to local storage
     * @private
     */
    saveHighScore() {
        try {
            localStorage.setItem('highScore', this.highScore.toString());
        } catch (error) {
            console.warn('Failed to save high score to local storage:', error);
        }
    }

    /**
     * Updates the score display in the UI
     * @private
     */
    updateDisplay() {
        this.scoreElement.textContent = `${SCORE_CONFIG.SCORE_PREFIX}${this.currentScore}`;
        this.highScoreElement.textContent = `${SCORE_CONFIG.HIGH_SCORE_PREFIX}${this.highScore}`;
    }

    /**
     * Adds points to the current score and updates the display
     * @param {number} points - Points to add to the current score
     * @throws {Error} If points parameter is not a number
     */
    addPoints(points) {
        if (typeof points !== 'number') {
            throw new Error('Points must be a number');
        }

        this.currentScore += points;
        
        // Check for new high score
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }

        // Animate score update
        this.animateScoreUpdate();
        this.updateDisplay();
    }

    /**
     * Resets the current score to initial value
     */
    resetScore() {
        this.currentScore = SCORE_CONFIG.INITIAL_SCORE;
        this.updateDisplay();
    }

    /**
     * Animates the score update with a visual feedback
     * @private
     */
    animateScoreUpdate() {
        this.scoreElement.classList.add(SCORE_CONFIG.SCORE_UPDATE_CLASS);
        setTimeout(() => {
            this.scoreElement.classList.remove(SCORE_CONFIG.SCORE_UPDATE_CLASS);
        }, SCORE_CONFIG.ANIMATION_DURATION);
    }

    /**
     * Gets the current score
     * @returns {number} Current score
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * Gets the current high score
     * @returns {number} Current high score
     */
    getHighScore() {
        return this.highScore;
    }
}

// Export the ScoreDisplay class
export default ScoreDisplay;