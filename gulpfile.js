var fs = require('fs');
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
var sassUrl = '/' + sassDir;
var sassUrlRegex = new RegExp('^\\' + sassUrl);

gulp.task('sass', function() {
    var processors = [
        autoprefixer({ browsers: ['last 2 versions'] })
    ];

    return gulp.src(sassGlob)
        .pipe(sourcemaps.init())
        // sass processing
        .pipe(sass({ onError: function (err) { console.log(err); } }))
            // workaround to keep sourcemaps working
            // https://github.com/dlmanning/gulp-sass/issues/106#issuecomment-60977513
            .pipe(sourcemaps.write({ includeContent: false, sourceRoot: sassUrl }))
            .pipe(sourcemaps.init({ loadMaps: true }))
        // css post-processing
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.', { includeContent: false }))
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
            middleware: function (req, res, next) {
                var filePath,
                    len,
                    readStream;

                // serve sass files directly (sass dir is outside of server baseDir)
                if (sassUrlRegex.test(req.url)) {
                    filePath = req.url.slice(1);
                    len = fs.statSync(filePath).size;

                    res.writeHead(200, {
                        'Content-Type': 'text/css',
                        'Content-Length': len
                    });

                    readStream = fs.createReadStream(filePath);
                    return readStream.pipe(res);
                }

                // file requested was not sass
                next();
            }
        },
    });
});

gulp.task('default', ['sass', 'browser-sync'], function() {
    gulp.watch(sassGlob, ['sass']);
});
