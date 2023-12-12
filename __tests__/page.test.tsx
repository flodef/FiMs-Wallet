// Generated by CodiumAI
import { getBarData } from '../app/utils';

describe('getBarData', () => {
  // Returns an object with properties 'name', 'amount', 'value', and 'color' when given valid input values for 'name' and 'amount'.
  it('should return an object with the correct properties when given valid input values', () => {
    const result = getBarData('Test', 10);
    expect(result).toEqual({
      name: 'Test',
      amount: 10,
      value: 10,
      color: 'green'
    });
  });

  // Sets the 'value' property to the absolute value of the 'amount' parameter.
  it('should set the value property to the absolute value of the amount parameter', () => {
    const result = getBarData('Test', -10);
    expect(result.value).toBe(10);
  });

  // Sets the 'color' property to 'red' if the 'amount' parameter is negative, and 'green' otherwise.
  it('should set the color property to red if the amount parameter is negative, and green otherwise', () => {
    const result1 = getBarData('Test', -10);
    expect(result1.color).toBe('red');

    const result2 = getBarData('Test', 10);
    expect(result2.color).toBe('green');
  });

  // Returns an object with properties 'name', 'amount', 'value', and 'color' when given a valid string for 'name' and a number for 'amount' that is equal to zero.
  it('should return an object with the correct properties when given a valid string for name and a number for amount that is equal to zero', () => {
    const result = getBarData('Test', 0);
    expect(result).toEqual({
      name: 'Test',
      amount: 0,
      value: 0,
      color: 'green'
    });
  });

  // Returns an object with properties 'name', 'amount', 'value', and 'color' when given a valid string for 'name' and a number for 'amount' that is equal to the maximum safe integer value.
  it('should return an object with the correct properties when given a valid string for name and a number for amount that is equal to the maximum safe integer value', () => {
    const result = getBarData('Test', Number.MAX_SAFE_INTEGER);
    expect(result).toEqual({
      name: 'Test',
      amount: Number.MAX_SAFE_INTEGER,
      value: Number.MAX_SAFE_INTEGER,
      color: 'green'
    });
  });

  // Returns an object with properties 'name', 'amount', 'value', and 'color' when given a valid string for 'name' and a number for 'amount' that is equal to the minimum safe integer value.
  it('should return an object with the correct properties when given a valid string for name and a number for amount that is equal to the minimum safe integer value', () => {
    const result = getBarData('Test', Number.MIN_SAFE_INTEGER);
    expect(result).toEqual({
      name: 'Test',
      amount: Number.MIN_SAFE_INTEGER,
      value: Math.abs(Number.MIN_SAFE_INTEGER),
      color: 'red'
    });
  });
});
