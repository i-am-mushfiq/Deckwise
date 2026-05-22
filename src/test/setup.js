/**
 * Vitest global setup — runs before every test file.
 *
 * Browser-API mocks (AudioContext, vibrate, clipboard, matchMedia) are guarded
 * by `typeof window !== 'undefined'` so this file is safe to import in both
 * jsdom tests AND `@vitest-environment node` API tests.
 *
 * MSW lifecycle hooks are similarly guarded: they only apply in jsdom tests.
 * The node-env API tests mock `fetch` directly and don't need MSW.
 */
import '@testing-library/jest-dom';
import { vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { server } from './server.js';

// ── MSW server lifecycle (jsdom only) ────────────────────────────────────────
// Intercepts fetch at the network level so tests exercise the real
// component → fetch → response → state-update pipeline.
if (typeof window !== 'undefined') {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

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
    // Use vi.fn() so tests can spy on AudioContext method calls
    createBuffer    = vi.fn(() => new MockAudioBuffer());
    createBufferSource = vi.fn(() => new MockBufferSourceNode());
    createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
    createGain      = vi.fn(() => new MockGainNode());
    createOscillator = vi.fn(() => new MockOscillatorNode());
    resume          = vi.fn(() => Promise.resolve());
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
      readText:  vi.fn().mockResolvedValue(''),
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
      addListener:    vi.fn(),
      removeListener: vi.fn(),
      addEventListener:    vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent:  vi.fn(),
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
