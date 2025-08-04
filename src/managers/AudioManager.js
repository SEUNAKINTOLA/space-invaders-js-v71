/**
 * @fileoverview Audio Manager Module
 * Handles loading, playing, and managing game sound effects and audio resources.
 * Implements a singleton pattern for centralized audio management.
 * 
 * @module AudioManager
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * @typedef {Object} AudioConfig
 * @property {number} volume - Volume level (0.0 to 1.0)
 * @property {boolean} loop - Whether the audio should loop
 * @property {number} playbackRate - Playback speed (0.5 to 4.0)
 */

/**
 * Manages game audio and sound effects
 */
class AudioManager {
    /**
     * @private
     * Singleton instance
     */
    static #instance = null;

    /**
     * @private
     * Map of loaded audio resources
     * @type {Map<string, HTMLAudioElement>}
     */
    #audioMap = new Map();

    /**
     * @private
     * Master volume setting
     * @type {number}
     */
    #masterVolume = 1.0;

    /**
     * @private
     * Mute state
     * @type {boolean}
     */
    #isMuted = false;

    /**
     * Private constructor to enforce singleton pattern
     * @private
     */
    constructor() {
        if (AudioManager.#instance) {
            throw new Error('AudioManager is a singleton. Use AudioManager.getInstance()');
        }
    }

    /**
     * Gets the singleton instance
     * @returns {AudioManager} The singleton instance
     */
    static getInstance() {
        if (!AudioManager.#instance) {
            AudioManager.#instance = new AudioManager();
        }
        return AudioManager.#instance;
    }

    /**
     * Loads an audio file
     * @param {string} id - Unique identifier for the sound
     * @param {string} url - URL of the audio file
     * @returns {Promise<void>}
     * @throws {Error} If loading fails or invalid parameters
     */
    async loadSound(id, url) {
        try {
            if (!id || !url) {
                throw new Error('Invalid parameters: id and url are required');
            }

            const audio = new Audio(url);
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject);
                audio.load();
            });

            this.#audioMap.set(id, audio);
        } catch (error) {
            console.error(`Failed to load sound ${id}:`, error);
            throw new Error(`Failed to load sound ${id}: ${error.message}`);
        }
    }

    /**
     * Plays a loaded sound
     * @param {string} id - Sound identifier
     * @param {AudioConfig} [config] - Playback configuration
     * @returns {Promise<void>}
     * @throws {Error} If sound not found or playback fails
     */
    async playSound(id, config = {}) {
        try {
            const audio = this.#audioMap.get(id);
            if (!audio) {
                throw new Error(`Sound ${id} not found`);
            }

            // Clone the audio for simultaneous playback
            const soundInstance = audio.cloneNode();
            
            // Apply configuration
            soundInstance.volume = this.#isMuted ? 0 : 
                                 (config.volume ?? 1.0) * this.#masterVolume;
            soundInstance.loop = config.loop ?? false;
            soundInstance.playbackRate = config.playbackRate ?? 1.0;

            await soundInstance.play();
        } catch (error) {
            console.error(`Failed to play sound ${id}:`, error);
            throw new Error(`Failed to play sound ${id}: ${error.message}`);
        }
    }

    /**
     * Stops all currently playing sounds
     */
    stopAllSounds() {
        this.#audioMap.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    /**
     * Sets the master volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     * @throws {Error} If volume is invalid
     */
    setMasterVolume(volume) {
        if (typeof volume !== 'number' || volume < 0 || volume > 1) {
            throw new Error('Volume must be between 0.0 and 1.0');
        }
        this.#masterVolume = volume;
        
        // Update all currently playing sounds
        this.#audioMap.forEach(audio => {
            audio.volume = this.#isMuted ? 0 : volume;
        });
    }

    /**
     * Toggles mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.#isMuted = !this.#isMuted;
        this.#audioMap.forEach(audio => {
            audio.volume = this.#isMuted ? 0 : this.#masterVolume;
        });
        return this.#isMuted;
    }

    /**
     * Releases all audio resources
     */
    dispose() {
        this.stopAllSounds();
        this.#audioMap.clear();
    }

    /**
     * Checks if a sound is loaded
     * @param {string} id - Sound identifier
     * @returns {boolean}
     */
    hasSound(id) {
        return this.#audioMap.has(id);
    }

    /**
     * Gets the current master volume
     * @returns {number}
     */
    getMasterVolume() {
        return this.#masterVolume;
    }

    /**
     * Gets the current mute state
     * @returns {boolean}
     */
    isMuted() {
        return this.#isMuted;
    }
}

export default AudioManager;