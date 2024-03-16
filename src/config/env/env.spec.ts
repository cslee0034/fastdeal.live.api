import { env } from './env';

describe('env', () => {
  it('should be defined', () => {
    expect(env).toBeDefined();
  });

  it('should be a function', () => {
    expect(env).toBeInstanceOf(Function);
  });

  it('should return object', () => {
    expect(env()).toEqual(expect.any(Object));
  });
});
