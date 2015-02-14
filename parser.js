var cheerio = require( 'cheerio' );
var __ = require( 'underscore' );

var time_in_seconds = {
	minute: 60,
	hour: 3600,
	day: 86400,
	week: 604800,
	month: 2419200,
	year: 29030400
};

var defaults = {
	link: '',
	resolved: '',
	user_reply: '',
	last_reply_author: '',
	time: '',
	type: '',
	order: ''
};

var exports = module.exports = {};

exports.parse_html = function( html ) {

	var result = [];

	var $ = cheerio.load( html );

	// Topics that contain "Most recent reply"
	$( '#user-replies .freshness:contains("Most recent reply")' ).filter( function() {
		var item = {};

		// get content from parent
		var parent = $( this ).parents( 'li' );

		if ( !parent.length ) {
			return false;
		}

		// String with text nodes only.
		var text = parent.contents().filter( function() {
			return this.nodeType === 3; //Node.TEXT_NODE
		} ).text().replace( /[\t\r\n]+/g, "" ).trim();

		// Get status from text node string
		item[ 'resolved' ] = __.find( [ '[resolved] [closed]', '[resolved]', '[closed]' ], function( status ) {
			return text.indexOf( status ) === 0;
		} );

		// Get user reply from text node string
		// (e.g User last replied: 12 hours ago.)
		if ( __.defaults( item, defaults )[ 'resolved' ].length ) {
			item[ 'user_reply' ] = text.replace( item[ 'resolved' ], '' ).trim();
		} else {
			item[ 'user_reply' ] = text.trim();
		}

		// Get the topic link html.
		var link = parent.find( 'a' ).first();
		item[ 'link' ] = link.length ? $.html( parent.find( 'a' ).first() ) : '';

		// Get content from freshness span.
		text = $( this ).text();

		// Split text at the first ' ago'.
		var parts = text.split( ' ago' );

		// Get text part with the time variable 
		// e.g. "Most recent reply: 11 hours ago"
		var text_time = parts.shift();

		// Get last reply text.
		// e.g. "by keesiemeijer"
		item[ 'last_reply_author' ] = parts.join( ' ago' ).trim();

		// Get the time variable
		item[ 'time' ] = Number( text_time.replace( /[^\d]+/gi, '' ) ) || '';

		// Get year, month, day etc...
		item[ 'type' ] = __.find( __.keys( time_in_seconds ), function( date_type ) {
			return text_time.indexOf( date_type ) !== -1;
		} );

		item = __.defaults( item, defaults );

		// Check if type and time was found
		if ( !item[ 'type' ].length || !__.isNumber( item[ 'time' ] ) ) {
			return false;
		}

		result.push( item );
	} );

	return result;
};


exports.order_items = function( results ) {

	if ( __.isEmpty( results ) ) {
		return [];
	}

	results = __.flatten( results );

	// Add order value.
	__.each( results, function( item, index ) {
		item[ 'order' ] = ( item[ 'time' ] * time_in_seconds[ item[ 'type' ] ] ) + index;
	} );

	//Order results
	results = __.sortBy( results, function( item ) {
		return item.order;
	} );

	return results;
};