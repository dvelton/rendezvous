export function hasConverged(comments) {
  if (comments.length < 2) return false;
  const last = comments[comments.length - 1].body;
  const secondLast = comments[comments.length - 2].body;
  return last.includes('[AGREED]') && secondLast.includes('[AGREED]');
}

export function roundCount(comments) {
  return Math.floor(comments.length / 2);
}
