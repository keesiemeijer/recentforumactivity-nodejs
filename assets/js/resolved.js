sc = {
	// CSS classes

	hidingClass: 'hide', // hide elements
	topics: null,
	container: null,

	init: function() {

		if ( !document.querySelectorAll || !document.createElement ) {
			return;
		}

		sc.topics = document.querySelector( '.topics' );
		sc.container = document.querySelector('.col-md-8');
		
		if ( !sc.topics || !sc.container) {
			return;
		}

		var hideLink = sc.createLink( '', 'hide resolved', 'toggle' );
		sc.container.insertBefore(hideLink, sc.container.firstChild);
		sc.addEvent( hideLink, 'click', sc.toggle_resolved, false );

		var button = document.querySelector('#submitbutton');
		sc.addEvent(button, 'click', sc.hide_content, false);
	},

	toggle_resolved: function( e ) {

		var listitems = sc.topics.getElementsByTagName( 'li' );
		for ( var i = 0; i < listitems.length; i++ ) {
			if ( listitems[ i ].getElementsByClassName('resolved').length ) {
				if ( sc.cssjs( 'check', listitems[ i ], sc.hidingClass ) ) {
					sc.cssjs( 'remove', listitems[ i ], sc.hidingClass );
					this.innerHTML = 'hide resolved';
				} else {
					sc.cssjs( 'add', listitems[ i ], sc.hidingClass );
					this.innerHTML = 'show resolved';
				}
			}
		}
		sc.cancelClick( e );
	},

	hide_content: function( e ) {
		sc.cssjs( 'add', sc.container, 'visuallyhidden' );
	},

	cssjs: function( a, o, c1, c2 ) {
		switch ( a ) {
			case 'swap':
				o.className = !sc.cssjs( 'check', o, c1 ) ? o.className.replace( c2, c1 ) : o.className.replace( c1, c2 );
				break;
			case 'add':
				if ( !sc.cssjs( 'check', o, c1 ) ) {
					o.className += o.className ? ' ' + c1 : c1;
				}
				break;
			case 'remove':
				var rep = o.className.match( ' ' + c1 ) ? ' ' + c1 : c1;
				o.className = o.className.replace( rep, '' );
				break;
			case 'check':
				var found = false;
				var temparray = o.className.split( ' ' );
				for ( var i = 0; i < temparray.length; i++ ) {
					if ( temparray[ i ] == c1 ) {
						found = true;
					}
				}
				return found;
				break;
		}
	},

	createLink: function( to, txt, clss ) {
		var tempObj = document.createElement( 'a' );
		tempObj.appendChild( document.createTextNode( txt ) );
		tempObj.setAttribute( 'href', to );
		sc.cssjs( 'add', tempObj, clss );
		return tempObj;
	},

	addEvent: function( elm, evType, fn, useCapture ) {
		if ( elm.addEventListener ) {
			elm.addEventListener( evType, fn, useCapture );
			return true;
		} else if ( elm.attachEvent ) {
			var r = elm.attachEvent( 'on' + evType, fn );
			return r;
		} else {
			elm[ 'on' + evType ] = fn;
		}
	},

	cancelClick: function( e ) {
		if ( window.event ) {
			window.event.cancelBubble = true;
			window.event.returnValue = false;
		}
		if ( e && e.stopPropagation && e.preventDefault ) {
			e.stopPropagation();
			e.preventDefault();
		}
	}


}
sc.addEvent( window, 'load', sc.init, false );