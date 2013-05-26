# Simply Mobile

Simply mobile is a mobile/tablet framework. The idea is to be able to easily make a web app, or integrate with [Cordova](http://cordova.apache.org/) (formally known as PhoneGap) or any of those other environments similar to Cordova. I plan to add Cordova project in the future as that is my preferred platform.  

[Live Demo](http://devinclark.github.io/simply-mobile/)  

## Features
  * Uses [Bower](http://twitter.github.com/bower/) for dependency management.
  * Uses [Grunt](http://gruntjs.com/getting-started) for building.
  * Uses jQuery 2.0
  * Uses [HandlebarsJS](http://handlebarsjs.com/) for templating.
  * Uses [FastClick](https://github.com/ftlabs/fastclick) to remove click delays.
  * Code written for several supported HTML(5) APIs.

## Getting Started
TODO  

## If You Want To Develop
* `npm install bower grunt-cli -g`
* `npm install` 
* Before you finish (or if you just want to update everything), run `grunt`. Running `grunt` will:
	* Update all bower components.
	* Run JSHint on app.js.
	* Concatenate and compress all the JS files into app.min.js.
	* Minify the CSS.
* I am considering adding my Codekit project file to the project for Sass compiling.

### Adding a New Dependency
1. `bower install PACKAGE --save-dev` where PACKAGE is your bower package.
2. Run `grunt`.


## Contributors
* Devin Clark [@DevinClark](https://github.com/DevinClark)
* Chris Ensell [@ensell](https://github.com/ensell)
