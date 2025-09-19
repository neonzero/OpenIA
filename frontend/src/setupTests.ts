import '@testing-library/jest-dom';
import 'whatwg-fetch';

class ResizeObserverMock {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillRect: () => undefined,
    clearRect: () => undefined,
    getImageData: () => ({ data: new Uint8ClampedArray() }),
    putImageData: () => undefined,
    createImageData: () => ({ data: new Uint8ClampedArray() }),
    setTransform: () => undefined,
    drawImage: () => undefined,
    save: () => undefined,
    fillText: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    closePath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    clip: () => undefined,
    arc: () => undefined,
    quadraticCurveTo: () => undefined,
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    createPattern: () => undefined,
    createRadialGradient: () => ({ addColorStop: () => undefined }),
    rect: () => undefined,
    rotate: () => undefined,
    scale: () => undefined,
    translate: () => undefined,
    transform: () => undefined,
    setLineDash: () => undefined,
    getLineDash: () => []
  })
});
