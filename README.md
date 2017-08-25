# Reselectie

Memoized selector library for any immutable data structure (such as a `redux` immutable store).
This library serves as a smaller, faster alternative to `reselect` AND `re-reselect`.

As with `reselect` (for which `memoize` function shares an interface):

* Selectors can compute derived data, allowing Redux to store the minimal possible state.
* Selectors are efficient. A selector is not recomputed unless one of its arguments change.
* Selectors are composable. They can be used as input to other selectors.

### `memoize`

```js
import { memoize, memoizeAs } from 'reselectie';

const shopItemsSelector = state => state.shop.items;
const taxPercentSelector = state => state.shop.taxPercent;

const subtotalSelector = memoize(
  shopItemsSelector,
  items => items.reduce((acc, item) => acc + item.value, 0)
);

const taxSelector = memoize(
  subtotalSelector,
  taxPercentSelector,
  // The last function provided is passed in is the "compute" functionality.
  // This is only called if any of the previous selector's values changed from
  // the last invocation.
  // The arguments passed in are the returned values (in order) of the previous
  // selectors.
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
);

const totalSelector = memoize(
  subtotalSelector,
  taxSelector,
  (subtotal, tax) => ({ total: subtotal + tax })
);

const exampleState = {
  shop: {
    taxPercent: 8,
    items: [
      { name: 'apple', value: 1.20 },
      { name: 'orange', value: 0.95 },
    ]
  }
};

console.log(subtotalSelector(exampleState)); // 2.15
console.log(taxSelector(exampleState));      // 0.172
console.log(totalSelector(exampleState));    // { total: 2.322 }
```


### `memoizeAs`

There are many cases where we want to provide a key identifier or conditional
that triggers a recompute that should be memoized in the context of that key.
An example of this might be that I have a list of items and column headers
capable of sorting the data. If I provide the column name as a key, the sort
could be memoized in the context of the key. If I were to sort by `Column A`, then
`Column B`, at this point both `A` and `B` would be memoized to avoid unecessary recomputes.

```js
const getItems = state => state.items;

const getSortedItems = memoizeAs(
  // Whatever we use as a key for `memoizeAs` is tacked on the selector arguments
  // as the last value. In this case, the `column` property that is here as the
  // final argument is the key we're using to identify a table column to sort by.
  (state, column) => getItems(items),
  (items, column) => _.sortBy(items, column)
);


// Usage:
// The first function call is to pass in the key under which we're memoizing.
// The function returned is the normal selector expecting state.
getSortedItems('date')(exampleState);

// The pattern is extremely useful for dynamic keys, but also offers a good
// mechanism by which to define non-dynamic variants of a selector.
// For example:
const sortedByDate = getSortedItems('date');
const sortedByAge = getSortedItems('age');

sortedByDate(exampleState);
sortedByAge(exampleState);
sortedByDate(exampleState); // Memoized response.
```

This functionality is similar to what is offered in the `re-reselect` libary, but
with a different interface (and less code). Another benefit over `re-reselect`
is that the key is kept on an `ES6` map, allowing a key of any value type. If the
provided key is a function, the function will be called and passed in state,
whose returned value will be used as the map key.


### `memoizeHandlerAs`

This is less likely to be used, but works very much like `memoizeAs` in that it
allows a key to be provided that is passed into a closure capable of maintaining
state in the context of that key. `memoizeAs` internally uses `memoizeHandlerAs`
to wrap the provided selectors in a way that they accept the memoized key.

You can use this if you feel as though you need finer control of what happens
in the keyed context rather than just executing selectors.
