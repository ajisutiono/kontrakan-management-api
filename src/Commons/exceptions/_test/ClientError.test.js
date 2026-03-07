
import { describe, it, expect } from 'vitest';

import ClientError from '../ClientError.js';

describe('ClientError', () => {
  it('should throw error when directly instantiated (abstract class)', () => {
    expect(() => new ClientError('message')).toThrowError('cannot instantiate abstract class');
  });

  it('should be a subclass of Error', () => {
    class TestSubclass extends ClientError {}
    const instance = new TestSubclass('message');
    
    expect(instance).toBeInstanceOf(ClientError);
    expect(instance).toBeInstanceOf(Error);
  });
});