# Novel Reader

English novel reading with word and sentence translation, a vocabulary notebook, generated practice quizzes, reading history and optional WebDAV sync.

## Where to find it

Open the **Reading** entry in the left sidebar. The plugin opens a full-page library with five tabs: **Library**, **Vocabulary**, **Practice**, **History** and **Settings**.

## What it does

- Import DRM-free **EPUB**, **TXT** and **Markdown** novels. Titles, authors, covers and chapter lists are extracted automatically. Markdown emphasis, block quotes, lists, links, code and horizontal rules are rendered in the reader.
- Read chapter by chapter with adjustable type size, line height, width and reading theme. Reading position is restored per book.
- Select a word, right-click and choose **Look up** to query the UAPI English dictionary (phonetics, Chinese and English definitions, examples). Select a sentence, right-click and choose **Translate sentence** to translate it; a single word can also be translated from its menu.
- Save words or phrases to the vocabulary notebook together with the exact sentence, book and chapter where they appeared.
- Review vocabulary with a simplified SM-2 schedule and generate quizzes from a chosen scope: English→Chinese, Chinese→English, cloze, spelling and context questions. Quizzes use the current model when available and fall back to a local generator.
- Track reading sessions, lookups and quiz attempts in **History**.
- Optionally sync books, vocabulary, reading progress and history over **WebDAV** (Basic Auth over HTTPS). Importing a book, leaving the reader, saving vocabulary or saving reading progress schedules a sync; a 5-minute periodic option and a manual **Sync now** button are also available. The password is stored through the harness credential service, not in the data file.

## Data and limitations

All data is stored under `$DSH_HOME/novel-reader`. No data leaves the machine unless you configure WebDAV or use the translation/model services already configured in DeepSeek Harness.

DRM-protected ebooks (including Kindle AZW3 and Adobe DRM EPUB) and PDF import are not supported. Anonymous translation endpoints are third-party services and may rate-limit or change.
