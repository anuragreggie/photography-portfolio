/** One-shot photo entrances. Images remain visible without animation support. */
export function observeGalleryReveals(
  elements: readonly HTMLElement[],
  root?: HTMLElement
) {
  if (
    typeof IntersectionObserver === 'undefined' ||
    typeof Element.prototype.animate !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return () => {};

  const running = new Map<HTMLElement, Animation>();
  const waiting = new Map<HTMLElement, () => void>();
  const pending = new Set<HTMLElement>();
  const known = new WeakSet<HTMLElement>();
  const initialized = new WeakSet<HTMLElement>();
  let disposed = false;

  function animate(element: HTMLElement) {
    if (
      disposed ||
      element.isConnected === false ||
      element.contains(document.activeElement)
    )
      return;
    const animation = element.animate(
      [
        { opacity: 0.45, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    running.set(element, animation);
    animation.onfinish = () => {
      running.delete(element);
      animation.cancel();
    };
    animation.oncancel = () => running.delete(element);
  }

  function revealWhenLoaded(element: HTMLElement) {
    const image = element.querySelector('img');
    if (!image || (image.complete && image.naturalWidth > 0)) {
      animate(element);
      return;
    }
    if (image.complete) return; // Broken images should not animate.
    function clear() {
      image!.removeEventListener('load', loaded);
      image!.removeEventListener('error', clear);
      waiting.delete(element);
    }
    function loaded() {
      clear();
      if (disposed || element.isConnected === false) return;
      // A slow image may have left the viewport by the time it arrives.
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0)
        animate(element);
    }
    waiting.set(element, clear);
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', clear, { once: true });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!pending.has(element)) continue;
        if (!initialized.has(element)) {
          initialized.add(element);
          // Keep initial/restored content still. Newly entering photos animate.
          if (entry.boundingClientRect.top < window.innerHeight) {
            pending.delete(element);
            observer.unobserve(element);
            continue;
          }
        }
        if (!entry.isIntersecting) continue;
        pending.delete(element);
        observer.unobserve(element);
        if (
          entry.boundingClientRect.top < 0 ||
          element.contains(document.activeElement)
        )
          continue;
        revealWhenLoaded(element);
      }
    },
    { rootMargin: '0px 0px -64px 0px', threshold: 0 }
  );

  function register(targets: readonly HTMLElement[]) {
    for (const element of targets) {
      if (known.has(element)) continue;
      known.add(element);
      pending.add(element);
      observer.observe(element);
    }
  }
  register(elements);

  // Photo-album rows can mount/reflow after its width measurement. Register new
  // buttons when the DOM changes, rather than querying once before they exist.
  const mutations =
    root && typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => {
          register(
            Array.from(
              root.querySelectorAll<HTMLElement>('[data-gallery-reveal]')
            )
          );
          for (const element of pending) {
            if (!element.isConnected) {
              pending.delete(element);
              observer.unobserve(element);
            }
          }
          for (const [element, clear] of waiting)
            if (!element.isConnected) clear();
          for (const [element, animation] of running)
            if (!element.isConnected) animation.cancel();
        })
      : undefined;
  if (root) mutations?.observe(root, { childList: true, subtree: true });

  function finishFocused(event: FocusEvent) {
    if (!(event.target instanceof Node)) return;
    for (const [element, animation] of running)
      if (element.contains(event.target)) animation.cancel();
    for (const [element, clear] of waiting)
      if (element.contains(event.target)) clear();
  }
  document.addEventListener('focusin', finishFocused);

  return () => {
    disposed = true;
    observer.disconnect();
    mutations?.disconnect();
    pending.clear();
    document.removeEventListener('focusin', finishFocused);
    for (const clear of waiting.values()) clear();
    for (const animation of running.values()) animation.cancel();
    running.clear();
  };
}
