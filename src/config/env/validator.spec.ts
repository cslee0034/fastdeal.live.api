import { validationSchema } from './validator';

describe('validationSchema', () => {
  it('should be defined', () => {
    expect(validationSchema).toBeDefined();
  });

  it('should be an object', () => {
    expect(validationSchema).toBeInstanceOf(Object);
  });
});
