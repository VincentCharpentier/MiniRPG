var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var compilerPackage = require('google-closure-compiler');
var closureCompiler = compilerPackage.gulp();

var src = './src'; // working dir
var out = './dist'; // output dir

var minify = false;
var hard_compilation = false;

var tsProject = plugins.typescript.createProject(src + '/scripts/tsconfig.json');

// PLUGINS OPTIONS
var htmlmin_opts = {removeComments: true};

// DATE
function GetTime(d) {
    var hr = d.getHours();
    if (hr < 10) {
        hr = "0" + hr;
    }
    var min = d.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var sec = d.getSeconds();
    if (sec < 10) {
        sec = "0" + sec;
    }
    return hr + ":" + min + ":" + sec;
}
var date = new Date(),
    locale = "en-us",
    month = date.toLocaleString(locale, { month: "long" });
var date_string = month + " " + date.getDate() + ", " + date.getFullYear(),
    time_string = date_string + " " + GetTime(date);


// TASKS

gulp.task('default',['views','styles','scripts','static-content']);

gulp.task('views', ['jade', 'html']);
// gulp.task('styles', ['scss', 'css']);
// gulp.task('scripts', ['typescript', 'javascript']);

// VIEWS
gulp.task('jade', function() {
    var result = gulp.src(src + "/views/*.jade")
        .pipe(plugins.jade())
        .pipe(plugins.replace("{{current_date}}",date_string))
        .pipe(plugins.replace("{{current_time}}",time_string));
    if (minify) {
        result = result.pipe(plugins.htmlmin(htmlmin_opts));
    }
    return result.pipe(gulp.dest(out));
});

gulp.task('html', function() {
    var result = gulp.src(src + "/views/*.html")
        .pipe(plugins.replace("{{current_date}}",date_string))
        .pipe(plugins.replace("{{current_time}}",time_string));
    if (minify) {
        result = result.pipe(plugins.htmlmin(htmlmin_opts));
    }
    return result.pipe(gulp.dest(out));
});

// STYLES
gulp.task('styles', function () {
    var result = gulp.src(src + '/styles/*.scss')
        .pipe(plugins.sass())
        .pipe(plugins.csscomb())
        .pipe(plugins.autoprefixer());
    if (minify) {
        result = result
            .pipe(plugins.csso())
            .pipe(plugins.concat("styles.css"))
    }
    return result.pipe(gulp.dest(out + '/css/'));
});

gulp.task('scripts',function() {
    var result = tsProject.src()
        .pipe(plugins.typescript(tsProject)).js;
    if (minify) {
        result = result
            // google closure compilation
            .pipe(closureCompiler({
                compilation_level: hard_compilation ? 'ADVANCED' : 'SIMPLE',
                //   externs: [
                //       compilerPackage.compiler.CONTRIB_PATH + '/externs/jquery-1.9.js',
                //       compilerPackage.compiler.CONTRIB_PATH + '/externs/angular-1.4.js'
                //   ],
                warning_level: 'VERBOSE',
                language_in: 'ECMASCRIPT6_STRICT',
                language_out: 'ECMASCRIPT5_STRICT',
                output_wrapper: '(function(){\n%output%\n}).call(this);',
                //   js_output_file: 'app.min.js'
            }));
    }
    return result
        .pipe(plugins.concat("app.js"))
        .pipe(gulp.dest(out + '/js/'));
});

gulp.task('static-content', ['assets','plugins']);

gulp.task('assets', function() {
    return gulp.src(src + "/assets/**/*")
        .pipe(gulp.dest(out + "/assets/"));
});
gulp.task('plugins', function() {
    return gulp.src(src + "/plugins/**/*")
        .pipe(gulp.dest(out + "/plugins/"));
});
