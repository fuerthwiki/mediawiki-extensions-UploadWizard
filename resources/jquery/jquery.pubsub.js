/**
 * Minimal pubsub framework
 *
 * Loosely based on https://github.com/phiggins42/bloody-jquery-plugins/pubsub.js, which is itself BSD-licensed.
 * Concept of 'ready' events is new, though.
 *
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 */

( function ( $ ) {
	var
		/**
		 * Store of events -> array of listener callbacks
		 */
		subs = {},

		/**
		 * Store of ready events, as object of event name -> argument array
		 */
		ready = {};

	/**
	 * Publish an event
	 * Additional variadic arguments after the event name are passed as arguments to the subscriber functions
	 * @param {string} name of event
	 * @return {number} number of subscribers
	 */
	$.publish = function ( name /* , args... */ ) {
		var args = [].slice.call( arguments, 1 );
		if ( typeof subs[name] !== 'undefined' && subs[name] instanceof Array ) {
			$.each( subs[name], function ( i, sub ) {
				sub.apply( null, args );
			} );
			return subs[name].length;
		}
		return 0;
	};

	/**
	 * Publish a ready event. Ready events occur once only, so
	 * subscribers will be called even if they subscribe later.
	 * Additional variadic arguments after the event name are passed as arguments to the subscriber functions
	 * @param {string} name of event
	 * @return {number} number of subscribers
	 */
	$.publishReady = function ( name /*, args... */ ) {
		if ( typeof ready[name] === 'undefined' ) {
			var args = [].slice.call( arguments, 1 );
			ready[name] = args;
			$.publish.apply( null, arguments );
		}
	};

	/**
	 * Subscribe to an event.
	 * @param {string} name of event to listen for
	 * @param {Function} callback to run when event occurs
	 * @return {Array} returns handle which can be used as argument to unsubscribe()
	 */
	$.subscribe = function ( name, fn ) {
		if ( typeof subs[name] === 'undefined' ) {
			subs[name] = [];
		}
		subs[name].push( fn );
		return [ name, fn ];
	};

	/**
	 * Subscribe to a ready event. See publishReady().
	 * Subscribers will be called even if they subscribe long after the event fired.
	 * @param {string} name of event to listen for
	 * @param {Function} callback to run now (if event already occurred) or when event occurs
	 * @return {Array} returns handle which can be used as argument to unsubscribe()
	 */
	$.subscribeReady = function ( name, fn ) {
		if ( ready[name] ) {
			fn.apply( null, ready[name] );
		} else {
			$.subscribe( name, fn );
		}
	};

	/**
	 * Given the handle of a particular subscription, remove it
	 * @param {Array} object returned by subscribe ( array of event name and callback )
	 * @return {Boolean} success
	 */
	$.unsubscribe = function ( nameFn ) {
		var name = nameFn[0],
			fn = nameFn[1],
			success = false;

		if ( subs[name].length ) {
			$.each( subs[name], function ( i, fni ) {
				if ( fni === fn ) {
					subs[name].splice( i, 1 );
					success = true;
					return false; /* early exit loop */
				}
			} );
		}
		return success;
	};

	/**
	 * Prevent ready objects from hanging around forever
	 */
	$.purgeReadyEvents = function () {
		ready = {};
	};

	/**
	 * Remove all subscriptions from everything
	 */
	$.purgeSubscriptions = function () {
		subs = {};
	};

} )( jQuery );
