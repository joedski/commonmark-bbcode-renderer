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

### API

The object returned by `require`ing this module is a function which takes an options object.  This function itself returns an object with the following properties when invoked.

- The options listed in the following section _Options_.
- `render( block ) :String` Function that renders the AST handed to it into BBCode.
	- Arguments:
		- `block` An AST Node.  Does not need to be the Document node to work, can work at any depth.
	- Returns a String of BBCode formatted text.

### Options

- `getHeaderStyling( headerNode ) :Object` Function that defines some style attributes for the header node provided.
	- Receives an AST Node as its sole argument.
	- Should return an Object with the following properties:
		- `size` String indicating the text size.  Can be a number 1-7 or a pt size like `18pt`.
		- `bold` Boolean indicating whether to make the text bold as well.
		- `italic` Boolean indicating whether to make the text italic as well.
		- `underline` Boolean indicating whether to make the text underlined as well.
		- `additionalSpacingBefore` String with the additional white space to add before the header node.  Usually either `'\n'` (For H1 and H2) or `''`. (For H3 through H6)
- `htmlListTags` Boolean indicating whether or not to use HTML list tag names.
	- `true` means outputting `[ol type="..."]` for ordered lists and `[ul type="..."]` for unordered lists.
	- `false` means outputting `[list type="..."]` for both, where only the `type="..."` part varies.
	- Default: `true`.
	- Note: Many forums support both.
- `orderedListType` String indicating what value to put in the `type=""` attribute of ordered lists.
	- Valid values: `decimal`, `upper-alpha`, `lower-alpha`, `upper-roman`, `lower-roman`
	- Default: `decimal`.
- `unorderedListType` String indicating what value to put in the `type=""` attribute of unordered lists.
	- Valid values: `disc` (solid dot), `circle` (open dot), `square` (solid square)
	- Default: `disc`.

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
