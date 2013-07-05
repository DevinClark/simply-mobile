# Simply Mobile

Simply mobile is a mobile/tablet framework. The idea is to be able to easily make a web app, or integrate with [Cordova](http://cordova.apache.org/) (formally known as PhoneGap) or any of those other environments similar to Cordova. I plan to add a Cordova project in the future as that is my preferred platform.  

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
1. `bower install PACKAGE --save` where PACKAGE is your bower package.
2. Run `grunt`.


## Contributors
* Devin Clark [@DevinClark](https://github.com/DevinClark)
* Chris Ensell [@ensell](https://github.com/ensell)

## License

Simply Mobile, a front-end mobile/table framework.
Copyright (C) 2013  Devin Clark

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
