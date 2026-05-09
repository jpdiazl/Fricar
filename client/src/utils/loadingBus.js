let pendingRequests = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(pendingRequests));
}

export function startGlobalLoading() {
  pendingRequests += 1;
  emit();
}

export function stopGlobalLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emit();
}

export function subscribeGlobalLoading(listener) {
  listeners.add(listener);
  listener(pendingRequests);
  return () => listeners.delete(listener);
}
