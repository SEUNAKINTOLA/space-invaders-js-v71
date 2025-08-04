/**
 * @fileoverview Resource Loader Module
 * Handles loading and management of sprite and image resources for the game engine.
 * Provides async loading capabilities with error handling and loading status tracking.
 * 
 * @module engine/resourceLoader
 */

// Constants for resource management
const RESOURCE_TYPES = {
    IMAGE: 'image',
    SPRITE: 'sprite',
    AUDIO: 'audio'
};

const DEFAULT_OPTIONS = {
    crossOrigin: 'anonymous',
    timeout: 30000, // 30 seconds timeout
    retryAttempts: 2
};

/**
 * Manages the loading and caching of game resources.
 */
class ResourceLoader {
    /**
     * @constructor
     * @param {Object} options - Configuration options for the resource loader
     */
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.resources = new Map();
        this.loading = new Map();
        this.errors = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Loads a single resource and stores it in the cache.
     * @param {string} key - Unique identifier for the resource
     * @param {string} url - URL of the resource to load
     * @param {string} type - Type of resource (image, sprite, audio)
     * @returns {Promise<HTMLImageElement|HTMLAudioElement>}
     * @throws {Error} If resource type is unsupported or loading fails
     */
    async loadResource(key, url, type = RESOURCE_TYPES.IMAGE) {
        if (this.resources.has(key)) {
            return this.resources.get(key);
        }

        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        const loadPromise = new Promise((resolve, reject) => {
            try {
                switch (type) {
                    case RESOURCE_TYPES.IMAGE:
                    case RESOURCE_TYPES.SPRITE:
                        this._loadImage(key, url, resolve, reject);
                        break;
                    case RESOURCE_TYPES.AUDIO:
                        this._loadAudio(key, url, resolve, reject);
                        break;
                    default:
                        throw new Error(`Unsupported resource type: ${type}`);
                }
            } catch (error) {
                reject(error);
            }
        });

        this.loadingPromises.set(key, loadPromise);

        try {
            const resource = await this._withTimeout(loadPromise);
            this.resources.set(key, resource);
            this.loadingPromises.delete(key);
            return resource;
        } catch (error) {
            this.errors.set(key, error);
            this.loadingPromises.delete(key);
            throw error;
        }
    }

    /**
     * Loads multiple resources in parallel.
     * @param {Object[]} resourceList - Array of resource definitions
     * @returns {Promise<Map>} Map of loaded resources
     */
    async loadMany(resourceList) {
        const promises = resourceList.map(({ key, url, type }) => 
            this.loadResource(key, url, type)
                .catch(error => {
                    console.error(`Failed to load resource ${key}:`, error);
                    return null;
                })
        );

        await Promise.all(promises);
        return this.resources;
    }

    /**
     * Gets a loaded resource by key.
     * @param {string} key - Resource identifier
     * @returns {HTMLImageElement|HTMLAudioElement|null}
     */
    getResource(key) {
        return this.resources.get(key) || null;
    }

    /**
     * Checks if a resource is currently loading.
     * @param {string} key - Resource identifier
     * @returns {boolean}
     */
    isLoading(key) {
        return this.loading.has(key);
    }

    /**
     * Private method to load image resources.
     * @private
     */
    _loadImage(key, url, resolve, reject) {
        const img = new Image();
        img.crossOrigin = this.options.crossOrigin;

        img.onload = () => {
            this.loading.delete(key);
            resolve(img);
        };

        img.onerror = (error) => {
            this.loading.delete(key);
            reject(new Error(`Failed to load image: ${url}`));
        };

        this.loading.set(key, true);
        img.src = url;
    }

    /**
     * Private method to load audio resources.
     * @private
     */
    _loadAudio(key, url, resolve, reject) {
        const audio = new Audio();

        audio.oncanplaythrough = () => {
            this.loading.delete(key);
            resolve(audio);
        };

        audio.onerror = (error) => {
            this.loading.delete(key);
            reject(new Error(`Failed to load audio: ${url}`));
        };

        this.loading.set(key, true);
        audio.src = url;
    }

    /**
     * Adds timeout functionality to a promise.
     * @private
     */
    _withTimeout(promise) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Resource loading timed out'));
            }, this.options.timeout);
        });

        return Promise.race([promise, timeoutPromise]);
    }

    /**
     * Clears all loaded resources from memory.
     */
    clear() {
        this.resources.clear();
        this.loading.clear();
        this.errors.clear();
        this.loadingPromises.clear();
    }
}

// Export the module
export { ResourceLoader, RESOURCE_TYPES };