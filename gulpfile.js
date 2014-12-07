var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var fs = require('fs');

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
var jsLibsFile = 'libs.js';
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
    del(destScriptsDir + '/' + jsLibsFile, cb);
});

gulp.task('js:clean:app', function(cb) {
    del(destScriptsDir + '/' + jsAppFile, cb);
});

// vendor libraries
gulp.task('js:libs', ['js:clean:libs'], function() {
    return gulp.src(jsLibsGlob)
        .pipe(concat(jsLibsFile))
        .pipe(gulp.dest(destScriptsDir));
});

// app source
gulp.task('js:app', ['js:clean:app'], function() {
    return gulp.src(jsGlob)
        .pipe(sourcemaps.init())
        .pipe(to5({
            modules: 'amd',
            amdModuleIds: true,
            sourceRoot: __dirname + '/js',
            moduleRoot: '',
            experimental: true,
        }))
        .on('error', function (err) { console.error(err.toString()); this.emit('end'); })
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
        .pipe(sass())
        .on('error', function (err) { console.error(err.toString()); this.emit('end'); })
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
            middleware: function (req, res, next) {
                var len;
                var readStream;

                if (/6to5-polyfill.js$/.test(req.url)) {
                    var browser6to5Polyfill = './node_modules/gulp-6to5/node_modules/6to5/browser-polyfill.js';
                    len = fs.statSync(browser6to5Polyfill).size;
                    res.writeHead(200, {
                        'Content-Type': 'text/javascript',
                        'Content-Length': len,
                    });

                    readStream = fs.createReadStream(browser6to5Polyfill);
                    return readStream.pipe(res);
                }

                if (/regenerator-runtime.js$/.test(req.url)) {
                    var regeneratorRuntime = 'vendorjs/regenerator-runtime.js';
                    len = fs.statSync(regeneratorRuntime).size;
                    res.writeHead(200, {
                        'Content-Type': 'text/javascript',
                        'Content-Length': len,
                    });

                    readStream = fs.createReadStream(regeneratorRuntime);
                    return readStream.pipe(res);
                }

                next();
            }
        },
    });
});

gulp.task('default', ['js:libs', 'js:app', 'sass', 'browser-sync'], function() {
    gulp.watch(jsLibsGlob, ['js:libs']);
    gulp.watch(jsGlob, ['js:app']);
    gulp.watch(sassGlob, ['sass']);
});
