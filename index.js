'use strict';

module.exports = Object.freeze({
  serial: (...selectors) => {
    const previous = [];
    const len = selectors.length;
    return (state) => {
      let current = state;
      for (let i = 0; i <= len; i++) {
        const previousReference = previous[i];
        previous[i] = current;
        if (current === previousReference) break;
        if (i !== len) current = selectors[i](current);
      }
      return previous[previous.length - 1];
    }
  },
  concurrent: (...selectors) => {
    const compute = selectors.pop();
    let previousSelectorResults = [];
    let previousComputeResult;
    
    return (state) => {
      const current = [];
      let all = true;
      selectors.forEach((selector, i) => ((current[i] = selector(state)) !== previousSelectorResults[i]) && (all = false));
      previousSelectorResults = current;
      if (all) return previousComputeResult;
      return previousComputeResult = compute(...current);
    }
  }
});
