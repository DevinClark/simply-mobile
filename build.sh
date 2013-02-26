echo "Building..."
rm -fr components && component install
component build && cp build/build.js js/components.js
rm -fr build
echo "Linting..."
jshint js/app.js
echo "Generating Docs..."
dox-foundation --title "Simply Mobile" --source js --target docs
echo "Minifying..."
uglifyjs js/modernizr.js js/components.js js/app.js --stats -v -o js/app.min.js