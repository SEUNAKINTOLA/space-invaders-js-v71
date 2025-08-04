/**
 * @fileoverview Score Manager - Handles game scoring logic including multipliers and combos
 * @module ScoreManager
 * @description Manages scoring calculations, multipliers, and combo tracking for the game
 */

// Constants for scoring configuration
const SCORING_CONFIG = {
    BASE_MULTIPLIER: 1,
    MAX_MULTIPLIER: 8,
    COMBO_THRESHOLD: 3,
    COMBO_TIMEOUT_MS: 5000,
    SCORE_TYPES: {
        BASIC: 100,
        SPECIAL: 250,
        BONUS: 500,
        PERFECT: 1000
    }
};

/**
 * Manages game scoring including multipliers, combos, and score calculations
 */
class ScoreManager {
    /**
     * Creates a new ScoreManager instance
     * @param {Object} options - Configuration options
     * @param {number} [options.initialScore=0] - Starting score
     * @param {number} [options.initialMultiplier=1] - Starting multiplier
     */
    constructor(options = {}) {
        this.currentScore = options.initialScore || 0;
        this.currentMultiplier = options.initialMultiplier || SCORING_CONFIG.BASE_MULTIPLIER;
        this.comboCount = 0;
        this.lastScoreTime = 0;
        this.highScore = 0;
        this.scoreHistory = [];
        
        // Bind methods
        this.addScore = this.addScore.bind(this);
        this.resetMultiplier = this.resetMultiplier.bind(this);
    }

    /**
     * Adds points to the current score with multiplier and combo calculations
     * @param {string} scoreType - Type of score to add (BASIC, SPECIAL, BONUS, PERFECT)
     * @param {Object} [options] - Additional scoring options
     * @param {boolean} [options.maintainCombo=false] - Whether to maintain the current combo
     * @returns {Object} Updated score information
     * @throws {Error} If invalid score type is provided
     */
    addScore(scoreType, options = {}) {
        try {
            // Validate score type
            if (!SCORING_CONFIG.SCORE_TYPES[scoreType]) {
                throw new Error(`Invalid score type: ${scoreType}`);
            }

            const basePoints = SCORING_CONFIG.SCORE_TYPES[scoreType];
            const currentTime = Date.now();

            // Check combo timing
            if (currentTime - this.lastScoreTime > SCORING_CONFIG.COMBO_TIMEOUT_MS && !options.maintainCombo) {
                this.comboCount = 0;
            }

            // Update combo
            this.comboCount++;
            this.lastScoreTime = currentTime;

            // Calculate final score with multipliers
            const pointsWithMultiplier = this._calculatePointsWithMultiplier(basePoints);
            
            // Update current score
            this.currentScore += pointsWithMultiplier;
            
            // Update high score if necessary
            this.highScore = Math.max(this.highScore, this.currentScore);

            // Record score event
            this._recordScoreEvent(scoreType, pointsWithMultiplier);

            return {
                pointsAdded: pointsWithMultiplier,
                currentScore: this.currentScore,
                multiplier: this.currentMultiplier,
                comboCount: this.comboCount
            };
        } catch (error) {
            console.error('Error adding score:', error);
            throw error;
        }
    }

    /**
     * Calculates points with current multiplier and combo bonuses
     * @private
     * @param {number} basePoints - Base points before multipliers
     * @returns {number} Final points after multipliers
     */
    _calculatePointsWithMultiplier(basePoints) {
        let finalMultiplier = this.currentMultiplier;

        // Add combo bonus if applicable
        if (this.comboCount >= SCORING_CONFIG.COMBO_THRESHOLD) {
            finalMultiplier *= (1 + (this.comboCount - SCORING_CONFIG.COMBO_THRESHOLD) * 0.1);
        }

        return Math.round(basePoints * finalMultiplier);
    }

    /**
     * Records a score event in the history
     * @private
     * @param {string} scoreType - Type of score achieved
     * @param {number} points - Points awarded
     */
    _recordScoreEvent(scoreType, points) {
        this.scoreHistory.push({
            timestamp: Date.now(),
            scoreType,
            points,
            multiplier: this.currentMultiplier,
            comboCount: this.comboCount
        });
    }

    /**
     * Increases the current score multiplier
     * @returns {number} New multiplier value
     */
    increaseMultiplier() {
        this.currentMultiplier = Math.min(
            this.currentMultiplier + 1,
            SCORING_CONFIG.MAX_MULTIPLIER
        );
        return this.currentMultiplier;
    }

    /**
     * Resets the multiplier to base value
     */
    resetMultiplier() {
        this.currentMultiplier = SCORING_CONFIG.BASE_MULTIPLIER;
        this.comboCount = 0;
    }

    /**
     * Gets the current score statistics
     * @returns {Object} Current scoring statistics
     */
    getScoreStats() {
        return {
            currentScore: this.currentScore,
            highScore: this.highScore,
            currentMultiplier: this.currentMultiplier,
            comboCount: this.comboCount,
            scoreHistory: this.scoreHistory
        };
    }

    /**
     * Resets all scoring data
     */
    reset() {
        this.currentScore = 0;
        this.currentMultiplier = SCORING_CONFIG.BASE_MULTIPLIER;
        this.comboCount = 0;
        this.lastScoreTime = 0;
        this.scoreHistory = [];
    }
}

export default ScoreManager;