interface MediumItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: string[];
}

interface MediumResponse {
  status: string;
  items: MediumItem[];
  message?: string;
}

(function () {
  const API =
    'https://api.rss2json.com/v1/api.json' +
    '?rss_url=' + encodeURIComponent('https://medium.com/feed/@deepfrontier');

  function fmtDate(str: string): string {
    return new Date(str).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function firstImage(html: string): string | null {
    const m = html.match(/<img[^>]+src="(https:\/\/cdn-images[^"]+)"/);
    return m ? m[1] : null;
  }

  function plainText(html: string): string {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function tagsHtml(cats: string[], max: number): string {
    return (cats || [])
      .slice(0, max)
      .map((t) => '<span class="blog__tag">' + t + '</span>')
      .join('');
  }

  function buildCard(item: MediumItem): HTMLAnchorElement {
    const thumb = firstImage(item.content);
    const excerpt = plainText(item.content).slice(0, 200) + '…';

    const card = document.createElement('a');
    card.className = 'blog__card';
    card.href = item.link;
    card.target = '_blank';
    card.rel = 'noopener';
    card.innerHTML =
      (thumb
        ? '<img class="blog__card-thumb" src="' +
          thumb +
          '" alt="" loading="lazy">'
        : '<div class="blog__card-placeholder">' +
          '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' +
          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>') +
      '<div class="blog__card-body">' +
      '<div class="blog__card-tags">' +
      tagsHtml(item.categories, 3) +
      '</div>' +
      '<div class="blog__card-title">' +
      item.title +
      '</div>' +
      '<div class="blog__card-excerpt">' +
      excerpt +
      '</div>' +
      '<div class="blog__card-meta">' +
      '<span class="blog__card-date">' +
      fmtDate(item.pubDate) +
      '</span>' +
      '<span class="blog__card-arrow">Read →</span>' +
      '</div></div>';
    return card;
  }

  function render(items: MediumItem[]): void {
    const root = document.getElementById('blog-root') as HTMLElement | null;
    if (!root) return;
    root.innerHTML = '';

    if (!items.length) {
      root.innerHTML =
        '<div class="blog__state"><p>No articles yet — check back soon or visit ' +
        '<a href="https://medium.com/@deepfrontier" target="_blank" rel="noopener">Medium</a>.</p></div>';
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'blog__articles';
    wrap.innerHTML = '<div class="blog__grid" id="card-grid"></div>';
    root.appendChild(wrap);

    const grid = wrap.querySelector('#card-grid') as HTMLElement | null;
    if (grid) {
      items.forEach(function (item) {
        grid.appendChild(buildCard(item));
      });
    }
  }

  async function load(): Promise<void> {
    try {
      const res = await fetch(API);
      const data: MediumResponse = await res.json();
      if (data.status !== 'ok') throw new Error(data.message);
      render(data.items);
    } catch (_err) {
      const root = document.getElementById('blog-root') as HTMLElement | null;
      if (root) {
        root.innerHTML =
          '<div class="blog__state">' +
          "<p>Couldn't load articles right now.<br>Read the latest at " +
          '<a href="https://medium.com/@deepfrontier" target="_blank" rel="noopener">medium.com/@deepfrontier</a>.</p>' +
          '</div>';
      }
    }
  }

  load();
})();
