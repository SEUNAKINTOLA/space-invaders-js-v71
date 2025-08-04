/**
 * @fileoverview Game State Management System
 * Implements a finite state machine pattern for managing game states
 * and transitions between different game phases.
 * 
 * @module gameState
 */

/**
 * @enum {string}
 * Defines possible game states
 */
export const GameStates = {
    INIT: 'INIT',
    LOADING: 'LOADING',
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

/**
 * @typedef {Object} StateTransition
 * @property {function} onEnter - Called when entering the state
 * @property {function} onExit - Called when exiting the state
 * @property {Set<string>} allowedTransitions - States that can be transitioned to
 */

/**
 * Manages game states and state transitions
 */
export class GameStateManager {
    /**
     * @private
     * @type {string}
     */
    #currentState;

    /**
     * @private
     * @type {Map<string, StateTransition>}
     */
    #stateTransitions;

    /**
     * @private
     * @type {function[]}
     */
    #stateChangeListeners;

    constructor() {
        this.#currentState = GameStates.INIT;
        this.#stateTransitions = new Map();
        this.#stateChangeListeners = [];
        
        this.#initializeStates();
    }

    /**
     * Initialize default state transitions and behaviors
     * @private
     */
    #initializeStates() {
        // Initialize INIT state
        this.registerState(GameStates.INIT, {
            onEnter: () => console.log('Initializing game...'),
            onExit: () => console.log('Initialization complete'),
            allowedTransitions: new Set([GameStates.LOADING, GameStates.MENU])
        });

        // Initialize other states
        this.registerState(GameStates.LOADING, {
            onEnter: () => console.log('Loading game resources...'),
            onExit: () => console.log('Loading complete'),
            allowedTransitions: new Set([GameStates.MENU, GameStates.PLAYING])
        });

        // Add remaining state configurations...
    }

    /**
     * Register a new state with its transitions and behaviors
     * @param {string} state - State identifier
     * @param {StateTransition} config - State configuration
     * @throws {Error} If state is already registered
     */
    registerState(state, config) {
        if (this.#stateTransitions.has(state)) {
            throw new Error(`State ${state} is already registered`);
        }

        this.#stateTransitions.set(state, {
            onEnter: config.onEnter || (() => {}),
            onExit: config.onExit || (() => {}),
            allowedTransitions: config.allowedTransitions || new Set()
        });
    }

    /**
     * Transition to a new state
     * @param {string} newState - State to transition to
     * @returns {boolean} Success of state transition
     * @throws {Error} If transition is not allowed
     */
    transitionTo(newState) {
        if (!this.#stateTransitions.has(newState)) {
            throw new Error(`Invalid state: ${newState}`);
        }

        const currentTransitions = this.#stateTransitions.get(this.#currentState);
        if (!currentTransitions.allowedTransitions.has(newState)) {
            throw new Error(
                `Invalid transition: ${this.#currentState} -> ${newState}`
            );
        }

        try {
            // Execute exit actions for current state
            this.#stateTransitions.get(this.#currentState).onExit();
            
            // Update state
            const previousState = this.#currentState;
            this.#currentState = newState;
            
            // Execute enter actions for new state
            this.#stateTransitions.get(newState).onEnter();
            
            // Notify listeners
            this.#notifyStateChange(previousState, newState);
            
            return true;
        } catch (error) {
            console.error('State transition failed:', error);
            return false;
        }
    }

    /**
     * Add state change listener
     * @param {function} listener - Callback function
     */
    addStateChangeListener(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }
        this.#stateChangeListeners.push(listener);
    }

    /**
     * Remove state change listener
     * @param {function} listener - Callback function to remove
     */
    removeStateChangeListener(listener) {
        const index = this.#stateChangeListeners.indexOf(listener);
        if (index !== -1) {
            this.#stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners of state change
     * @private
     * @param {string} previousState - State transitioned from
     * @param {string} newState - State transitioned to
     */
    #notifyStateChange(previousState, newState) {
        this.#stateChangeListeners.forEach(listener => {
            try {
                listener(previousState, newState);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    }

    /**
     * Get current game state
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.#currentState;
    }

    /**
     * Check if transition to specified state is allowed
     * @param {string} state - State to check
     * @returns {boolean} Whether transition is allowed
     */
    canTransitionTo(state) {
        if (!this.#stateTransitions.has(this.#currentState)) {
            return false;
        }
        return this.#stateTransitions.get(this.#currentState)
            .allowedTransitions.has(state);
    }
}

// Export a singleton instance
export default new GameStateManager();