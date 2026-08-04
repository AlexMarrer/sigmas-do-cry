// PostCSS owns vendor prefixing — never hand-prefix in SCSS.
// Targets come from "browserslist" in package.json (modern set, so oklch()
// and clamp() pass through untouched).
module.exports = {
  plugins: {
    'postcss-preset-env': {},
    autoprefixer: {},
  },
};
