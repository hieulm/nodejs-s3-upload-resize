const phi = (1 + Math.sqrt(5)) / 2;

const fib = n => {
  return Math.floor((Math.pow(phi, n) - Math.pow(1 - phi, n)) / Math.sqrt(5));
};

describe('Test Fibonnaci function', () => {
  it('fib(1) should be 1', () => {
    expect(fib(1)).toEqual(1);
  });

  it('fib(10) should be 1', () => {
    expect(fib(10)).toEqual(55);
  });

  it('fib(20) should be 6765', () =>{
    expect(fib(20)).toEqual(6765)
  })
});
