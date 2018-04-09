export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export type NotUndefined<T> = T extends undefined ? never : T;

export type Primitive = string | boolean | number | symbol;

export type Part<T> = {
  [P in keyof T]-?: {
    $resolve: <F extends T[P] | undefined = undefined>(
      fallback?: F
    ) => F extends undefined ? T[P] | undefined : NotUndefined<T[P]>;
  } & (T[P] extends Primitive ? {} : Part<T[P]>)
} & {
  [k: number]: {
    $resolve: <F extends T[any] | undefined = undefined>(
      fallback?: F
    ) => F extends undefined ? T[any] | undefined : NotUndefined<T[any]>;
  };
};

function isPrimitive(x: any): x is Primitive {
  return (
    typeof x === 'string' ||
    typeof x === 'boolean' ||
    typeof x === 'number' ||
    typeof x === 'symbol' ||
    x === null
  );
}

function isObject(x: any): x is object {
  return typeof x === 'object' && x !== null;
}

export default function partialize<T extends object>(x: T): Part<T> {
  return new Proxy(x, {
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
