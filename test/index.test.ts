import partialize, { RecursivePartial } from '../';

interface Something {
  str: string;
  obj: {
    foo: number;
    bar: boolean;
  };
  xyz: {
    abc: string;
  };
  arr: string[];
}

const something: RecursivePartial<Something> = {
  str: 'test',
  obj: {
    foo: 42
  },
  arr: ['a']
};

const o = partialize(something);

test('partialize', () => {
  expect(o.str.$resolve()).toEqual('test');
  expect(o.obj.foo.$resolve()).toEqual(42);
  expect(o.obj.bar.$resolve(false)).toEqual(false);
  expect(o.xyz.$resolve()).toBeUndefined();
  expect(o.xyz.abc.$resolve('test')).toEqual('test');
});

test('types', () => {
  const s1: string | undefined = o.str.$resolve();
  const s2: string = o.str.$resolve('fallback');
  expect(s1).toEqual('test');
  expect(s2).toEqual('test');
});
