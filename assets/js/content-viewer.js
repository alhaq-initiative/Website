/* global marked, DOMPurify */
'use strict';
/**
 * content-viewer.js
 * Loads assets/data/library-books.json, renders a numbered book shelf in #book-shelf,
 * renders type-grouped chapter shelves in #book-chapter-shelves, and opens a modal reader.
 */
(function () {
  var MANIFEST = 'assets/data/library-books.json';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function badge(text, cls) {
    return '<span class="cv-badge ' + cls + '">' + esc(text) + '</span>';
  }

  function statusBadge(s) {
    var map = {
      draft: 'cv-badge--amber',
      review: 'cv-badge--blue',
      published: 'cv-badge--green',
      ongoing: 'cv-badge--blue',
    };
    var val = String(s || 'draft');
    return badge(
      val.charAt(0).toUpperCase() + val.slice(1),
      map[val] || 'cv-badge--gray'
    );
  }

  function confidenceBadge(c) {
    if (!c) return '';
    var map = {
      low: 'cv-badge--red',
      medium: 'cv-badge--amber',
      high: 'cv-badge--green',
    };
    var val = String(c);
    return badge(
      'Confidence: ' + val.charAt(0).toUpperCase() + val.slice(1),
      map[val] || 'cv-badge--gray'
    );
  }

  function modal() {
    return document.getElementById('cv-modal');
  }
  function modalBody() {
    return document.getElementById('cv-modal-body');
  }
  function modalTitle() {
    return document.getElementById('cv-modal-title');
  }

  function stripFrontmatter(md) {
    return md.replace(/^\uFEFF/, '').replace(/^---[\s\S]*?---\s*\n/, '');
  }

  function stripLeadingH1(md) {
    return md.replace(/^#[^#][^\n]*\n/, '');
  }

  function processCallouts(html) {
    return html.replace(
      /<blockquote>\s*<p>\[!note\]([\s\S]*?)<\/blockquote>/gi,
      function (_, inner) {
        var cleaned = inner.replace(/<\/p>\s*$/, '').replace(/^\s*/, '');
        return '<div class="cv-callout cv-callout--note">' + cleaned + '</div>';
      }
    );
  }

  function renderMarkdown(raw) {
    var body = stripLeadingH1(stripFrontmatter(raw));
    if (!window.marked) return '<p class="cv-error">marked.js not loaded.</p>';
    var markedFn =
      typeof window.marked.parse === 'function'
        ? window.marked.parse
        : window.marked;
    var html = markedFn(body);
    html = processCallouts(html);
    if (window.DOMPurify) {
      html = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'p',
          'br',
          'strong',
          'em',
          'u',
          's',
          'del',
          'ul',
          'ol',
          'li',
          'blockquote',
          'pre',
          'code',
          'a',
          'img',
          'hr',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'div',
          'span',
          'sup',
          'sub',
          'input',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'class',
          'id',
          'type',
          'checked',
          'disabled',
          'target',
          'rel',
        ],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        FORCE_BODY: false,
      });
    }
    return html;
  }

  function openModal(title) {
    var m = modal();
    if (!m) return;
    modalTitle().textContent = title;
    modalBody().innerHTML = '<p class="cv-loading">Loading…</p>';
    m.classList.remove('cv-modal--hidden');
    m.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cv-no-scroll');
    var closeBtn = m.querySelector('.cv-modal__close');
    if (closeBtn)
      setTimeout(function () {
        closeBtn.focus();
      }, 50);
  }

  function closeModal() {
    var m = modal();
    if (!m) return;
    m.classList.add('cv-modal--hidden');
    m.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cv-no-scroll');
  }

  async function loadChapter(path, title) {
    openModal(title);
    try {
      var resp = await fetch(path);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var raw = await resp.text();
      modalBody().innerHTML =
        '<div class="cv-prose">' + renderMarkdown(raw) + '</div>';
    } catch (err) {
      modalBody().innerHTML =
        '<p class="cv-error">Could not load chapter: ' +
        esc(err.message) +
        '</p>';
    }
  }

  function renderBookCards(books, container) {
    container.innerHTML =
      '<div class="cv-book-grid">' +
      books
        .map(function (book) {
          var count = (book.episodes || []).length;
          var featuredClass = book.featured ? ' cv-book-card--featured' : '';
          return [
            '<article class="cv-book-card' +
              featuredClass +
              '" data-type="' +
              esc(book.type || '') +
              '">',
            book.featured
              ? '<p class="cv-book-card__featured-tag">Featured</p>'
              : '',
            '<p class="cv-book-card__num">Book ' +
              esc(String(book.book_number || '?').padStart(2, '0')) +
              '</p>',
            '<h3 class="cv-book-card__title">' +
              esc(book.title) +
              (book.subtitle
                ? ' <span class="cv-book-card__subtitle">' +
                  esc(book.subtitle) +
                  '</span>'
                : '') +
              '</h3>',
            '<p class="cv-book-card__desc">' +
              esc(book.description || '') +
              '</p>',
            '<div class="cv-book-card__meta">' +
              statusBadge(book.status || 'draft') +
              badge(
                count + ' chapter' + (count === 1 ? '' : 's'),
                'cv-badge--gray'
              ) +
              '</div>',
            (count
              ? '<a class="cv-book-card__link" href="#book-' +
                esc(book.key) +
                '">Open chapter shelf →</a>'
              : '<span class="cv-book-card__link cv-book-card__link--muted">Chapters coming soon</span>') +
              '\n',
            '</article>',
          ].join('');
        })
        .join('') +
      '</div>';
  }

  function renderCategorySections(categories, booksByKey, container) {
    container.innerHTML = categories
      .map(function (category) {
        var items = (category.books || [])
          .map(function (key) {
            return booksByKey[key];
          })
          .filter(Boolean);
        if (!items.length) return '';
        return [
          '<section class="cv-shelf-section" data-type="' +
            esc(category.key) +
            '">',
          '<div class="cv-shelf-section__head">',
          '<h3 class="cv-shelf-section__title">' +
            esc(category.title) +
            '</h3>',
          category.description
            ? '<p class="cv-series-desc">' + esc(category.description) + '</p>'
            : '',
          '</div>',
          items
            .map(function (book) {
              return [
                '<section id="book-' +
                  esc(book.key) +
                  '" class="cv-shelf-section cv-shelf-section--nested">',
                '<div class="cv-shelf-section__head">',
                '<h4 class="cv-shelf-section__title">Book ' +
                  esc(String(book.book_number || '?').padStart(2, '0')) +
                  ': ' +
                  esc(book.title) +
                  (book.subtitle
                    ? '<span class="cv-shelf-section__subtitle">' +
                      esc(book.subtitle) +
                      '</span>'
                    : '') +
                  '</h4>',
                '<p class="cv-series-desc">' +
                  esc(book.description || '') +
                  '</p>',
                '<p class="cv-series-author">By ' +
                  esc(book.author || '') +
                  '</p>',
                '</div>',
                renderBookEpisodes(book),
                '</section>',
              ].join('');
            })
            .join(''),
          '</section>',
        ].join('');
      })
      .join('');
  }

  function renderTypeFilters(types, shelf, shelves) {
    var filterBar = document.getElementById('cv-type-filters');
    if (!filterBar || types.length < 2) return;
    var allKey = '__all';
    var buttons = [
      '<button class="cv-filter-btn cv-filter-btn--active" data-type="' +
        allKey +
        '">All Books</button>',
    ];
    types.forEach(function (t) {
      buttons.push(
        '<button class="cv-filter-btn" data-type="' +
          esc(t.key) +
          '">' +
          esc(t.title) +
          '</button>'
      );
    });
    filterBar.innerHTML = buttons.join('');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.cv-filter-btn');
      if (!btn) return;
      var typeKey = btn.getAttribute('data-type');
      filterBar.querySelectorAll('.cv-filter-btn').forEach(function (b) {
        b.classList.remove('cv-filter-btn--active');
      });
      btn.classList.add('cv-filter-btn--active');
      // Filter shelf cards
      shelf.querySelectorAll('.cv-book-card').forEach(function (card) {
        var match =
          typeKey === allKey || card.getAttribute('data-type') === typeKey;
        card.style.display = match ? '' : 'none';
      });
      // Filter shelf sections
      shelves
        .querySelectorAll('.cv-shelf-section[data-type]')
        .forEach(function (sec) {
          var match =
            typeKey === allKey || sec.getAttribute('data-type') === typeKey;
          sec.style.display = match ? '' : 'none';
        });
    });
  }

  function renderBookEpisodes(book) {
    var episodes = (book.episodes || []).filter(function (e) {
      return e.status !== 'hidden';
    });
    if (!episodes.length) {
      return '<div class="cv-shelf-empty">No chapters have been published for this book yet. Research and writing is underway — check back soon.</div>';
    }
    return (
      '<div class="cv-episode-grid">' +
      episodes
        .map(function (ep) {
          var safeTitle = esc(ep.title);
          var safePath = esc(ep.path);
          var tags = (ep.tags || [])
            .map(function (t) {
              return '<span class="cv-tag">' + esc(t) + '</span>';
            })
            .join('');
          return [
            '<article class="cv-card">',
            '<div class="cv-card__header">',
            '<span class="cv-card__num">Chapter ' +
              (ep.story_number || '?') +
              '</span>',
            '<div class="cv-card__badges">' +
              statusBadge(ep.status || 'draft') +
              confidenceBadge(ep.historical_confidence) +
              '</div>',
            '</div>',
            '<p class="cv-card__title">' + safeTitle + '</p>',
            tags ? '<p class="cv-card__tags">' + tags + '</p>' : '',
            '<button class="cv-card__btn" data-path="' +
              safePath +
              '" data-title="' +
              safeTitle +
              '">Read Chapter →</button>',
            '</article>',
          ].join('');
        })
        .join('') +
      '</div>'
    );
  }

  function sortCategories(categoryMap) {
    return Object.keys(categoryMap || {})
      .map(function (key) {
        return categoryMap[key];
      })
      .sort(function (a, b) {
        return Number(a.order || 999) - Number(b.order || 999);
      });
  }
  function sortBooks(bookMap) {
    return Object.keys(bookMap || {})
      .map(function (key) {
        return bookMap[key];
      })
      .sort(function (a, b) {
        return Number(a.book_number || 999) - Number(b.book_number || 999);
      });
  }

  async function init() {
    var shelf = document.getElementById('book-shelf');
    var shelves = document.getElementById('book-chapter-shelves');
    if (!shelf || !shelves) return;

    var m = modal();
    if (m) {
      var closeBtn = m.querySelector('.cv-modal__close');
      var backdrop = m.querySelector('.cv-modal__backdrop');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (backdrop) backdrop.addEventListener('click', closeModal);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-path]');
      if (!btn) return;
      var path = btn.getAttribute('data-path');
      var title = btn.getAttribute('data-title') || 'Chapter';
      if (path && path.endsWith('.md')) {
        e.preventDefault();
        loadChapter(path, title);
      }
    });

    try {
      var resp = await fetch(MANIFEST);
      if (!resp.ok) throw new Error('Manifest HTTP ' + resp.status);
      var data = await resp.json();
      var books = sortBooks(data.books || {});
      var types = sortCategories(data.types || {});
      if (!books.length) throw new Error('No books found in manifest');
      renderBookCards(books, shelf);
      renderCategorySections(types, data.books || {}, shelves);
      renderTypeFilters(types, shelf, shelves);
    } catch (err) {
      shelf.innerHTML =
        '<p class="text-sm text-gray-500">Could not load book shelf: ' +
        esc(err.message) +
        '</p>';
      shelves.innerHTML = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
