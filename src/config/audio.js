/**
 * @fileoverview Audio configuration and sound effects management system
 * Defines sound mappings, settings, and utility functions for game audio.
 * 
 * @module config/audio
 * @requires howler (assumed audio library)
 */

import { Howl } from 'howler'; // Assuming Howler.js as the audio library

/**
 * @constant {Object} AUDIO_SETTINGS
 * Global audio settings and configurations
 */
export const AUDIO_SETTINGS = {
  masterVolume: 1.0,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  enabled: true,
  fadeInDuration: 1000,
  fadeOutDuration: 500,
};

/**
 * @constant {Object} SOUND_PATHS
 * Mapping of sound effect paths relative to assets directory
 */
const SOUND_PATHS = {
  buttonClick: 'sfx/ui/button-click.mp3',
  gameStart: 'sfx/game/start.mp3',
  gameOver: 'sfx/game/over.mp3',
  collect: 'sfx/game/collect.mp3',
  jump: 'sfx/player/jump.mp3',
  hit: 'sfx/player/hit.mp3',
  powerUp: 'sfx/player/power-up.mp3',
  background: 'music/background.mp3',
};

/**
 * @constant {Object} SOUND_CONFIG
 * Configuration for individual sound effects
 */
const SOUND_CONFIG = {
  buttonClick: { volume: 0.5, loop: false },
  gameStart: { volume: 0.7, loop: false },
  gameOver: { volume: 0.8, loop: false },
  collect: { volume: 0.4, loop: false },
  jump: { volume: 0.3, loop: false },
  hit: { volume: 0.6, loop: false },
  powerUp: { volume: 0.7, loop: false },
  background: { volume: 0.4, loop: true },
};

/**
 * @type {Object.<string, Howl>}
 * Cache for loaded sound instances
 */
const soundCache = {};

/**
 * Initializes a sound effect and adds it to the cache
 * @param {string} soundId - The identifier for the sound
 * @returns {Howl} The initialized Howl instance
 */
function initializeSound(soundId) {
  if (!SOUND_PATHS[soundId]) {
    throw new Error(`Invalid sound ID: ${soundId}`);
  }

  if (soundCache[soundId]) {
    return soundCache[soundId];
  }

  const config = SOUND_CONFIG[soundId] || {};
  
  const sound = new Howl({
    src: [SOUND_PATHS[soundId]],
    volume: config.volume * AUDIO_SETTINGS.sfxVolume,
    loop: config.loop || false,
    preload: true,
    onloaderror: (id, error) => {
      console.error(`Error loading sound ${soundId}:`, error);
    }
  });

  soundCache[soundId] = sound;
  return sound;
}

/**
 * Audio manager for handling sound effects and music
 */
export class AudioManager {
  /**
   * Plays a sound effect
   * @param {string} soundId - The identifier for the sound to play
   * @returns {number|null} The sound instance ID or null if disabled
   */
  static playSound(soundId) {
    if (!AUDIO_SETTINGS.enabled) return null;

    try {
      const sound = initializeSound(soundId);
      return sound.play();
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
      return null;
    }
  }

  /**
   * Stops a specific sound
   * @param {string} soundId - The identifier for the sound to stop
   */
  static stopSound(soundId) {
    if (soundCache[soundId]) {
      soundCache[soundId].stop();
    }
  }

  /**
   * Updates the volume for all sounds
   * @param {number} volume - New volume level (0-1)
   */
  static setMasterVolume(volume) {
    AUDIO_SETTINGS.masterVolume = Math.max(0, Math.min(1, volume));
    Object.values(soundCache).forEach(sound => {
      sound.volume(AUDIO_SETTINGS.masterVolume);
    });
  }

  /**
   * Mutes/unmutes all audio
   * @param {boolean} muted - Whether to mute audio
   */
  static setMuted(muted) {
    AUDIO_SETTINGS.enabled = !muted;
    Object.values(soundCache).forEach(sound => {
      sound.mute(muted);
    });
  }

  /**
   * Preloads all sound effects
   * @returns {Promise<void>}
   */
  static async preloadAll() {
    try {
      await Promise.all(
        Object.keys(SOUND_PATHS).map(soundId => {
          return new Promise((resolve) => {
            const sound = initializeSound(soundId);
            sound.once('load', resolve);
          });
        })
      );
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }

  /**
   * Cleans up and unloads all sounds
   */
  static dispose() {
    Object.values(soundCache).forEach(sound => {
      sound.unload();
    });
    Object.keys(soundCache).forEach(key => {
      delete soundCache[key];
    });
  }
}

export default AudioManager;