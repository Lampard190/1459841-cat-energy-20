const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require ("gulp-svgstore");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
}

exports.html = html;

const jsmin = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
}

exports.jsmin = jsmin;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

const clean = () => {
  return del("build");
}

exports.clean = clean;

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    "source/*.html"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
}

exports.copy = copy;

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLavel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
}

exports.images = images;

const webps = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
}

exports.webps = webps;

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

const build = gulp.series (
  clean,
  copy,
  styles,
  html,
  jsmin,
  images,
  webps,
  sprite
);

exports.build = build;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  build, styles, server, watcher
);
