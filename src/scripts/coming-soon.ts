(function () {
  const img = document.getElementById('csmark') as HTMLImageElement | null;
  if (!img) return;
  function fallback(): void {
    img.style.display = 'none';
    const fallbackEl = document.getElementById('csfallback') as HTMLElement | null;
    if (fallbackEl) fallbackEl.style.display = 'block';
  }
  if (img.complete && img.naturalWidth === 0) fallback();
  img.addEventListener('error', fallback);
})();
