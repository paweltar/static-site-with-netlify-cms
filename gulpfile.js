var gulp = require('gulp');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var htmlclean = require('gulp-htmlclean');
var panini = require('panini');
var concat = require('gulp-concat');
var deporder = require('gulp-deporder');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var assets = require('postcss-assets');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var cssnext = require('postcss-cssnext');
var nipponColor = require('postcss-nippon-color');
var rucksack = require('gulp-rucksack');
var fontMagician = require('postcss-font-magician');
var lost = require('lost');
var markdownToJSON = require('gulp-markdown-to-json');
var gutil = require('gulp-util');
var marked = require('marked');
var rename = require("gulp-rename");
var remark = require("gulp-remark");
var remarkHtml = require("remark-html");
var inject = require('gulp-inject-string');


var devBuild = (process.env.NODE_ENV !== 'production');

var folder = {
    src: 'src/',
    build: 'build/'
};

// marked.setOptions({
//   smartypants: true
// });

gulp.task('serve', ['css'], function() {
    browserSync.init({
        server: "build/"
    });
});

gulp.task('images', function() {
    var out = folder.build + 'images/';
    return gulp.src(folder.src + 'images/**/*').pipe(newer(out)).pipe(imagemin({optimizationLevel: 5})).pipe(gulp.dest(out));
});

gulp.task('html', ['images'], function() {
    var out = folder.build + '/';

    var page = gulp.src(folder.src + 'html/pages/**/*.html').pipe(panini({
        root: folder.src + 'html/pages/',
        layouts: folder.src + 'html/layouts/',
        partials: folder.src + 'html/partials/',
        helpers: folder.src + 'html/helpers/',
        data: folder.src + 'data/'
    }));

    if (!devBuild) {
        page = page.pipe(htmlclean());
    }

    return page.pipe(gulp.dest(out)).on('finish', browserSync.reload);
});

gulp.task('panini:reset', function(done) {
  panini.refresh();
  gulp.run('html');
  done();
});

gulp.task('js', function() {

  var jsbuild = gulp.src(folder.src + 'js/**/*')
    .pipe(deporder())
    .pipe(concat('main.js'));

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

gulp.task('css', ['images', 'fonts'], function() {

  var postCssOptions = [
    assets({
      loadPaths: ['fonts/', 'images/'],
      basePath: 'src/'
    }),
    fontMagician({
      hosted: [folder.src + 'fonts']
    }),
    nipponColor,
    // lost(),
    rucksack,
    mqpacker,
    cssnext({ browsers: ['last 2 versions', '> 2%'] })
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOptions))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(folder.build + 'css'))
    .pipe(browserSync.stream());

});

gulp.task('clean:build', function() {
  return del.sync('build');
});

// gulp.task('clean:posts', function() {
//   return del.sync(folder.src + 'html/pages/posts');
// });

gulp.task('fonts', function() {
  return gulp.src(folder.src + 'fonts/**/*')
  .pipe(gulp.dest(folder.build + 'fonts'))
});

gulp.task('static', function() {
  return gulp.src(folder.src + 'static/**/*')
  .pipe(gulp.dest(folder.build))
});

// gulp.task('save-posts-data', ['convert-to-html'], function() {
//   return gulp.src(folder.src + 'posts/**/*.md')
//   .pipe(gutil.buffer())
//   .pipe(markdownToJSON(marked, 'posts.json', (data, file) => {
//     delete data.body;
//     data.path = file.path;
//     return data;
//   }))
//   .pipe(gulp.dest(folder.src + 'data'))
// });

// gulp.task('convert-to-html', function() {
//   return gulp.src(folder.src + 'posts/**/*.md')
//   .pipe(inject.after('\'\n---', '\n{{> post-meta}}\n{{#markdown}}\n'))
//   .pipe(inject.append('\n{{/markdown}}\n</article>'))
//   .pipe(rename({
//     extname: ".html"
//   }))
//   .pipe(gulp.dest(folder.src + 'html/pages/posts'))
// })

gulp.task('run', ['html', 'css', 'js', 'fonts', 'static']);

gulp.task('watch', function() {
  gulp.watch(folder.src + 'images/**/*', ['images']);
  gulp.watch(folder.build + 'html/**/*').on('change', browserSync.reload);
  gulp.watch(['./src/html/{pages,layouts,partials,helpers,data}/**/*'], function() {
    runSequence('panini:reset');
  });
  gulp.watch(folder.src + 'js/**/*', ['js']);
  gulp.watch(folder.src + 'scss/**/*', ['css']);
  gulp.watch(folder.src + 'fonts/**/*', ['fonts']);
  gulp.watch(folder.src + 'static/**/*', ['static']);
});

gulp.task('default', function() {
  runSequence('clean:build', ['run', 'watch', 'serve']);
});

gulp.task('build', function() {
  runSequence('clean:build', 'run');
});
