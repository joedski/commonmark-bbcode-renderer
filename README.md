CommonMark BBCode Renderer
==========================

Provides a renderer called in the same manner as the HTML and XML renderers included with the Commonmark NPM Package that outputs a reasonable approximation of the source Markdown document as BBCode, suitable for posting in forums which use that.



Usage
-----

Usually the defaults should prove sufficient.  Note that it does also output an additional newline between level 1 and level 2 headers and the element before said headers.

A minimal example:

```js
var Commonmark = require( 'commonmark' );
var BBCodeRenderer = require( 'commonmark-bbcode-renderer' );
var fs = require( 'fs' );

fs.readFile( process.argv[ 2 ], 'utf8', function( error, data ) {
	var parser = new Commonmark.Parser();
	var renderer = BBCodeRenderer();

	var doc = parser.parse( data );
	var bbcode = renderer.render( doc );

	console.log( bbcode );
});
```

### Options

- `getHeaderStyling` Function that defines some style attributes for the header node provided.
	- Receives an AST Node as its sole argument.
	- Should return an Object with the following properties:
		- `size` String indicating the text size.  Can be a number 1-7 or a pt size like `18pt`.
		- `bold` Boolean indicating whether to make the text bold as well.
		- `additionalSpacingBefore` String the additional white space to add before the header node.

### Other

`BBCodeRenderer.headerStyleForLevel` is the function called by the default `getHeaderStyling` function, and is provided so that one could call it with, for example, an increase in the header level.  It automatically clamps the provided header level to between 1 and 6 inclusive.

```js
var BBCodeRenderer = require( 'commonmark-bbcode-renderer' );
var renderer = BBCodeRenderer({
	getHeaderStyling: function( headerNode ) {
		return BBCodeRenderer.headerStyleForLevel( headerNode.level + 3 );
	}
});
```
