function renderNodes( block ) {
	var event, node, entering;
	var headerStyling;

	var walker = block.walker();
	var buffer = '';

	function out( s ) {
		buffer += s;
	}

	while( event = walker.next() ) {
		entering = event.entering;
		node = event.node;

		//// Pre-Whitespace

		if( entering && ! node.prev && node.type == 'Item' ) {
			if( ! this.ignoreListTightness && ! shouldBeTight( node ) && ! isNestedList( node.parent ) ) {
				out( '\n' );
			}
		}

		switch( node.type ) {
			//////// Misc

			default:
			case 'Document':
				break;

			//////// Breaks
			// Technically, these are Noncontainer Inlines.

			case 'Softbreak':
				out( ' ' );
				break;

			case 'Hardbreak':
				out( '\n' );
				break;

			//////// Inline

			//// Container Inlines

			case 'Emph':
				if( entering ) {
					out( '[i]' );
				}
				else {
					out( '[/i]' );
				}
				break;

			case 'Strong':
				if( entering ) {
					out( '[b]' );
				}
				else {
					out( '[/b]' );
				}
				break;

			case 'Link':
				if( entering ) {
					out( '[url="' + node.destination + '"]' );
				}
				else {
					out( '[/url]' );
				}
				break;

			//// Noncontainer Inlines (Inline Leaf Nodes)

			case 'Code':
				// Note: Probably not safe.
				out( '[code]' + node.literal + '[/code]' );
				break;

			case 'Text':
				// Note: Does text need escaping in BBCode?
				out( node.literal, false );
				break;

			case 'Html':
				// Note: Safe?  Unsafe?
				out( node.literal );
				break;

			case 'Image':
				// Image nodes are containers like links, I think.  This may need revising.
				if( entering ) {
					out( '[img src="' + node.destination + '" style="max-width: 100%;" alt="' );
				}
				else {
					out( '"' );

					if( node.title ) {
						out( ' title="' + node.title + '"' );
					}

					out( ']' );
				}
				break;

			//////// Blocks

			//// Container Blocks Which May Contain Other Containers Blocks

			case 'BlockQuote':
				if( entering ) {
					out( '[quote]' );
				}
				else {
					out( '[/quote]' );
				}
				break;

			case 'Item':
				if( entering ) {
					out( '[li]' );
				}
				else {
					out( '[/li]' );
				}
				break;

			case 'List':
				// Note: Proboards uses both of using [ol] and [ul], and using [list].  Others may or may not.  Who knows!
				if( entering ) {
					if( node.listType == 'Ordered' ) {
						// types: decimal, upper-alpha, lower-alpha, upper-roman, lower-roman
						out( '[' + (this.htmlListTags ? 'ol' : 'list') + (this.orderedListType ? ' type="' + this.orderedListType + '"' : '') + ']' );
					}
					else {
						// types: disc, circle, square
						out( '[' + (this.htmlListTags ? 'ul' : 'list') + (this.unorderedListType ? ' type="' + this.unorderedListType + '"' : '') + ']' );
					}
				}
				else {
					if( node.listType == 'Ordered' ) {
						out( '[/' + (this.htmlListTags ? 'ol' : 'list') + ']' );
					}
					else {
						out( '[/' + (this.htmlListTags ? 'ul' : 'list') + ']' );
					}
				}
				break;

			//// Container Blocks

			case 'Paragraph':
				break;

			case 'Header':
				headerStyling = this.getHeaderStyling( node );

				if( entering ) {
					out( '[size="' + headerStyling.size + '"]' );
					out( headerStyling.bold ? '[b]' : '' );
					out( headerStyling.italic ? '[i]' : '' );
					out( headerStyling.underline ? '[u]' : '' );
				}
				else {
					out( headerStyling.underline ? '[/u]' : '' );
					out( headerStyling.italic ? '[/i]' : '' );
					out( headerStyling.bold ? '[/b]' : '' );
					out( '[/size]' );
				}
				break;

			case 'HtmlBlock':
				// Note: Are HtmlBlocks' contents safe?  Probably for BBCode.  Usually the forums sanitize input.
				// Node: Should HtmlBlocks be emitted as Paragraphs?
				out( node.literal );
				break;

			//// Noncontainer Blocks (Block Leaf Nodes)

			case 'CodeBlock':
				out( '[code]' + node.literal + '[code]' );
				break;

			case 'HorizontalRule':
				out( '[hr]' );
				break;
		}

		//// Inter-node Whitespace.

		if( ! entering && node.next && isBlock( node ) && isBlock( node.next ) ) {
			if( node.type == 'List' && node.next.type == 'List' ) {
				out( '\n' );
			}
			else if( node.parent && node.parent.parent && node.parent.parent.type == 'List' && node.parent.parent.listTight ) {
				out( '\n' );
			}
			else if( node.type == 'Item' && node.next.type == 'Item' ) {
				// Technically, checking if both nodes are Items is overkill.
				if( this.ignoreListTightness ) {
					out( '' );
				}
				else if( node.parent.listTight ) {
					out( '' );
				}
				else {
					out( '\n' );
					if( this.extraNonTightListSpacing ) {
						out( '\n' );
					}
				}
			}
			else if( node.type == 'List' ) {
				out( '\n' );
				// if( ! node.listTight ) {
				// 	out( '\n' );
				// }
			}
			else if( node.next.type == 'List' ) {
				if( this.ignoreListTightness || shouldBeTight( node.next ) ) {
					out( '\n' );
				}
				else {
					out( '\n\n' );
				}
			}
			else {
				out( '\n\n' );
			}

			if( node.type != 'Header' && node.next.type == 'Header' ) {
				out( this.getHeaderStyling( node.next ).additionalSpacingBefore );
			}
		}
		else if( ! entering && ! node.next && isBlock( node ) ) {
			if( ! this.ignoreListTightness && this.extraNonTightListSpacing && node.type == 'List' && ! shouldBeTight( node ) ) {
				out( '\n' );
			}
		}
	}

	return buffer;
}

function shouldBeTight( node ) {
	// Determine if we should be tight.
	if( node.type == 'Item' ) {
		return shouldBeTight( node.parent );
	}
	else if( node.type == 'List' ) {
		// If we have no children, return as is. (this shouldn't happen...)
		if( ! node.firstChild ) return node.listTight;

		// If we have two+ items, return as is.
		if( node.firstChild != node.lastChild ) return node.listTight;

		// If we have only one item, then check if we're inside a list.
		if( node.parent && node.parent.type == 'Item' ) {
			return shouldBeTight( node.parent.parent );
		}
	}

	// Non-List/Item nodes cannot be tight.
	return false;
}

function isNestedList( node ) {
	if( node.type == 'Item' ) {
		return isNestedList( node.parent );
	}

	if( node.parent && node.parent.type == 'Item' ) {
		return true;
	}

	return false;
}

function isBlock( node ) {
	if( ! node ) return false;

	switch( node.type ) {
		case 'Paragraph':
		case 'BlockQuote':
		case 'Item':
		case 'List':
		case 'Header':
		case 'CodeBlock':
		case 'HtmlBlock':
		case 'HorizontalRule':
			return true;

		default:
			return false;
	}
}

function getHeaderStyling( node ) {
	return headerStyleForLevel( node.level );
}

// Convenience function.  Includes a reasonable default, and automatically clamps the value to between 1 and 6 inclusive.
function headerStyleForLevel( headerLevel ) {
	headerLevel = Math.round( Math.max( Math.min( headerLevel, 6 ), 1 ) );

	var size = [
		6, // h1
		5, // h2
		5, // h3
		4, // h4
		4, // h5
		3, // h6
	];

	var bold = [
		false, // h1
		true, // h2
		false, // h3
		true, // h4
		false, // h5
		true, // h6
	];

	var italic = [
		false, // h1
		false, // h2
		false, // h3
		false, // h4
		false, // h5
		false, // h6
	];

	var underline = [
		false, // h1
		false, // h2
		false, // h3
		false, // h4
		false, // h5
		false, // h6
	];

	var spacing = [
		'\n', // h1
		'\n', // h2
		'', // h3
		'', // h4
		'', // h5
		'', // h6
	];

	return {
		size: String( size[ headerLevel - 1 ] ),
		bold: !! bold[ headerLevel - 1 ],
		italic: !! italic[ headerLevel - 1 ],
		underline: !! underline[ headerLevel - 1 ],
		additionalSpacingBefore: spacing[ headerLevel - 1 ]
	};
}

function defaults() {
	var objs = Array.prototype.slice.call( arguments, 0 );

	return objs.reduce( function( result, o ) {
		if( o ) Object.keys( o ).forEach( function( pn ) {
			if( ! result.hasOwnProperty( pn ) )
				result[ pn ] = o[ pn ];
		});

		return result;
	}, {});
}

function BBCodeRenderer( options ) {
	options = options || {};

	return defaults( options, {
		// Boolean: Wether to use HTML-style tag names for lists.
		// `true` indicates you want to use tags like [ul] for unordered and [ol] for ordered.
		// `false` indicates you want to use [list type="..."] for both, with unordered defaulting to "disc" and ordered defaulting to "decimal".
		//     Note that not all list types may be supported for all forums.
		htmlListTags: true,

		// String: What ordered-list type to assign the list tag.
		// Common values are: 'decimal', 'upper-alpha', 'lower-alpha', 'upper-roman', 'lower-roman'
		// Using a falsey value like an empty string will ommit the `type=""` attribute entirely.
		orderedListType: 'decimal',

		// String: What unordered-list type to assign the list tag.
		// Common values are: 'disc' (solid dot), 'circle' (open dot), 'square' (solid square)
		// Using a falsey value like an empty string will ommit the `type=""` attribute entirely.
		unorderedListType: 'disc',

		// getHeaderStyling - Return an object with a few properties:
		// - size: String - A font size to use.  Most forums support a 1-7 scale, though many also support explicit pt sizes like "18pt", too.
		// - bold: Boolean - Whether or not to insert [b] tags.
		// - italic: Boolean - Whether or not to insert [i] tags.
		// - underline: Boolean - Whether or not to insert [u] tags.
		// - additionalSpacingBefore: String - Any spacing to place before between a block element and a Header.
		getHeaderStyling: getHeaderStyling,

		// Function( Node ) :String - Renders the nodes into BBCode.
		render: renderNodes,

		// Some forums do not support spacing out list items.  From a presentation stand point, it's better to just remove nontightness altogether on these.
		ignoreListTightness: false,

		// Boolean: Whether or not to insert extra spacing between items of non-tight lists.
		// This is due to differences in how some forumns handle nested list elements.
		extraNonTightListSpacing: false
	});
}

module.exports = BBCodeRenderer;

// Attached for convenience.
module.exports.headerStyleForLevel = headerStyleForLevel;
