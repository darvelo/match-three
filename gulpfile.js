var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var filter = require('gulp-filter');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var dest = 'public';
var destStylesDir = dest + '/styles';

var sassDir = 'sass';
var sassGlob = sassDir + '/**/*.scss';

gulp.task('sass', function() {
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

gulp.task('default', ['sass', 'browser-sync'], function() {
    gulp.watch(sassGlob, ['sass']);
});
