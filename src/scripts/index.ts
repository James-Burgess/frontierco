(function () {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const status = document.getElementById('form-status') as HTMLElement | null;
  if (form && status) {
    form.addEventListener('submit', async function (this: HTMLFormElement, e: Event) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      });
      const data = await res.json();
      status.style.display = 'block';
      if (data.success) {
        status.style.color = 'var(--green, #4caf50)';
        status.textContent = "Message sent. We'll be in touch within 48 hours.";
        form.reset();
      } else {
        status.style.color = '#e05252';
        status.textContent = 'Something went wrong. Please email us directly at ops@deepfrontier.co.';
      }
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    });
  }

  const grid = document.querySelector('.destinations__grid') as HTMLElement | null;
  if (grid) {
    const first = document.getElementById('dest-kenya') as HTMLElement | null;
    const last = document.getElementById('dest-custom') as HTMLElement | null;
    if (first && last) {
      const optional = [...grid.querySelectorAll<HTMLElement>('.destinations__card')].filter(
        (c) => c !== first && c !== last
      );
      for (let i = optional.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optional[i], optional[j]] = [optional[j], optional[i]];
      }
      optional.slice(2).forEach((c) => c.remove());
      grid.prepend(first);
      optional.slice(0, 2).forEach((c) => grid.insertBefore(c, last));
      grid.appendChild(last);
    }
  }
})();
