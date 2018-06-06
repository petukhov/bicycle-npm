const { getPackageDeclarations } = require('../src/utils');

test('getPackageDeclarations works', () => {
  expect(getPackageDeclarations({ abc: '123', xyz: '654' })).toEqual([
    { name: 'abc', version: '123' },
    { name: 'xyz', version: '654' }
  ]);
});
