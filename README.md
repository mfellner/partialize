# partialize

[![Travis](https://img.shields.io/travis/mfellner/partialize.svg)](travis-ci.org/mfellner/partialize)
[![Codecov](https://img.shields.io/codecov/c/github/mfellner/partialize.svg)](https://codecov.io/gh/mfellner/partialize)
[![codebeat](https://codebeat.co/badges/1c20b7a3-b782-4f84-ba00-d2ee99d198f8)](https://codebeat.co/projects/github-com-mfellner-partialize-master)
[![npm](https://img.shields.io/npm/v/@mfellner/partialize.svg)](https://www.npmjs.com/package/@mfellner/partialize)
[![license](https://img.shields.io/github/license/mfellner/partialize.svg)](https://choosealicense.com/licenses/mit)

Turn objects into typesafe proxies to access potentially undefined properties.

### Getting started

Let's say you download some unsafe data that should match a given interface:

```typescript
interface Something {
  foo?: {
    bar?: {
      str?: string;
    };
    baz?: {
      num?: number;
    };
  };
}

const data: Something = await fetch(url).then(r => r.json());
```

Some properties may be present but others may not!

```typescript
const str = data.foo!.bar!.str; // OK?
const num = data.foo!.baz!.num; // Error?
```

Use **partialize** to wrap an object in a typesafe [Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy):

```typescript
import partialize, { Part } from '@mfellner/partialize';

const some: Part<Something> = partialize(data);
```

Now all the declared properties of the object will definitely be defined! That's because each value is turned into an object with all the original properties of that value plus a special `$resolve()` function. In order to retrieve the original raw value you simply call `$resolve()`:

```typescript
const str: string | undefined = data.foo.bar.str.$resolve(); // without fallback
const str: string = data.foo.bar.str.$resolve('fallback'); //  with fallback
```

See [test/index.test.ts](test/index.test.ts) for some examples.
