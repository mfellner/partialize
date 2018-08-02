export type RecursivePartial<T> = T extends any[]
  ? RecursiveArrayPartial<T[number]>
  : RecursiveObjectPartial<T>;
export type RecursiveObjectPartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
export type RecursiveArrayPartial<T> = Array<RecursiveObjectPartial<T>>;

export type NotUndefined<T> = T extends undefined ? never : T;

export type Primitive = string | boolean | number | symbol;

export type Part<T> = T extends any[] ? ArrayPart<T[number]> : ObjectPart<T>;

// ArrayPart needs to be and interface because type aliases cannot be circular.
export interface ArrayPart<T>
  extends Array<
      {
        $resolve: <F extends T | undefined = undefined>(
          fallback?: F
        ) => F extends undefined ? T | undefined : NotUndefined<T>;
      } & Part<T>
    > {}

export type ObjectPart<T> = {
  [P in keyof T]-?: {
    $resolve: <F extends T[P] | undefined = undefined>(
      fallback?: F
    ) => F extends undefined ? T[P] | undefined : NotUndefined<T[P]>;
  } & (T[P] extends Primitive ? {} : Part<T[P]>)
};

function isPrimitive(x: unknown): x is Primitive {
  return (
    typeof x === 'string' ||
    typeof x === 'boolean' ||
    typeof x === 'number' ||
    typeof x === 'symbol' ||
    x === null
  );
}

function isObject(x: unknown): x is object {
  return x instanceof Object;
}

export default function partialize<T extends object>(x: T | undefined): Part<T> {
  return new Proxy(x || {}, {
    get: (target: T, p: keyof T, _) => {
      if (p === '$resolve') {
        return target[p];
      }
      const v = target[p];
      if (typeof v === 'undefined') {
        return partialize({
          $resolve: (fallback?: T[keyof T]) => fallback
        });
      }
      if (isPrimitive(v)) {
        return {
          $resolve: () => v
        };
      }
      let clone: any;
      if (Array.isArray(v)) {
        clone = Object.assign([], v);
      } else if (isObject(x)) {
        clone = Object.assign({}, v);
      } else {
        clone = v;
      }
      clone.$resolve = () => v;
      return partialize(clone);
    }
  }) as Part<T>;
}
