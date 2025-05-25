// Jest global type definitions for TypeScript
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInRange(min: number, max: number): R;
    }
  }
}

export {}; 