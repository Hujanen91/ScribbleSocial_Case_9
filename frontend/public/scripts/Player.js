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
        // create a random color for new players:
        this.color = color || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     *
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @memberof Player
     */
    drawStart(canvas, ctx, point) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.moveTo(point.x, point.y);
    }

    /**
     *
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @memberof Player
     */
    draw(canvas, ctx, point) {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    /**
     *
     *
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @memberof Player
     */
    drawEnd(canvas, ctx) {
        ctx.closePath();
    }
}

export default Player;