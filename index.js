const memoize = (...selectors) => {
  const compute = selectors.pop();
  // If no initial selector is provided other than compute, assume we just
  // want to memoize on state
  if (!selectors.length) selectors.push(state => state);
  let previousSelectorResults = [];
  let previousComputeResult;

  const len = selectors.length;
  
  return function() {
    const current = [];
    let unchanged = true;
    for (let i = 0; i < len; i++) {
      ((current[i] = selectors[i].apply(null, arguments)) !== previousSelectorResults[i]) && (unchanged = false)
    }

    previousSelectorResults = current;
    if (unchanged) return previousComputeResult;
    return previousComputeResult = compute.apply(null, current);
  }
};


const memoizeHandlerAs = (handler) => {
  const keyed = new Map();

  return (key) => (state) => {
    if (key && (typeof(key) === 'function')) key = key(state);
    if (!keyed.has(key)) keyed.set(key, handler(key));
    
    return keyed.get(key)(state);
  }
};


const memoizeAs = (...selectors) => {
  return memoizeHandlerAs(key => {
    selectors = selectors.map(selector => (...args) => selector(...args, key));
    return memoize(...selectors);
  });
};


module.exports = Object.freeze({
  memoize,
  memoizeHandlerAs,
  memoizeAs
});
