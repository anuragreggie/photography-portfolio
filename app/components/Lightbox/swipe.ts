interface TouchPoint {
  identifier: number;
  clientX: number;
  clientY: number;
}

// A short, predominantly horizontal, single-finger gesture changes one photo.
// Keep pinches, vertical scrolling, long presses, and zoomed panning native.
export class SwipeGesture {
  private startPoint: (TouchPoint & { time: number }) | null = null;

  start(touches: readonly TouchPoint[], time: number, scale = 1) {
    this.cancel();
    if (touches.length === 1 && scale <= 1) {
      const { identifier, clientX, clientY } = touches[0];
      this.startPoint = { identifier, clientX, clientY, time };
    }
  }

  move(touches: readonly TouchPoint[], scale = 1) {
    const start = this.startPoint;
    if (!start) return;
    const point = touches[0];
    if (
      touches.length !== 1 ||
      point.identifier !== start.identifier ||
      scale > 1
    ) {
      this.cancel();
      return;
    }
    const dx = Math.abs(point.clientX - start.clientX);
    const dy = Math.abs(point.clientY - start.clientY);
    if (dy > 12 && dy > dx) this.cancel();
  }

  end(
    changedTouches: readonly TouchPoint[],
    remainingTouches: number,
    time: number,
    scale = 1
  ) {
    const start = this.startPoint;
    this.cancel();
    if (
      !start ||
      remainingTouches !== 0 ||
      scale > 1 ||
      time - start.time > 800
    )
      return null;
    const point = changedTouches.find(
      (touch) => touch.identifier === start.identifier
    );
    if (!point) return null;
    const dx = point.clientX - start.clientX;
    const dy = point.clientY - start.clientY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return null;
    return dx < 0 ? 'next' : 'previous';
  }

  cancel() {
    this.startPoint = null;
  }
}
