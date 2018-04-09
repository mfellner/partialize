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
  arr: Array<{ x: string }>;
}

const something: RecursivePartial<Something> = {
  str: 'test',
  obj: {
    foo: 42
  },
  arr: [{ x: 'x' }]
};

const o = partialize(something);

test('partialize', () => {
  expect(o.str.$resolve()).toEqual('test');
  expect(o.obj.foo.$resolve()).toEqual(42);
  expect(o.obj.bar.$resolve(false)).toEqual(false);
  expect(o.xyz.$resolve()).toBeUndefined();
  expect(o.xyz.abc.$resolve('test')).toEqual('test');
  expect(o.arr[0].$resolve()).toEqual({ x: 'x' });
});

test('types', () => {
  const s1: string | undefined = o.str.$resolve();
  const s2: string = o.str.$resolve('fallback');
  expect(s1).toEqual('test');
  expect(s2).toEqual('test');
});

test('array of strings', () => {
  const strings: string[] = ['a', 'b', 'c'];
  const a = partialize(strings);

  const b: string = a[1].$resolve('');
  expect(b).toEqual('b');

  const d: string = a[3].$resolve('d');
  expect(d).toEqual('d');
});

test('array of objects', () => {
  const objects: Array<{ foo: string }> = [{ foo: 'bar' }];
  const a = partialize(objects);

  const bar: string = a[0].$resolve()!.foo;
  expect(bar).toEqual('bar');

  const baz: string = a[1].$resolve({ foo: 'baz' }).foo;
  expect(baz).toEqual('baz');
});
