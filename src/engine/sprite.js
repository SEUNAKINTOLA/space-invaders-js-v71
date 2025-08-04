/**
 * @fileoverview Sprite rendering system for game engine
 * Handles loading, managing, and rendering sprite images with support for
 * basic animations and transformations.
 * 
 * @module engine/sprite
 */

/**
 * Configuration constants for sprite rendering
 * @constant {Object}
 */
const SPRITE_CONFIG = {
    DEFAULT_SCALE: 1,
    DEFAULT_ALPHA: 1,
    DEFAULT_ROTATION: 0,
    LOADING_TIMEOUT: 5000, // 5 seconds timeout for image loading
};

/**
 * Represents a sprite that can be rendered to a canvas
 * @class Sprite
 */
export class Sprite {
    /**
     * Creates a new Sprite instance
     * @param {Object} config - The sprite configuration
     * @param {string} config.imageUrl - URL of the sprite image
     * @param {number} [config.width] - Width of the sprite
     * @param {number} [config.height] - Height of the sprite
     * @param {number} [config.scale=1] - Scale factor for rendering
     * @param {number} [config.alpha=1] - Alpha transparency value
     * @throws {Error} If required parameters are missing
     */
    constructor(config) {
        if (!config.imageUrl) {
            throw new Error('Sprite requires an image URL');
        }

        this.imageUrl = config.imageUrl;
        this.width = config.width;
        this.height = config.height;
        this.scale = config.scale || SPRITE_CONFIG.DEFAULT_SCALE;
        this.alpha = config.alpha || SPRITE_CONFIG.DEFAULT_ALPHA;
        this.rotation = SPRITE_CONFIG.DEFAULT_ROTATION;
        
        this.image = null;
        this.isLoaded = false;
        this.loadError = null;

        // Bind methods
        this.render = this.render.bind(this);
        this.load = this.load.bind(this);
    }

    /**
     * Loads the sprite image
     * @returns {Promise<void>}
     * @throws {Error} If image loading fails
     */
    async load() {
        try {
            const loadPromise = new Promise((resolve, reject) => {
                const img = new Image();
                
                const timeoutId = setTimeout(() => {
                    reject(new Error('Image loading timeout'));
                }, SPRITE_CONFIG.LOADING_TIMEOUT);

                img.onload = () => {
                    clearTimeout(timeoutId);
                    this.width = this.width || img.width;
                    this.height = this.height || img.height;
                    this.isLoaded = true;
                    this.image = img;
                    resolve();
                };

                img.onerror = () => {
                    clearTimeout(timeoutId);
                    reject(new Error('Failed to load sprite image'));
                };

                img.src = this.imageUrl;
            });

            await loadPromise;
        } catch (error) {
            this.loadError = error;
            throw error;
        }
    }

    /**
     * Renders the sprite to a canvas context
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - X coordinate for rendering
     * @param {number} y - Y coordinate for rendering
     * @throws {Error} If sprite is not loaded or context is invalid
     */
    render(ctx, x, y) {
        if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) {
            throw new Error('Invalid canvas context');
        }

        if (!this.isLoaded || !this.image) {
            throw new Error('Sprite not loaded');
        }

        ctx.save();
        
        try {
            // Apply transformations
            ctx.globalAlpha = this.alpha;
            ctx.translate(x + (this.width * this.scale) / 2, y + (this.height * this.scale) / 2);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);
            
            // Draw the sprite
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } finally {
            ctx.restore();
        }
    }

    /**
     * Updates sprite properties
     * @param {Object} properties - Properties to update
     * @param {number} [properties.scale] - New scale value
     * @param {number} [properties.alpha] - New alpha value
     * @param {number} [properties.rotation] - New rotation value
     */
    update(properties) {
        if (typeof properties.scale === 'number') {
            this.scale = properties.scale;
        }
        if (typeof properties.alpha === 'number') {
            this.alpha = Math.max(0, Math.min(1, properties.alpha));
        }
        if (typeof properties.rotation === 'number') {
            this.rotation = properties.rotation;
        }
    }

    /**
     * Checks if the sprite is ready for rendering
     * @returns {boolean}
     */
    isReady() {
        return this.isLoaded && this.image !== null;
    }

    /**
     * Releases resources held by the sprite
     */
    dispose() {
        if (this.image) {
            this.image.src = '';
            this.image = null;
        }
        this.isLoaded = false;
    }
}

/**
 * Creates a sprite from an image URL
 * @param {string} imageUrl - URL of the sprite image
 * @returns {Promise<Sprite>} A loaded sprite instance
 * @throws {Error} If sprite creation fails
 */
export async function createSprite(imageUrl) {
    const sprite = new Sprite({ imageUrl });
    await sprite.load();
    return sprite;
}