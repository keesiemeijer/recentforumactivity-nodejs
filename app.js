var config = require( './config' );
var openApp = require( 'opener' );
var path = require( 'path' );
var bodyParser = require( 'body-parser' );
var express = require( 'express' );

var app = express();

// configure app

app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( __dirname, 'views' ) );

// use middleware

app.use( bodyParser.urlencoded( {
	extended: false
} ) );

var router = require( './router' );
app.use( router );

// start the server

var port = process.env.PORT || config.port;

app.listen( port, function() {
	console.log( 'ready on port ' + port );

	if ( config[ 'open' ].length ) {
		openApp( config[ 'open' ] );
	}
} );