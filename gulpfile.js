(function(gulp, gulpLoadPlugins) {
  'use strict';
  var $ = gulpLoadPlugins({pattern: '*', lazy: true}),
      _ = {
        app:  'app',
        dist: 'dist',
        scss: 'scss',
        tmpl: 'build',
        js:   'app/js',
        css:  'app/css',
        img:  'app/img'
      };

  function handleError(error){
    console.log(error.message);
    this.emit('end');
  }

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ Wait for scss build & html templates render, then launch the Server
  //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('bs', ['scss', 'static'], function() {
    $.browserSync({
      ui: false,
      server: {
        baseDir: './'
      },
      startPath: './app',
      port: 9000
    });
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ jshint - js files test
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('jshint', function() {
    return gulp.src([ 'gulpfile.js' , _.js + '/**/*.js'])
      .pipe($.jshint('.jshintrc'))
      .pipe($.jshint.reporter('jshint-stylish'));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ scsslint - scss files test
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('scsslint', function() {
    return gulp.src([
      _.scss + '/**/*.scss',
      '!' + _.scss + '/base/_normalize.scss',
      '!' + _.scss + '/base/_reset.scss',
      '!' + _.scss + '/utils/_variables.scss'])
      .pipe($.scssLint({
        'config': '.scsslintrc',
        'customReport': $.scssLintStylish
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ render template from html file
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('static', function() {
    return gulp.src([_.tmpl + '/partial/**/*.html'])
      .pipe($.plumber())
      .pipe($.fileWrapper(_.tmpl + '/layout.html'))
      .pipe(gulp.dest(_.app + '/'))
      .pipe($.size({
        title: 'HTML files:'
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ scss2css (node-sass)
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('scss', function() {
    return gulp.src(_.scss + '/**/*.scss')
      .pipe($.plumber({ errorHandler: handleError}))
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        outputStyle: 'expanded',
        includePaths: [ './bower_components/' ]
      }))
      .pipe($.autoprefixer(['last 15 versions', '> 1%', 'ie 8']))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(_.css))
      .pipe($.browserSync.reload({stream:true}))
      .pipe($.size({
        title: 'CSS files:'
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ optimize images
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('image', function () {
    return gulp.src(_.img + '/**/*')
      .pipe($.imagemin({
        progressive: true
      }))
      .pipe(gulp.dest(_.dist + '/img/'))
      .pipe($.size({
        title: 'IMAGE files:'
      }));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ join & minify css & js
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('html', function() {
    return gulp.src(['app/*.html'])
      .pipe($.plumber({ errorHandler: handleError}))
      .pipe($.useref.assets())
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', $.minifyCss({
        keepSpecialComments: 0
      })))
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest(_.dist));
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ watch
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('watch', function () {
      // Watch scss files
      gulp.watch(_.scss + '/**/*.scss', ['scss']);
      // Watch template files
      gulp.watch([_.tmpl + '/**/*.html'], ['static']);
      gulp.watch([
        _.js  + '/**/*.js',
        _.app + '/*.html',
        _.img + '/**/*.{png,jpg,jpeg,gif,ico}'
      ], function(){
        return $.browserSync.reload();
      });
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ~ clean dist folder
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('clean', function() {
    return $.del([_.dist]);
  });

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ alias
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('test',  ['scsslint', 'jshint']);
  gulp.task('build', ['test', 'clean', 'image', 'html']);

  //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //| ✓ default
  //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  gulp.task('default', ['bs', 'watch']);

}(require('gulp'), require('gulp-load-plugins')));
