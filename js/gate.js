// Entry gate. The scrapbook's photos, text and code are stored encrypted in
// vault/. The answer to the question is the key: nothing can be read without it.
// To rebuild the vault after editing the original files, see tools/encrypt.mjs.
(function () {
  var QUESTION = "What was the Roblox GC's name? (no caps)";

  var css =
    '#gate{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:24px 18px;overflow:auto;color:#F3EBDD;' +
      'background-color:#0A0818;background-image:radial-gradient(1.4px 1.4px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 82% 12%,#fff,transparent),radial-gradient(1.2px 1.2px at 30% 82%,#fff,transparent),radial-gradient(1px 1px at 70% 76%,#fff,transparent),radial-gradient(1.4px 1.4px at 92% 56%,#fff,transparent),radial-gradient(1px 1px at 8% 58%,#fff,transparent),radial-gradient(ellipse at 50% 0,#2B2A55 0,#15122E 55%,#0A0818 100%);' +
      'transition:opacity .8s ease,visibility .8s;font-family:"Cormorant Garamond",Georgia,serif}' +
    '#gate.gone{opacity:0;visibility:hidden;pointer-events:none}' +
    '#gate .g-in{max-width:560px;width:100%;text-align:center;margin:auto;animation:gfade .9s ease}' +
    '#gate h1{font-family:"Pinyon Script","Snell Roundhand","Brush Script MT",cursive;font-weight:400;font-size:clamp(40px,8vw,64px);margin:0 0 26px;line-height:1.15;color:#F6E7D3;text-shadow:0 0 30px rgba(220,200,255,.35)}' +
    '#gate .g-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}' +
    '#gate input{font:inherit;font-size:22px;padding:10px 16px;border:1px solid rgba(255,255,255,.3);border-radius:14px;background:rgba(255,255,255,.06);color:#F3EBDD;width:100%;max-width:340px;text-align:center}' +
    '#gate input::placeholder{color:rgba(243,235,221,.45)}' +
    '#gate button{font:inherit;font-size:22px;padding:8px 30px;border:1px solid #E6D2A8;border-radius:999px;background:transparent;color:#F6E7D3;cursor:pointer;transition:background .25s}' +
    '#gate button:hover,#gate button:focus-visible{background:rgba(255,255,255,.1)}' +
    '#gate button:disabled{opacity:.5;cursor:default}' +
    '#gate .g-err{min-height:1.5em;margin-top:14px;font-style:italic;font-size:20px;color:#E8A0AB}' +
    '#gate .g-msg{font-family:"Pinyon Script","Snell Roundhand","Brush Script MT",cursive;font-size:clamp(44px,9vw,72px);line-height:1.15;color:#F6E7D3;text-shadow:0 0 30px rgba(220,200,255,.35);margin:0 0 16px}' +
    '#gate .g-sub{font-style:italic;font-size:24px;color:#CBBFD6;margin:0 0 30px}' +
    '@keyframes gfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#gate,#gate .g-in{transition:none;animation:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var gate = document.createElement('div');
  gate.id = 'gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.innerHTML =
    '<form class="g-in">' +
      '<h1></h1>' +
      '<div class="g-row"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Your answer"></div>' +
      '<button type="submit">Enter</button>' +
      '<div class="g-err" aria-live="polite"></div>' +
    '</form>';
  gate.querySelector('h1').textContent = QUESTION;

  // Same rule as tools/encrypt.mjs: ignore capitals, spaces and punctuation.
  function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }

  function deriveKey(answer, meta) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(normalize(answer)), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(meta.salt), iterations: meta.iter, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      });
  }

  function fetchBin(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error('load ' + path);
      return r.arrayBuffer();
    });
  }

  // File layout: 12-byte IV, then AES-GCM ciphertext.
  function decrypt(key, buf) {
    var bytes = new Uint8Array(buf);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12));
  }

  function loadScript(code) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      s.onload = res; s.onerror = rej;
      document.body.appendChild(s);
    });
  }

  function unlock(key) {
    return fetchBin('vault/main.bin')
      .then(function (buf) { return decrypt(key, buf); })
      .then(function (plain) {
        var bundle = JSON.parse(new TextDecoder().decode(plain));
        var paths = Object.keys(bundle.files);
        return Promise.all(paths.map(function (p) {
          var f = bundle.files[p];
          return fetchBin('vault/' + f.f)
            .then(function (b) { return decrypt(key, b); })
            .then(function (d) { return [p, URL.createObjectURL(new Blob([d], { type: f.t }))]; });
        })).then(function (urls) {
          function swap(text) {
            urls.forEach(function (u) { text = text.split(u[0]).join(u[1]); });
            return text;
          }
          gate.insertAdjacentHTML('beforebegin', swap(bundle.page));
          return loadScript(swap(bundle.content))
            .then(function () { return loadScript(swap(bundle.script)); });
        });
      });
  }

  function mount() {
    document.body.appendChild(gate);
    document.documentElement.style.overflow = 'hidden';
    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var btn = gate.querySelector('button');
    var err = gate.querySelector('.g-err');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.value.trim()) return;
      btn.disabled = true;
      err.textContent = '';
      fetch('vault/meta.json').then(function (r) { return r.json(); })
        .then(function (meta) { return deriveKey(input.value, meta); })
        .then(function (key) {
          return fetchBin('vault/main.bin')
            .then(function (buf) { return decrypt(key, buf); })
            .then(function () { return key; }, function () { return null; });
        })
        .then(function (key) {
          if (!key) {
            err.textContent = "That's not quite it. Try again.";
            btn.disabled = false;
            return;
          }
          return unlock(key).then(showThanks);
        })
        .catch(function () {
          err.textContent = 'Something went wrong loading the page. Please refresh and try again.';
          btn.disabled = false;
        });
    });
  }

  function showThanks() {
    gate.innerHTML =
      '<div class="g-in">' +
        '<p class="g-msg">Thank you for the memories, and goodbye</p>' +
        '<p class="g-sub">I hope you revisit this website someday</p>' +
        '<button type="button">Continue</button>' +
      '</div>';
    var btn = gate.querySelector('button');
    btn.focus();
    btn.addEventListener('click', function () {
      gate.classList.add('gone');
      document.documentElement.style.overflow = '';
      setTimeout(function () { gate.remove(); }, 900);
    });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
