/*-------------------------------
	Author: Armaan Ahluwalia
	Description : 
	mAjax is a jQuery plugin that can 
	easily convert your wordpress
	site ( or more generally any site) 
	to an ajax based application
	
	Dependencies : 
	jQuery, 
	jQuery History Plugin
--------------------------------*/			


(function($) {
			
	/*----------------
		mAjax Methods
	------------------*/			
			
	mAjax = {
		hasBeenInitialized : null,
		baseUrl : null,
		loading : null,
		complete : null,
		container : null,
		linkSelectors : null,
		getUrl : function(theUrl, theCallback, cb) {
			if(mAjax.loading) mAjax.loading();
			var getUrl = (cb) ? mAjax.cacheBuster(theUrl) : theUrl;
			$.get(getUrl, function(data) {
				theCallback(data);
			});	
		},
		getForm : function(url) {
			theHash = mAjax.getHash(url, mAjax.baseUrl);
			jQuery.history.load(theHash);
			return false;
		},
		getFormUrl : function(who){
 			return $(who).attr('action')  + '?'+ $(who).serialize();
		},
		getHash : function(theUrl, baseUrl) {
			theUrl = mAjax.stripProtocol(theUrl);
			baseUrl = mAjax.stripProtocol(baseUrl);
			theUrl = (theUrl) ? theUrl.replace(baseUrl, '') : theUrl;
			return theUrl;
		},
		cacheBuster : function(theUrl) {
			var o = (theUrl.indexOf('?') !== -1) ? theUrl + '&cb=' : theUrl + '?cb=';
			return o + new Date().getTime();
		},
		stripProtocol : function(theUrl) {
			if(!theUrl) return false;
			return theUrl.replace('http://','').replace('https://','').replace('www.','');
		},
		setupLinks : function() {
			
			/* Setup Links */
			var $links = [];
			$.each(mAjax.linkSelectors, function(index, value) {
				$.each($(value, mAjax.container), function(index, value){
					$links.push(value);
				});
			});
			$.each($links, function() {
				if($(this).is('form')) {
					$(this).submit(function(e) {
						e.preventDefault();
						mAjax.getForm(mAjax.getFormUrl(this));
					});
				} else {
					$(this).click(function(e) {
						e.preventDefault();
						var theUrl = $(this).attr('ajax-link');
						theUrl = (!theUrl) ? $(this).attr('href') : theUrl;
						if(!theUrl)	throw 'some link doesn\'t have an ajax-link or an href';
						theHash = mAjax.getHash(theUrl, mAjax.baseUrl);
						jQuery.history.load(theHash);
					});					
				}
			});
			
		},
		setupHashing : function() {
			/* History Plugin */

			$.history.init(function(hash){
					if(hash) {
						mAjax.getUrl(hash, mAjax.complete, true);
					} else {
						if(mAjax.hasBeenInitialized) mAjax.getUrl(mAjax.baseUrl, mAjax.complete);
					}
					mAjax.hasBeenInitialized = true;
			  },
			  { unescape: ",/?=" });
		},
		init : function (options) {
			options = (options) ? options : {};
			if(!options.complete) throw "missing a complete for mAjax. Cant continue";
			if(!options.baseUrl) throw "missing a baseUrl for mAjax. Cant continue";
			mAjax.baseUrl = options.baseUrl;
			mAjax.loading = options.loading;
			mAjax.complete = options.complete;
			mAjax.container = this;
			mAjax.linkSelectors = (options.linkSelectors) ? options.linkSelectors : 'a';
			mAjax.setupLinks();
			if(!mAjax.hasBeenInitialized) mAjax.setupHashing();
		}	
	};
	
	/*----------------
		Extend JQuery 
		Function
	------------------*/
	
	$.fn.mAjax = function(method) {
		if ( mAjax[method] ) {
      return mAjax[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return mAjax.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.mAjax' );
    }
	}
})(jQuery);