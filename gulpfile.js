var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
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
    return gulp.src(sassGlob)
        .pipe(sass({ sourcemap: true, sourcemapPath: sassUrl}))
        .on('error', function (err) { console.log(err); })
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
