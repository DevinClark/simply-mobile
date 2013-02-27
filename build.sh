echo "Building..."
bower update
grunt default
echo "Linting..."
jshint js/app.js
echo "Generating Docs..."
dox-foundation --title "Simply Mobile" --source js --target docs
echo "Minifying..."
cleancss -o css/base.min.css css/base.css
uglifyjs js/modernizr.js js/assets.js js/app.js --stats -v -o js/app.min.js