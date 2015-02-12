var config = require( './config' );
var parser = require( './parser' );
var express = require( 'express' );
var async = require( 'async' );
var request = require( 'request' );

var router = express.Router();

// default options
var options;

// static files
router.use( express.static( __dirname + '/assets' ) );


// default options for all routs
router.use( function( req, res, next ) {

	res.locals = {
		items: [],
		profile: '',
		error: '',
		notice: '',
		max_pages: config.max_pages,
		show_form: config.show_form
	};

	// set options if not set
	options = options || res.locals;

	next();
} );


// Error handling.
router.use( function( err, req, res, next ) {
	var status = err.status || err.statusCode;

	if ( typeof status !== 'number' || status >= 500 ) {
		next( err );
		return;
	}

	res.statusCode = status;

	// render and end the response
	res.render( '404.ejs', {
		message: status + ' ' + err.message
	} ).end();
} );


// Root
router.get( '/', function( req, res ) {

	if ( !options.error ) {
		// Not redirected from a post request
		// Not an error. Flush options and display notice.
		options = res.locals;
		options.notice = 'Please submit a WordPress dot org profile in the form above.';
	}

	res.render( 'index', options );

	// flush errors
	options.error = '';
	options.notice = '';
} );


// profile/profile-name
router.get( "/profile/:profile([0-9a-zA-Z\-_+.]+)", function( req, res ) {

	// set profile
	options.profile = req.params.profile;
	console.log( 'start' );

	// sanitize profile
	profile = options.profile.replace( /[^0-9a-zA-Z\-_+.]/gi, '' ).trim();

	// async requests
	async.times( options.max_pages, function( i, callback ) {

		var args = {
			url: 'https://wordpress.org/support/profile/' + profile + '/page/' + ( i + 1 ),
		};

		request( args, function( error, response, html ) {

			console.log( args[ 'url' ] + '/page/' + i );

			if ( error ) {
				return callback( null, [] );
			}

			result = parser.parse_html( html );

			callback( null, result );
		} );

	}, function( err, results ) {
		// completed processing of all items

		// order items
		options.items = parser.order_items( results );

		// render items
		res.render( 'index', options );

		console.log( 'finished' );
	} );

	// Reset errors.
	options.error = '';
	options.notice = '';
} );


// post action
router.post( '/profile', function( req, res ) {

	var profile = req.body.profile_name;
	console.log( 'post' );

	// sanitize profile before redirect
	profile = profile.replace( /[^0-9a-zA-Z\-_+.]/gi, '' ).trim();

	if ( '' === profile ) {
		// Reset options
		options = res.locals;
		options.error = 'Invalid profile! Submit a different profile.';

		res.redirect( '/' );
	} else {

		res.redirect( '/profile/' + profile );
	}

} );


// No page was found, display 404 template.
router.use( function( req, res, next ) {
	// Reset errors.
	options.error = '';
	options.notice = '';

	res.status( 404 ).render( '404.ejs', {
		message: 'Page not found!'
	} );
} );

module.exports = router;