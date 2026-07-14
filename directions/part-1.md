# Part 1 — Confidence Monitor

## Goal

Get your trained Teachable Machine model running live in this page, with a confidence bar for
every class it knows about (Rock, Paper, Scissors, and Nothing).

By the end of this session you will **not** have a game yet — just a page that proves your model
works well enough to build a game on top of.

## Before you touch the code

1. Train an Image Project at [teachablemachine.withgoogle.com/train/image](https://teachablemachine.withgoogle.com/train/image)
  with four classes: `Rock`, `Paper`, `Scissors`, `Nothing`.
2. For each class, record samples with **variety**: different distances from the camera, different
  angles, different lighting if you can. A model trained on samples that all look the same (same spot, same lighting, same distance) will look great in Teachable Machine's own tester and then fall apart the moment you move.
3. Click **Export Model → Tensorflow.js → Download my model**. You'll get a `.zip` containing:
  - `model.json`
  - `metadata.json`
  - `weights.bin`
4. Unzip those three files into a folder named `model/` next to `script.js`, so your project looks like:
  ```
  part1/
    index.html
    style.css
    script.js
    model/
      model.json
      metadata.json
      weights.bin
   ```

## What you're writing

Open `script.js`. Everything is wired up except two functions, both marked `TODO`:

1. **`loadModel()`** — use `tmImage.load(MODEL_URL, METADATA_URL)` to load your model and store the
   result in the `model` variable.
2. **`predictionLoop()`** — call `model.predict(videoEl)`, pass the result to
   `renderConfidenceBars(...)` (already written for you), then schedule the next frame with
   `requestAnimationFrame(predictionLoop)`.
 
The `tmImage` object comes from the `<script>` tags already in `index.html` — you don't need to
import anything yourself.

Everything you need is linked in the comments inside `script.js`. Try writing it before looking
anything up — `model.predict()` returns an array shaped like:

```js
[
  { className: "Rock", probability: 0.83 },
  { className: "Paper", probability: 0.11 },
  { className: "Scissors", probability: 0.04 },
  { className: "Nothing", probability: 0.02 }
]
```

## Before moving on:

It's time to check your model! Try these tests:

- [ ] Hold up **Rock** — its bar reaches at least 70% and stays there for a couple of seconds
- [ ] Hold up **Paper** — same test
- [ ] Hold up **Scissors** — same test
- [ ] Move your hand out of frame entirely — **Nothing** becomes the highest bar

If any of those fail, that's not a bug in your code — it's a sign your model needs more (or more
varied) training samples for that class. Go back to Teachable Machine, add samples, retrain, and
re-export before moving on.

**Submit:** a screen recording (10–20 seconds) showing all four checks passing in order.

That recording is your ticket into Part 2 — you'll be building the actual game on top of whatever
model passes this test, so it's worth getting right now rather than fighting with a shaky model
later.
