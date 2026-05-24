/**
 * Type Mapper Tests
 */

import { TypeMapper } from '../../utils/type-mapper';

describe('TypeMapper', () => {
  let mapper: TypeMapper;

  beforeEach(() => {
    mapper = new TypeMapper();
  });

  test('should map string type', () => {
    const mapping = mapper.mapType('string');
    expect(mapping.tsType).toBe('string');
  });

  test('should map number type', () => {
    const mapping = mapper.mapType('number');
    expect(mapping.tsType).toBe('number');
  });

  test('should map boolean type', () => {
    const mapping = mapper.mapType('boolean');
    expect(mapping.tsType).toBe('boolean');
  });

  test('should infer string from variable name', () => {
    const mapping = mapper.mapType('text');
    expect(mapping.tsType).toBe('string');
  });

  test('should infer number from variable name', () => {
    const mapping = mapper.mapType('count');
    expect(mapping.tsType).toBe('number');
  });

  test('should infer boolean from variable name', () => {
    const mapping = mapper.mapType('isActive');
    expect(mapping.tsType).toBe('boolean');
  });

  test('should create interface definition', () => {
    const interfaceDef = mapper.createInterfaceDefinition('User', {
      name: 'string',
      age: 'number',
      isActive: 'boolean',
    });

    expect(interfaceDef).toContain('interface User');
    expect(interfaceDef).toContain('name: string');
    expect(interfaceDef).toContain('age: number');
    expect(interfaceDef).toContain('isActive: boolean');
  });

  test('should map multiple types', () => {
    const mappings = mapper.mapTypes(['string', 'number', 'boolean']);
    expect(mappings.length).toBe(3);
  });
});
