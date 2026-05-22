/**
 * MSW Node server — imported by setup.js so every jsdom test file
 * gets the same network-interception lifecycle without any per-file boilerplate.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);
