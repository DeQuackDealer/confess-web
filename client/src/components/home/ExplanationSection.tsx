export function ExplanationSection() {
  return (
    <section className="glass-panel p-5 text-sm leading-relaxed text-slate-300">
      <h2 className="mb-2 text-base font-semibold text-slate-100">What is this?</h2>
      <p className="mb-3">
        In 2001, mathematician Jeff Tupper described a single inequality that can render{' '}
        <em>any</em> possible 106×17 pixel image, depending only on the value of one enormous
        constant, k:
      </p>
      <pre className="mb-3 overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-xs text-accent-purple/90">
        {'1/2 < floor(mod(floor(y/17) · 2^(-17·floor(x) - mod(floor(y),17)), 2))'}
      </pre>
      <p className="mb-3">
        Plot every point where this inequality holds for 0 ≤ x &lt; 106 and k ≤ y ≤ k+16, and you
        get a bitmap. The trick is that k directly encodes the picture: each of its bits corresponds
        to exactly one pixel. So instead of computing a picture <em>from</em> a formula, you can go
        backwards — pick any picture you like, and there exists a k (usually a very, very large
        number) whose bitmap is exactly that picture. That's the "self-referential" part: the
        formula can be made to plot an image of itself, or of anything else.
      </p>
      <p>
        Rileys Crush Thingy lets you go both directions: paste a huge integer to see the picture hidden
        inside it, or draw a picture in <strong>Bitmap Studio</strong> to get the integer that
        produces it.
      </p>
    </section>
  );
}
