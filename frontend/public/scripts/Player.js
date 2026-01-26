/**
 *
 *
 * @class Player
 */
class Player {
    /**
     * Creates an instance of Player.
     * @param {string} id
     * @param {string} username
     * @param {string} color
     * @memberof Player
     */
    constructor(id, username, color) {
        this.id = id;
        this.username = username;
        this.color = color || "yellow";
    }
}

export default Player;