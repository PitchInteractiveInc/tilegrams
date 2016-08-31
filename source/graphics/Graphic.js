/** Graphic: Base class for canvas-based interactive graphics */

export default class Graphic {
  /** To override: mouse event handler */
  onMouseDown(event) { // eslint-disable-line no-unused-vars
  }

  /** To override: mouse event handler */
  onMouseUp(event) { // eslint-disable-line no-unused-vars
  }

  /** To override: mouse event handler */
  onMouseMove(event) { // eslint-disable-line no-unused-vars
  }

  /** To override: canvas drawing commands */
  render(ctx) { // eslint-disable-line no-unused-vars
  }
}
