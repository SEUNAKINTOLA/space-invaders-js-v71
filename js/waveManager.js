/**
 * @fileoverview Wave Manager System
 * Handles enemy wave spawning, progression, and management.
 * 
 * @module waveManager
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants for wave configuration
const WAVE_CONFIG = {
    SPAWN_DELAY: 1500,      // Delay between enemy spawns (ms)
    WAVE_DELAY: 5000,       // Delay between waves (ms)
    DIFFICULTY_MULTIPLIER: 1.5, // Increase in difficulty per wave
    MAX_ENEMIES_PER_WAVE: 20,
    MIN_ENEMIES_PER_WAVE: 3
};

/**
 * Represents an enemy wave configuration
 * @typedef {Object} WaveConfig
 * @property {number} enemyCount - Number of enemies in the wave
 * @property {string[]} enemyTypes - Types of enemies to spawn
 * @property {number} spawnDelay - Delay between spawns
 */

/**
 * Manages enemy wave spawning and progression
 */
export class WaveManager {
    /**
     * @param {Object} config - Wave manager configuration
     * @param {Function} onEnemySpawn - Callback for enemy spawn events
     * @param {Function} onWaveComplete - Callback for wave completion
     */
    constructor(config = {}, onEnemySpawn = null, onWaveComplete = null) {
        this.currentWave = 0;
        this.activeEnemies = 0;
        this.isSpawning = false;
        this.config = { ...WAVE_CONFIG, ...config };
        this.onEnemySpawn = onEnemySpawn;
        this.onWaveComplete = onWaveComplete;
        this.spawnQueue = [];
        this.waveTimeout = null;
        this.spawnTimeout = null;
    }

    /**
     * Starts the wave system
     * @throws {Error} If wave system is already running
     */
    start() {
        if (this.isSpawning) {
            throw new Error('Wave system is already running');
        }
        this.startNextWave();
    }

    /**
     * Stops the wave system and clears all timeouts
     */
    stop() {
        this.isSpawning = false;
        if (this.waveTimeout) clearTimeout(this.waveTimeout);
        if (this.spawnTimeout) clearTimeout(this.spawnTimeout);
        this.spawnQueue = [];
    }

    /**
     * Generates configuration for the next wave
     * @private
     * @returns {WaveConfig}
     */
    generateWaveConfig() {
        const baseEnemyCount = Math.min(
            Math.ceil(this.currentWave * this.config.DIFFICULTY_MULTIPLIER),
            this.config.MAX_ENEMIES_PER_WAVE
        );

        return {
            enemyCount: Math.max(baseEnemyCount, this.config.MIN_ENEMIES_PER_WAVE),
            enemyTypes: this.getEnemyTypesForWave(),
            spawnDelay: Math.max(
                this.config.SPAWN_DELAY - (this.currentWave * 100),
                500
            )
        };
    }

    /**
     * Determines enemy types for current wave
     * @private
     * @returns {string[]}
     */
    getEnemyTypesForWave() {
        // Example enemy type distribution - can be expanded based on game needs
        return ['basic', 'fast', 'strong'].slice(0, Math.min(this.currentWave, 3));
    }

    /**
     * Starts the next wave of enemies
     * @private
     */
    startNextWave() {
        this.currentWave++;
        this.isSpawning = true;
        const waveConfig = this.generateWaveConfig();
        
        console.log(`Starting Wave ${this.currentWave}`);
        this.spawnWave(waveConfig);
    }

    /**
     * Spawns enemies according to wave configuration
     * @private
     * @param {WaveConfig} waveConfig - Configuration for the current wave
     */
    spawnWave(waveConfig) {
        let enemiesSpawned = 0;

        const spawnEnemy = () => {
            if (!this.isSpawning || enemiesSpawned >= waveConfig.enemyCount) {
                this.spawnTimeout = null;
                return;
            }

            const enemyType = waveConfig.enemyTypes[
                Math.floor(Math.random() * waveConfig.enemyTypes.length)
            ];

            if (this.onEnemySpawn) {
                try {
                    this.onEnemySpawn(enemyType, this.currentWave);
                    this.activeEnemies++;
                } catch (error) {
                    console.error('Error spawning enemy:', error);
                }
            }

            enemiesSpawned++;
            
            if (enemiesSpawned < waveConfig.enemyCount) {
                this.spawnTimeout = setTimeout(spawnEnemy, waveConfig.spawnDelay);
            }
        };

        spawnEnemy();
    }

    /**
     * Handles enemy destruction
     * @public
     */
    onEnemyDestroyed() {
        this.activeEnemies = Math.max(0, this.activeEnemies - 1);
        
        if (this.activeEnemies === 0 && !this.spawnTimeout) {
            this.handleWaveComplete();
        }
    }

    /**
     * Handles wave completion
     * @private
     */
    handleWaveComplete() {
        if (this.onWaveComplete) {
            try {
                this.onWaveComplete(this.currentWave);
            } catch (error) {
                console.error('Error in wave completion callback:', error);
            }
        }

        this.waveTimeout = setTimeout(() => {
            this.startNextWave();
        }, this.config.WAVE_DELAY);
    }

    /**
     * Gets the current wave number
     * @public
     * @returns {number}
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Gets the number of active enemies
     * @public
     * @returns {number}
     */
    getActiveEnemies() {
        return this.activeEnemies;
    }
}

export default WaveManager;