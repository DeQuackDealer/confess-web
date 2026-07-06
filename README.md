# Who's Riley's Crush?

A single static page with four buttons — Annie, Clare, Lucy, Other. Guess right (Annie) and it
reveals the answer; guess wrong and it says so, then sends you back for another try.

## Running it

It's one self-contained file — just open `index.html` in a browser, or serve it with anything
that can serve static files, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Running it on Google Colab

Open [`colab/RileysCrush_Colab.ipynb`](colab/RileysCrush_Colab.ipynb) in Google Colab and run the
cells top to bottom. It clones this repo, serves `index.html` with Python's built-in
`http.server`, and exposes it publicly with [localtunnel](https://github.com/localtunnel/localtunnel)
— the last cell prints a public `https://*.loca.lt` URL. First-time visitors to that URL see a
localtunnel interstitial page; that's expected, just click through it.

The last cell is safe to re-run any time (e.g. after pulling an update) — it automatically stops
the previous run first.

## Changing the answer or the names

Everything lives in `index.html`: the four names are the `data-name` attributes on the `.option`
buttons, and the correct answer is the `CORRECT_NAME` constant near the bottom of the file.
