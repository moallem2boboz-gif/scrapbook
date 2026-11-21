OUR SCRAPBOOK (encrypted)

The photos, screenshots, letter and page content are stored encrypted in vault/.
They can only be opened by answering the question on the entry screen. Without the
answer, the files in this repo are unreadable, even to someone who downloads them.

WHAT'S HERE
  index.html      a small shell that only loads the entry screen
  js/gate.js      the entry screen: asks the question, decrypts and opens the scrapbook
  vault/          the encrypted scrapbook (photos, text, page code)
  css/, audio/    styles and songs (not private, so not encrypted)
  tools/encrypt.mjs   rebuilds vault/ from the original, unencrypted folder

CHANGING THE SCRAPBOOK
  1. Edit the ORIGINAL unencrypted folder (kept off GitHub, on your own computer).
  2. From this repo's folder, run:
       node tools/encrypt.mjs path/to/original-folder "the answer"
  3. Commit and push index.html and vault/.
  Never upload the original folder to GitHub.

The question text is set at the top of js/gate.js. Answers ignore capitals,
spaces and punctuation. The site must be opened through a web server or
GitHub Pages; double-clicking index.html will not unlock it.
