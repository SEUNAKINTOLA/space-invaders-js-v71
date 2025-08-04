/**
 * @fileoverview Wave Management System
 * Handles the progression and spawning of enemy waves with increasing difficulty
 * 
 * @module WaveManager
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants for wave configuration
const WAVE_CONFIG = {
    INITIAL_ENEMIES: 5,
    ENEMY_INCREMENT: 2,
    DIFFICULTY_MULTIPLIER: 1.2,
    SPAWN_DELAY: 1000, // milliseconds between spawns
    WAVE_DELAY: 5000   // milliseconds between waves
};

/**
 * Manages the wave-based progression system for enemy spawning
 */
class WaveManager {
    /**
     * @typedef {Object} WaveOptions
     * @property {number} [startingWave=1] - Initial wave number
     * @property {Function} [onEnemySpawn] - Callback when enemy spawns
     * @property {Function} [onWaveComplete] - Callback when wave completes
     * @property {Function} [onWaveStart] - Callback when wave starts
     */

    /**
     * Creates a new WaveManager instance
     * @param {WaveOptions} options - Configuration options
     */
    constructor(options = {}) {
        this.currentWave = options.startingWave || 1;
        this.enemiesRemaining = 0;
        this.isWaveActive = false;
        this.spawnTimer = null;
        this.waveTimer = null;

        // Callbacks
        this.onEnemySpawn = options.onEnemySpawn || (() => {});
        this.onWaveComplete = options.onWaveComplete || (() => {});
        this.onWaveStart = options.onWaveStart || (() => {});

        // Bind methods
        this.startWave = this.startWave.bind(this);
        this.spawnEnemy = this.spawnEnemy.bind(this);
        this.handleEnemyDefeated = this.handleEnemyDefeated.bind(this);
    }

    /**
     * Calculates the number of enemies for the current wave
     * @returns {number} Number of enemies to spawn
     * @private
     */
    _calculateEnemyCount() {
        return Math.floor(
            WAVE_CONFIG.INITIAL_ENEMIES + 
            (this.currentWave - 1) * WAVE_CONFIG.ENEMY_INCREMENT
        );
    }

    /**
     * Calculates the difficulty multiplier for the current wave
     * @returns {number} Difficulty multiplier
     * @private
     */
    _calculateDifficulty() {
        return Math.pow(WAVE_CONFIG.DIFFICULTY_MULTIPLIER, this.currentWave - 1);
    }

    /**
     * Starts a new wave
     * @returns {void}
     * @throws {Error} If a wave is already in progress
     */
    startWave() {
        if (this.isWaveActive) {
            throw new Error('Wave already in progress');
        }

        this.isWaveActive = true;
        this.enemiesRemaining = this._calculateEnemyCount();
        const difficulty = this._calculateDifficulty();

        // Notify wave start
        this.onWaveStart({
            waveNumber: this.currentWave,
            enemyCount: this.enemiesRemaining,
            difficulty: difficulty
        });

        // Begin spawning enemies
        this.spawnTimer = setInterval(this.spawnEnemy, WAVE_CONFIG.SPAWN_DELAY);
    }

    /**
     * Spawns a single enemy
     * @returns {void}
     * @private
     */
    spawnEnemy() {
        if (this.enemiesRemaining <= 0) {
            clearInterval(this.spawnTimer);
            return;
        }

        const enemyData = {
            waveNumber: this.currentWave,
            difficulty: this._calculateDifficulty(),
            position: this._getRandomSpawnPosition()
        };

        this.onEnemySpawn(enemyData);
        this.enemiesRemaining--;
    }

    /**
     * Handles the defeat of an enemy
     * @returns {void}
     */
    handleEnemyDefeated() {
        if (!this.isWaveActive) return;

        if (this.enemiesRemaining <= 0 && !this.spawnTimer) {
            this._completeWave();
        }
    }

    /**
     * Completes the current wave and prepares for the next
     * @private
     */
    _completeWave() {
        this.isWaveActive = false;
        clearInterval(this.spawnTimer);
        this.spawnTimer = null;

        // Notify wave completion
        this.onWaveComplete({
            waveNumber: this.currentWave,
            nextWaveNumber: this.currentWave + 1
        });

        // Prepare next wave
        this.currentWave++;
        this.waveTimer = setTimeout(() => {
            this.startWave();
        }, WAVE_CONFIG.WAVE_DELAY);
    }

    /**
     * Generates a random spawn position
     * @returns {{x: number, y: number}} Spawn coordinates
     * @private
     */
    _getRandomSpawnPosition() {
        // This is a placeholder implementation
        return {
            x: Math.random() * 1000,
            y: Math.random() * 1000
        };
    }

    /**
     * Pauses the wave manager
     * @returns {void}
     */
    pause() {
        clearInterval(this.spawnTimer);
        clearTimeout(this.waveTimer);
    }

    /**
     * Resumes the wave manager
     * @returns {void}
     */
    resume() {
        if (this.isWaveActive) {
            this.spawnTimer = setInterval(this.spawnEnemy, WAVE_CONFIG.SPAWN_DELAY);
        }
    }

    /**
     * Resets the wave manager to initial state
     * @param {number} [startingWave=1] - Wave number to reset to
     * @returns {void}
     */
    reset(startingWave = 1) {
        this.pause();
        this.currentWave = startingWave;
        this.enemiesRemaining = 0;
        this.isWaveActive = false;
        this.spawnTimer = null;
        this.waveTimer = null;
    }

    /**
     * Gets the current wave status
     * @returns {Object} Current wave status
     */
    getStatus() {
        return {
            currentWave: this.currentWave,
            enemiesRemaining: this.enemiesRemaining,
            isActive: this.isWaveActive,
            difficulty: this._calculateDifficulty()
        };
    }
}

export default WaveManager;