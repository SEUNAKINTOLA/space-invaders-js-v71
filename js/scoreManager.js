/**
 * @fileoverview Score Management System
 * Handles player score tracking, storage, and retrieval functionality.
 * 
 * @module scoreManager
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * @constant {string} SCORE_STORAGE_KEY - Local storage key for storing scores
 */
const SCORE_STORAGE_KEY = 'gameScores';

/**
 * @constant {number} MAX_HIGH_SCORES - Maximum number of high scores to store
 */
const MAX_HIGH_SCORES = 10;

/**
 * Class representing a score management system
 */
class ScoreManager {
    /**
     * Create a score manager instance
     */
    constructor() {
        this.currentScore = 0;
        this.highScores = this.loadHighScores();
    }

    /**
     * Add points to the current score
     * @param {number} points - Points to add
     * @throws {Error} If points is not a positive number
     */
    addPoints(points) {
        if (typeof points !== 'number' || points < 0) {
            throw new Error('Points must be a positive number');
        }
        this.currentScore += points;
        this.notifyScoreUpdate();
    }

    /**
     * Reset the current score to zero
     */
    resetScore() {
        this.currentScore = 0;
        this.notifyScoreUpdate();
    }

    /**
     * Get the current score
     * @returns {number} Current score
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * Save the current score to high scores if it qualifies
     * @param {string} playerName - Name of the player
     * @returns {boolean} Whether the score was saved as a high score
     */
    saveScore(playerName) {
        if (!playerName || typeof playerName !== 'string') {
            throw new Error('Valid player name is required');
        }

        const newScore = {
            name: playerName.trim(),
            score: this.currentScore,
            date: new Date().toISOString()
        };

        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, MAX_HIGH_SCORES);

        this.saveHighScores();
        return this.isHighScore(this.currentScore);
    }

    /**
     * Check if a score qualifies as a high score
     * @param {number} score - Score to check
     * @returns {boolean} Whether the score is a high score
     */
    isHighScore(score) {
        return this.highScores.length < MAX_HIGH_SCORES || 
               score > this.highScores[this.highScores.length - 1].score;
    }

    /**
     * Get the list of high scores
     * @returns {Array<Object>} List of high scores
     */
    getHighScores() {
        return [...this.highScores];
    }

    /**
     * Load high scores from local storage
     * @private
     * @returns {Array<Object>} List of high scores
     */
    loadHighScores() {
        try {
            const stored = localStorage.getItem(SCORE_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading high scores:', error);
            return [];
        }
    }

    /**
     * Save high scores to local storage
     * @private
     */
    saveHighScores() {
        try {
            localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }

    /**
     * Notify subscribers of score updates
     * @private
     */
    notifyScoreUpdate() {
        // Dispatch a custom event for score updates
        const event = new CustomEvent('scoreUpdate', {
            detail: { score: this.currentScore }
        });
        document.dispatchEvent(event);
    }
}

/**
 * Create and export a singleton instance of ScoreManager
 */
const scoreManager = new ScoreManager();
Object.freeze(scoreManager);

export default scoreManager;