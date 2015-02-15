var config = require( './config' );
var parser = require( './parser' );
var express = require( 'express' );
var async = require( 'async' );
var request = require( 'request' );

var router = express.Router();

// default options
var options;
var profile_base_url = 'https://wordpress.org/support/profile/';

// static files
router.use( express.static( __dirname + '/assets' ) );


// default options for all routs
router.use( function( req, res, next ) {

	res.locals = {
		items: [],
		profile: '',
		errors: [],
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

	// render the 404 template for the error
	res.status( res.statusCode ).render( '404.ejs', {
		message: status + ' ' + err.message
	} );
} );


// Root
router.get( '/', function( req, res ) {

	if ( !options.errors.length ) {
		// Not redirected from a post request
		// Not an error. Reset options and display notice.
		options = res.locals;

		options.errors.push( {
			message: 'Please submit a WordPress dot org profile in the form above.',
			error: 'info'
		} );
	}

	res.render( 'index', options );

	// Reset errors
	options.errors = [];
} );


// profile/profile-name
router.get( "/profile/:profile([0-9a-zA-Z\-_+.]+)", function( req, res ) {

	// set profile
	options.profile = req.params.profile;
	console.log( 'start' );

	// sanitize profile
	profile = options.profile.replace( /[^0-9a-zA-Z\-_+.]/gi, '' ).toLowerCase().trim();

	// async requests
	async.times( options.max_pages, function( i, callback ) {

		var page = ( i === 0 ) ? profile : profile + '/page/' + ( i + 1 );

		var args = {
			url: profile_base_url + page
		};

		request( args, function( error, response, html ) {

			console.log( args[ 'url' ] );

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

		if ( !options.items.length ) {

			var link = '<a href="' + profile_base_url + profile + '">' + profile + '</a>';
			options.errors.push( {
				message: 'No topics found for profile ' + link,
				error: 'warning'
			} );
		}

		// Render items
		res.render( 'index', options );

		// Reset errors
		options.errors = [];

		console.log( 'finished' );
	} );

} );


// post action
router.post( '/profile', function( req, res ) {

	var profile = req.body.profile_name;
	console.log( 'post' );

	// Sanitize profile before redirect
	profile = profile.replace( /[^0-9a-zA-Z\-_+.]/gi, '' ).trim();

	if ( '' === profile ) {
		// Reset options
		options = res.locals;
		options.errors = [];
		options.errors.push( {
			message: 'Invalid profile! Submit a different profile.',
			error: 'danger'
		} );

		res.redirect( '/' );
	} else {

		res.redirect( '/profile/' + profile );
	}

} );


// No page was found, display 404 template.
router.use( function( req, res, next ) {
	res.status( 404 ).render( '404.ejs', {
		message: 'Page not found!'
	} );

	// Reset errors.
	options.errors = [];
} );

module.exports = router;