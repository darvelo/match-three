var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');

// js
var to5 = require('gulp-6to5');

// css
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var filter = require('gulp-filter');

// livereload and sync
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// dir vars
var dest = 'public';
var destStylesDir = dest + '/styles';
var destScriptsDir = dest + '/scripts';

// js vars
var jsDir = 'js';
var jsGlob = jsDir + '/**/*.js';
var jsLibsGlobFile = 'libs.js';
var jsAppFile = 'app.js';
var jsLibsGlob = [
    'bower_components/loader.js/loader.js'
];

// css vars
var sassDir = 'sass';
var sassGlob = sassDir + '/**/*.scss';

gulp.task('js:clean', function(cb) {
    del(destScriptsDir, cb);
});

gulp.task('js:clean:libs', function(cb) {
    del(destScriptsDir + '/' + jsLibsGlobFile, cb);
});

gulp.task('js:clean:app', function(cb) {
    del(destScriptsDir + '/' + jsAppFile, cb);
});

// vendor libraries
gulp.task('js:libs', ['js:clean:libs'], function() {
    return gulp.src(jsLibsGlob)
        .pipe(concat(jsLibsGlobFile))
        .pipe(gulp.dest(destScriptsDir));
});

// app source
gulp.task('js:app', ['js:clean:app'], function() {
    return gulp.src(jsGlob)
        .pipe(sourcemaps.init())
        .pipe(to5({ modules: 'amd' }))
        .pipe(concat(jsAppFile))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(destScriptsDir));
});

gulp.task('css:clean', function(cb) {
    del(destStylesDir, cb);
});

gulp.task('sass', ['css:clean'], function() {
    var processors = [
        autoprefixer({ browsers: ['last 2 versions'] })
    ];

    return gulp.src(sassGlob)
        .pipe(sourcemaps.init())
        // css preprocessing
        .pipe(sass({ onError: function (err) { console.log(err); } }))
            // workaround to keep sourcemaps working
            // https://github.com/dlmanning/gulp-sass/issues/106#issuecomment-60977513
            .pipe(sourcemaps.write())
            .pipe(sourcemaps.init({ loadMaps: true }))
        // css postprocessing
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(destStylesDir))
        // filter css for livereload
        .pipe(filter('**/*.css'))
        .pipe(reload({ stream: true }));
});

gulp.task('browser-sync', function() {
    browserSync({
        port: 9000,
        minify: false,
        server: {
            baseDir: dest,
        },
    });
});

gulp.task('default', ['js:libs', 'js:app', 'sass', 'browser-sync'], function() {
    gulp.watch(jsLibsGlob, ['js:libs']);
    gulp.watch(jsGlob, ['js:app']);
    gulp.watch(sassGlob, ['sass']);
});
