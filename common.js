(function($) {

	var dfd_preload,
			dfd_loadinganim,
			dfd_dataLoaded,
			data_received,
			onDataLoaded,
			loading,
			baseUrl,
			$target;
	
	/************************************
	 	VAR INITIALISATION
	************************************/	

	baseUrl = (window.location.href.indexOf('localhost') !== -1) ? "http://localhost:8888/DigidilBlog/" : "http://digi-dil.com/";	
	dfd_pageLoaded	= $.Deferred();
	
	/************************************
	 	COMMON SETUP STUFF
	************************************/
	
	$(document).ready(function() {
		
		$target= $('#main');		
		
		/*---------------------------------------
		Setup the deferreds so that if preload
		has taken place and ajax data has loaded
		( if it exists to be loaded ) then fire 
		the page has loaded callback events
		---------------------------------------*/		
		dfd_preload = preload($('.layout_inner'), function() {
				this.fadeTo(1000, 1);
		});
		checkPageLoaded();
		
		/*---------------------------------------
		Send mAjax to the pageloaded callback
		stack to be fired irrespective of what 
		page visitors land at
		---------------------------------------*/
		onLoad(function() {
			
			$('body').mAjax({
				baseUrl : baseUrl,
				loading : loading,
				complete : data_received
			});
			
			$('#loader').fadeTo(200, 0);			
		});	
		
	});
	
	/************************************
	 	COMMON FUNCTIONS
	************************************/	

	/*---------------------------------------
	Function to allow individual pages
	to add callback functions to the
	pageloaded event via the deferred
	---------------------------------------*/
	onLoad = function(func) {
		dfd_pageLoaded.done(function() { 
			func();
		});
	}
	
	/*---------------------------------------
	Function to fire when an AJAX call is
	made from mAjax
	---------------------------------------*/
	loading = function() {
		dfd_pageLoaded	= $.Deferred();
		dfd_loadinganim = $.Deferred();
		dfd_dataLoaded = $.Deferred();
		
		checkPageLoaded();
		
		$('#loader').delay(100).fadeTo(200, 1);
		$('#content').animate({marginLeft:"800px", opacity:0}, 400, 'swing', function() {
			dfd_loadinganim.resolve();
		});
	}	
	
	/*---------------------------------------
	Function to fire when mAjax returns
	data from an AJAX request
	---------------------------------------*/
	data_received = function(data) {

		dfd_loadinganim.done(function() {
		
			$target.css('margin-left','-800px');
			fillAndLoad($target, data, 
				function() { // Describe what we want once page setup is done
					$('#loader').fadeTo(200, 0);
					$target.show().animate({marginLeft:0, opacity:1}, 400, 'swing');
				}
			);
		});
	
	}

	
	/************************************
	 	HELPER FUNCTIONS 
	************************************/

	/*---------------------------------------
	Function to preload the contents of the
	page and return a deferred
	---------------------------------------*/
	var preload = function(target, callback) {
		
		$('#loader').fadeTo(200, 1); // Show loader		
		
		var dfd = $.Deferred().done(callback);
		resolveImages(target, dfd);
		return dfd;
	}

	/*---------------------------------------
	Function to load data into target and
	fulfill the AJAX loading deferred
	---------------------------------------*/
	
	var fillAndLoad = function(target, data, callback) {
		var $target = $(target);
		
		$target.html(data).hide();			
		resolveImages(target, dfd_dataLoaded);
		
		return dfd_dataLoaded.done( callback );
	}

	/*---------------------------------------
	Function to check if there is a 
	deferred for loading data via ajax 
	---------------------------------------*/

	function dataHasLoaded() {
		if(dfd_dataLoaded) return dfd_dataLoaded;
		return $.Deferred().resolve();
	};
	
	/*---------------------------------------
	Function to check if the changed page
	state has finished loading
	---------------------------------------*/	
	
	function checkPageLoaded() {	
		$.when(dfd_preload,
			dataHasLoaded()
		).then(function() {	
			dfd_pageLoaded.resolve();
		});
	}
	
	/*---------------------------------------
	Function for preloading images - 
	Resolves a passed in deferred object
	---------------------------------------*/

	function resolveImages(target, dfd) {	
		
		$imgs = $('img', target);
		
		if($imgs.length > 0) {
			
			/* If there are images on the page 
			to preload then go ahead and preload */			
			
			var imgCntr = $imgs.length;
			$.each($imgs, function() {
					_im = $(this).load(function(){ 
						$(this).fadeIn('fast', function() {
							imgCntr--;
							if (imgCntr <=0) {
								dfd.resolveWith(target);
							}
						}); 
					});
			});
		} else {
			
		/* Otherwise just resolve and fire whatever callback there is */

			dfd.resolveWith(target);
			
		}
	}
	
})(jQuery);