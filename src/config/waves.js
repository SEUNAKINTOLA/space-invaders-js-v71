/**
 * @fileoverview Wave Progression System Configuration
 * Defines the wave patterns, enemy types, and difficulty scaling for the game.
 * Each wave configuration includes enemy types, spawn rates, and difficulty modifiers.
 * 
 * @module config/waves
 * @version 1.0.0
 */

// =========================================
// Constants and Types
// =========================================

/**
 * @typedef {Object} EnemyType
 * @property {string} id - Unique identifier for the enemy type
 * @property {number} baseHealth - Base health points
 * @property {number} baseSpeed - Base movement speed
 * @property {number} baseScore - Base score value
 */

/**
 * @typedef {Object} WaveConfig
 * @property {number} waveNumber - Wave identifier
 * @property {Array<SpawnGroup>} spawnGroups - Groups of enemies to spawn
 * @property {number} difficultyMultiplier - Difficulty scaling for the wave
 * @property {number} timeBetweenGroups - Time in seconds between spawn groups
 */

/**
 * @typedef {Object} SpawnGroup
 * @property {string} enemyType - Type of enemy to spawn
 * @property {number} count - Number of enemies to spawn
 * @property {number} interval - Time between individual spawns
 */

// =========================================
// Enemy Type Definitions
// =========================================

export const ENEMY_TYPES = {
    BASIC: {
        id: 'basic',
        baseHealth: 100,
        baseSpeed: 1.0,
        baseScore: 100
    },
    FAST: {
        id: 'fast',
        baseHealth: 75,
        baseSpeed: 1.5,
        baseScore: 150
    },
    TANK: {
        id: 'tank',
        baseHealth: 200,
        baseSpeed: 0.7,
        baseScore: 200
    },
    BOSS: {
        id: 'boss',
        baseHealth: 1000,
        baseSpeed: 0.5,
        baseScore: 1000
    }
};

// =========================================
// Wave Configuration
// =========================================

/**
 * Base wave configuration defining the progression system
 * @type {Array<WaveConfig>}
 */
export const WAVE_CONFIGURATIONS = [
    {
        waveNumber: 1,
        spawnGroups: [
            {
                enemyType: ENEMY_TYPES.BASIC.id,
                count: 5,
                interval: 2.0
            }
        ],
        difficultyMultiplier: 1.0,
        timeBetweenGroups: 5
    },
    {
        waveNumber: 2,
        spawnGroups: [
            {
                enemyType: ENEMY_TYPES.BASIC.id,
                count: 8,
                interval: 1.5
            },
            {
                enemyType: ENEMY_TYPES.FAST.id,
                count: 3,
                interval: 1.0
            }
        ],
        difficultyMultiplier: 1.2,
        timeBetweenGroups: 4
    },
    // Add more wave configurations as needed...
];

// =========================================
// Difficulty Scaling Functions
// =========================================

/**
 * Calculates scaled health for an enemy based on wave number
 * @param {number} baseHealth - Base health value
 * @param {number} waveNumber - Current wave number
 * @param {number} difficultyMultiplier - Wave-specific difficulty multiplier
 * @returns {number} Scaled health value
 */
export const calculateScaledHealth = (baseHealth, waveNumber, difficultyMultiplier) => {
    return Math.floor(baseHealth * (1 + (waveNumber - 1) * 0.1) * difficultyMultiplier);
};

/**
 * Calculates scaled score for an enemy based on wave number
 * @param {number} baseScore - Base score value
 * @param {number} waveNumber - Current wave number
 * @returns {number} Scaled score value
 */
export const calculateScaledScore = (baseScore, waveNumber) => {
    return Math.floor(baseScore * (1 + (waveNumber - 1) * 0.05));
};

// =========================================
// Wave Generation Utilities
// =========================================

/**
 * Generates a dynamic wave configuration based on wave number
 * @param {number} waveNumber - Wave number to generate configuration for
 * @returns {WaveConfig} Generated wave configuration
 * @throws {Error} If wave number is invalid
 */
export const generateDynamicWave = (waveNumber) => {
    if (waveNumber < 1) {
        throw new Error('Wave number must be greater than 0');
    }

    // For waves beyond the predefined configurations, generate dynamically
    if (waveNumber > WAVE_CONFIGURATIONS.length) {
        return {
            waveNumber,
            spawnGroups: generateDynamicSpawnGroups(waveNumber),
            difficultyMultiplier: 1 + (waveNumber - 1) * 0.1,
            timeBetweenGroups: Math.max(2, 5 - Math.floor(waveNumber / 5))
        };
    }

    return WAVE_CONFIGURATIONS[waveNumber - 1];
};

/**
 * Generates spawn groups for dynamic waves
 * @private
 * @param {number} waveNumber - Current wave number
 * @returns {Array<SpawnGroup>} Generated spawn groups
 */
const generateDynamicSpawnGroups = (waveNumber) => {
    const groups = [];
    const baseCount = 5 + Math.floor(waveNumber / 2);
    
    // Add basic enemies
    groups.push({
        enemyType: ENEMY_TYPES.BASIC.id,
        count: baseCount,
        interval: Math.max(0.5, 2.0 - (waveNumber * 0.1))
    });

    // Add special enemies based on wave number
    if (waveNumber % 5 === 0) {
        groups.push({
            enemyType: ENEMY_TYPES.BOSS.id,
            count: 1,
            interval: 0
        });
    } else if (waveNumber % 3 === 0) {
        groups.push({
            enemyType: ENEMY_TYPES.TANK.id,
            count: Math.floor(baseCount / 2),
            interval: 2.0
        });
    } else if (waveNumber % 2 === 0) {
        groups.push({
            enemyType: ENEMY_TYPES.FAST.id,
            count: Math.floor(baseCount * 0.7),
            interval: 1.0
        });
    }

    return groups;
};

export default {
    ENEMY_TYPES,
    WAVE_CONFIGURATIONS,
    calculateScaledHealth,
    calculateScaledScore,
    generateDynamicWave
};