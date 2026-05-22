/**
 * Vitest global setup — runs before every test file.
 * Mocks browser APIs that App.jsx relies on but jsdom doesn't provide natively.
 *
 * The `@vitest-environment node` API tests also pull in this file, so every
 * mock here is guarded by `typeof window !== 'undefined'` / `typeof localStorage
 * !== 'undefined'` to avoid crashes in the Node environment.
 */
import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// ── AudioContext (jsdom only) ─────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  class MockAudioNode {
    connect = vi.fn();
  }
  class MockGainNode extends MockAudioNode {
    gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  }
  class MockBiquadFilterNode extends MockAudioNode {
    type = '';
    Q = { value: 0 };
    frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  }
  class MockOscillatorNode extends MockAudioNode {
    type = 'sine';
    frequency = { value: 440 };
    start = vi.fn();
    stop = vi.fn();
  }
  class MockBufferSourceNode extends MockAudioNode {
    buffer = null;
    start = vi.fn();
    stop = vi.fn();
  }
  class MockAudioBuffer {
    getChannelData = () => new Float32Array(128);
  }
  class MockAudioContext {
    state = 'running';
    sampleRate = 44100;
    currentTime = 0;
    destination = new MockAudioNode();
    createBuffer = () => new MockAudioBuffer();
    createBufferSource = () => new MockBufferSourceNode();
    createBiquadFilter = () => new MockBiquadFilterNode();
    createGain = () => new MockGainNode();
    createOscillator = () => new MockOscillatorNode();
    resume = () => Promise.resolve();
  }

  vi.stubGlobal('AudioContext', MockAudioContext);
  vi.stubGlobal('webkitAudioContext', MockAudioContext);

  // ── navigator.vibrate ───────────────────────────────────────────────────────
  Object.defineProperty(navigator, 'vibrate', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });

  // ── navigator.clipboard ─────────────────────────────────────────────────────
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    configurable: true,
    writable: true,
  });

  // ── window.matchMedia ───────────────────────────────────────────────────────
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    configurable: true,
    writable: true,
  });
}

// ── localStorage — wipe before every test (jsdom only) ───────────────────────
if (typeof localStorage !== 'undefined') {
  beforeEach(() => {
    localStorage.clear();
  });
}
