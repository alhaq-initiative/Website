# Book 02 — The Chronicles of the Faith Sellers (بائعي القدر)

Long-term translation and cross-referencing project on the history of Sultan
Ṣalāḥ ad-Dīn al-Ayyūbī, validated against contemporary Arabic chroniclers
(Ibn Shaddād, Ibn al-Athīr, Ibn Khallikān).

Authored personally by **Afrasyaab Meranai (Habibur Rahman)** as part of the
Al-Haq Initiative. This folder is the **canonical source** for the chapters
that the website renders.

## Layout

```
02_Chronicles_of_the_Faith_Sellers/
├── README.md                     ← this file
├── series.json                   ← book metadata for the site manifest
├── 01_Chapters/                  ← working chapter files (draft workspace)
│   └── episode-01-…md
├── 02_Full_Book/                 ← clean stitched full-book English read
│   └── Chronicles_of_the_Faith_Sellers_Full_Translation.md
└── assets/                       ← per-chapter image folders, slug-named
  └── episode-01-…/
    └── *.png|*.jpg|…
```

## Authoring workflow

1. **Draft in Notion.** Each chapter is one page in the _Faith Sellers_ Notion
   database, with these properties:
   - `Status` — Draft | Review | Published
   - `Story Number` — integer, used for chapter ordering
   - `Historical Confidence` — Low | Medium | High
   - `Source Type` — short label (e.g. "Pashto translation", "Mixed narrative")
   - `Tags` — comma-separated
2. **Export from Notion.** Right-click the page → _Export_ → _Markdown & CSV_
   (include subpages = off, include content = current view). Notion produces a
   `.md` file (and, if the page has images, a sibling folder of the same name).
3. **Import into the repo:**
   ```powershell
   npm run library:import -- "C:\path\to\Notion Export Name 8729a07f….md"
   ```
   This runs `scripts/normalise-notion-md.mjs`, which:
   - Parses the H1 and the Notion property block.
   - Emits real YAML frontmatter (`title`, `slug`, `series`, `story_number`,
     `status`, `historical_confidence`, `source_type`, `tags`, `source`,
     `last_imported`).
   - Converts `<aside>` callouts into Markdown blockquotes.
   - Copies any sibling asset folder into `assets/library/books/translations/02_Chronicles_of_the_Faith_Sellers/assets/<slug>/`
     and rewrites image links to repo-absolute paths.
   - Strips Notion's 32-hex UUID suffix from the filename and writes the cleaned
     file as `01_Chapters/episode-NN-<slug>.md`.
4. **Review the diff** and commit the normalised file (and any copied assets).
   Do **not** edit the file with the UUID in the name; that's only the import
   source. The committed `01_Chapters/episode-NN-….md` is the source of truth from
   this point forward.

## Hard rules

- The committed Markdown in `01_Chapters/` is canonical for the chapter workspace. The Notion page is a
  drafting workspace, **not** the source of truth.
- The clean uninterrupted English manuscript belongs in `02_Full_Book/`.
- Never wire Notion into the site build at runtime. The website must remain
  buildable offline from this folder alone.
- Keep filenames stable. Once a chapter is committed under
  `episode-NN-<slug>.md`, do not rename it without also updating any references
  in `library.html` and the content manifest.
- Image filenames: keep whatever Notion produced. The normaliser only rewrites
  the folder path, not the file basename, so re-imports of the same page remain
  stable.

## Re-importing a chapter

If you've revised the Notion page and want to re-pull it:

```powershell
npm run library:import -- "C:\path\to\…md" --force
```

`--force` overwrites the existing `01_Chapters/episode-NN-….md`. Review the diff
carefully — anything you hand-edited in the repo will be lost.

## Attribution

Authored by **Afrasyaab Meranai (Habibur Rahman)**.
Delivered via the Al-Haq Initiative under **Al-Haq Studio**
(_Al-Haq Digital Services & Solutions_ — UK sole trader).
