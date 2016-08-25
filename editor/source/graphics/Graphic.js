/** Graphic: Base class for canvas-based interactive graphics */

export default class Graphic {
  /** To override: mouse event handler */
  onMouseDown(event) {
  }

  /** To override: mouse event handler */
  onMouseUp(event) {
  }

  /** To override: mouse event handler */
  onMouseMove(event) {
  }

  /** To override: canvas drawing commands */
  render(ctx) {
  }
}
