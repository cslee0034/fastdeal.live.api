import { isDevEnv } from './is-dev-env';

describe('isDevEnv', () => {
  const originalEnv = process.env;

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return true when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevEnv()).toBe(true);
  });

  it('should return false when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production';
    expect(isDevEnv()).toBe(false);

    delete process.env.NODE_ENV;
    expect(isDevEnv()).toBe(false);
  });
});
