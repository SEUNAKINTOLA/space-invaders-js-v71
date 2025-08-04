/**
 * @fileoverview High Score Management System
 * Handles storage, retrieval, and calculation of game scores including multipliers and combos
 * 
 * @module HighScore
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants for score management
const STORAGE_KEY = 'gameHighScores';
const MAX_SCORES_TO_KEEP = 10;
const COMBO_MULTIPLIERS = {
  2: 1.5,  // 2 consecutive hits
  3: 2.0,  // 3 consecutive hits
  5: 3.0,  // 5 consecutive hits
  10: 5.0  // 10 consecutive hits
};

/**
 * Represents a single score entry
 * @typedef {Object} ScoreEntry
 * @property {number} score - The final calculated score
 * @property {number} baseScore - The original score before multipliers
 * @property {number} multiplier - The final multiplier applied
 * @property {number} combo - Maximum combo achieved
 * @property {string} playerName - Name of the player
 * @property {Date} date - When the score was achieved
 */

/**
 * Manages high scores with advanced scoring mechanics
 */
class HighScoreManager {
  constructor() {
    this.scores = this.loadScores();
  }

  /**
   * Loads scores from local storage
   * @private
   * @returns {Array<ScoreEntry>}
   */
  loadScores() {
    try {
      const storedScores = localStorage.getItem(STORAGE_KEY);
      return storedScores ? JSON.parse(storedScores) : [];
    } catch (error) {
      console.error('Error loading scores:', error);
      return [];
    }
  }

  /**
   * Saves scores to local storage
   * @private
   * @param {Array<ScoreEntry>} scores
   */
  saveScores(scores) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Error saving scores:', error);
      throw new Error('Failed to save scores');
    }
  }

  /**
   * Calculates the combo multiplier based on consecutive hits
   * @private
   * @param {number} comboCount
   * @returns {number}
   */
  calculateComboMultiplier(comboCount) {
    const thresholds = Object.keys(COMBO_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of thresholds) {
      if (comboCount >= threshold) {
        return COMBO_MULTIPLIERS[threshold];
      }
    }
    return 1.0;
  }

  /**
   * Adds a new score to the high score list
   * @param {number} baseScore - Original score before multipliers
   * @param {number} comboCount - Maximum combo achieved
   * @param {string} playerName - Name of the player
   * @returns {ScoreEntry} The processed score entry
   */
  addScore(baseScore, comboCount, playerName) {
    if (typeof baseScore !== 'number' || baseScore < 0) {
      throw new Error('Invalid base score');
    }

    if (typeof comboCount !== 'number' || comboCount < 0) {
      throw new Error('Invalid combo count');
    }

    if (!playerName || typeof playerName !== 'string') {
      throw new Error('Invalid player name');
    }

    const multiplier = this.calculateComboMultiplier(comboCount);
    const finalScore = Math.round(baseScore * multiplier);

    const scoreEntry = {
      score: finalScore,
      baseScore,
      multiplier,
      combo: comboCount,
      playerName,
      date: new Date()
    };

    this.scores.push(scoreEntry);
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, MAX_SCORES_TO_KEEP);
    
    this.saveScores(this.scores);
    return scoreEntry;
  }

  /**
   * Retrieves all high scores
   * @returns {Array<ScoreEntry>}
   */
  getHighScores() {
    return [...this.scores];
  }

  /**
   * Gets the top score
   * @returns {ScoreEntry|null}
   */
  getTopScore() {
    return this.scores.length > 0 ? this.scores[0] : null;
  }

  /**
   * Checks if a given score would be a new high score
   * @param {number} score
   * @returns {boolean}
   */
  isHighScore(score) {
    if (this.scores.length < MAX_SCORES_TO_KEEP) {
      return true;
    }
    return score > this.scores[this.scores.length - 1].score;
  }

  /**
   * Clears all stored high scores
   */
  clearScores() {
    this.scores = [];
    this.saveScores(this.scores);
  }
}

// Export a singleton instance
const highScoreManager = new HighScoreManager();
Object.freeze(highScoreManager);

export default highScoreManager;