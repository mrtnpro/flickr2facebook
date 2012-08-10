/*
* ----------------------------- Flickr2Facebook -------------------------------------
* Simply upload Flickr photos to Facebook with Drag and Drop 
*
* Copyright (c) 2012 Martin Wessely, me@creativehead.at
* Project homepage: www.flickr2facebook.com
*
* Licensed under MIT-style license:
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

(function(){

    // check if user is on flickr.com #TODO: put if statement to bookmarklet link
    if(window.location.href.indexOf("flickr.com") == -1 ) {
    	alert('Ooops! \n This bookmarklet only works at www.flickr.com.');
    	return;
    }
	
  // check if bookmarklet already is running #TODO: put if statement to bookmarklet link
  if(document.getElementById("f2f-overlay") != null) {
  	alert('Ooops! \n Looks like Flickr2Facebook is already running.');
    return;
  }
  
  

		
	console.log('init Flickr2Facebook ...');	
	
	var libraries = [
		'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
		'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js',
		'https://raw.github.com/andris9/jStorage/master/jstorage.min.js'
	];
	
	var dependencies = {
		fbApi: 'http://connect.facebook.net/en_US/all.js',
		css: 'http://crtvhd.crux.uberspace.de/flickr2facebook/css/style.css'
	};
	
	var originalPageSettings = {};
	originalPageSettings['paddingTop'] =  document.getElementsByTagName('body')[0].style.paddingTop;
	
	var mouse_over_drop = false;
	
	var minimizedHeight = 70;
	
	var dropHeight = 220;
	var dropWidth = 220;
	
	var firstUpload = true;
	
	function loadLibraries(){
		if (libraries.length === 0) {
		  initFlickr2Facebook();
		  return;
		}
	
		var done = false;
		var script = document.createElement("script");
		script.src = libraries.shift();
		script.async = true;
		script.onload = script.onreadystatechange = function(){
		  if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
		    done = true;
		    loadLibraries();
		  }
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	function loadCSS() {
		var done = false;
		var script = document.createElement("link");
		script.rel = "stylesheet";
		script.href = dependencies['css'];
		script.async = true;
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				//initFlickr2Facebook();				
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	loadCSS();
	loadLibraries();
	
	// init bookmarklet
	function initFlickr2Facebook () {
		
		var session = getSession();
			
		var htmlBase = '\
			<div id="f2f-overlay">\
				<div id="f2f-workingarea">\
				    <div class="f2f-fluid-left">\
    					<div id="f2f-dropzone" data-state="closed">\
    						<!-- drops come here -->\
    						<div class="drop-indicator">\
    							<div class="center">\
    								<b>Drop your photos here</b>\
    								<span>' + ((jQuery.isArray(session)) ? '<i>' + session.length + '</i> photos already dropped' : 'You dropped no photo so far') + '</span>\
    							</div>\
    						</div>\
    					</div>\
    				</div>\
    				<div class="f2f-fluid-right">\
    					<div id="f2f-facebook">\
    						<div class="protector"></div>\
    				        <div class="init-facebook buttonbar">\
    				        	<a id="init-facebook" class="button" href="#">Start editing your photos</a>\
    				        	<a class="close-bookmarklet" href="#">or close this bookmarklet</a>\
    				        </div>\
    				        <div class="auth-facebook buttonbar" >\
    				        	<a id="auth-facebook" class="button" href="#">Authenticate with facebook</a>\
    				        	<span>In order to use this app you need to authenticate with facebook</span>\
    				        </div>\
    				        <form class="album-settings" >\
    				        	<div class="status">Connecting to Facebook ...</div>\
    				        	<div class="profile">\
    				        		<div class="profile-pic"></div>\
    				        		<div class="fb-user">\
    				        			<h2>User Name</h2>\
    				        			<div class="change-user">Not you? <a href="#" id="f2f-logout">Change account</a></div>\
    				        		</div>\
    				        	</div>\
    				        	<div class="album-information">\
    				        		<input type="text" id="album-name" placeholder="Your album name" />\
    				        		<textarea id="album-description" placeholder="Your album description"></textarea>\
    				        	</div>\
    				        	<div class="album-url">\
    				        		<div class="switch">\
    				        			<a class="toggle" data-state="off" id="add-to-photo" href="#" title="Toggle me"></a>\
    				        			<span>Add gallery link to each photo</span>\
    				        		</div>\
    				        		<div class="switch">\
    				        			<a class="toggle" data-state="off" id="add-to-album" href="#" title="Toggle me"></a>\
    				        			<span>Add gallery link to album description</span>\
    				        		</div>\
    				        		<input type="text" id="album-url" placeholder="e.g. www.flickr.com/photos/[username]" disabled="disabled" />\
    				        	</div>\
    				        	<div class="buttonbar">\
    				        		<a id="init-upload" class="button" href="#">Upload to Facebook</a>\
    				        		<a class="close-bookmarklet" href="#">or close this bookmarklet</a>\
    				        	</div>\
    				        </form>\
    					</div>\
    				</div>\
				</div>\
			</div>';
			
		
		dragifyFlickrPhotos();
	
		$('body').append($(htmlBase));
		
		
		
		
		// set up dropzone
		initDropzone();
	
		// first slide down page, second fade in overlay, third load session
		var preload = $('<img />').attr('src', '//d26ecy1es9i5xz.cloudfront.net/images/backgrounds/wood-b49ee40a3eaafaa599b1758f4a3253acb944fc18-gz.jpg');
		$('body').animate({
			'padding-top' : 96
		}, 700, 'easeInOutQuart', function(){
			$('#f2f-overlay').css('display', 'block').animate({
				'opacity' : 1
			}, 300, 'easeInOutQuart');
		});
		
		
		// make flickr photos draggable	
		function dragifyFlickrPhotos(){	
		
			$('#photo-drag-proxy, .facade-of-protection').remove();  
			  
			$('img').not('.drop-src, .buddyicon, .BuddyIconX').each( function (e){
				var source = $(this).attr('src');
			
				if (typeof source !== 'undefined' && source.indexOf('staticflickr.com') != -1) {		
					// add move cursor and append drag handler
					$(this).css({
						cursor : 'move'
					}).attr({ 
						title : 'Drag me to your album'}
					).draggable({
						appendTo: "body",
						helper: "clone",
						cursor: "move", 
						cursorAt: { top: 30, left: 30 } 
					});
				}
				
			});
		
		}
		
		//read session
		function getSession(){
			// return local storage
			try {
				 return JSON.parse($.jStorage.get('f2f-droped-photos'));
			} catch(e) {
				return null;
			}
		}
		
		//prevent duplicates in dropzone
		function preventDuplicates(id){
			
			// read local storage
			var session = getSession();
			
			// check if current photo id already exists in session
			if(jQuery.isArray(session)){
				for(var i = 0; i < session.length; i++){
					if(session[i].original == id)
						return false;
				}
			}
			
			// drop does not exist in session
			return true;
		}
		

		// remove drop from session
		function removeFromSession(id){
			
			// read local storage
			var session = getSession();
						
			// search for current photo is in session and remove
			for(var i = 0; i < session.length; i++){
				if(session[i].original == id){
					session.splice(i,1);
				}
			}
			
			// save changes
			$.jStorage.set('f2f-droped-photos', JSON.stringify(session));			

		}
		
		// add drop to session
		function addToSession(id, thumb, highRes, description){
		
			// Y?
			thumb = thumb.toString();
			
			// create object of drop
			var update = {
			  source: thumb,
			  highRes: highRes,
			  description: description,
			  original: id
			};
			
			// add object to session
			var session = (getSession() == null) ? [] : getSession();
			session[session.length] = update;
						
			// write drop data in local storage
			$.jStorage.set('f2f-droped-photos', JSON.stringify(session));
			
			// update drop count
			if($('.drop-indicator span i').length == 0){
				$('.drop-indicator span').empty().append('<i>' + session.length + '</i> photos already dropped');
			}else{
				$('.drop-indicator span i').text(session.length);
			}
		}
		
		
		// load session and append to dropzone
		function loadSession(){
			
			// read local storage
			var session = getSession();
      if (session == null) return;

			// add drops to dropzone
			for(var i = 0; i < session.length; i++){
				appendDrop(session[i].original, session[i].source, session[i].highRes, session[i].description); 
			}	
		}
		
		function clearSession(){
			$.jStorage.deleteKey('f2f-droped-photos');
		}
		
		// append drop to dropzone
		function appendDrop(id, thumb, highRes, description){
						
			// build html and append
			var item = $('\
				<div class="drop ui-selectee">\
					<div class="drop-preview">\
						<div class="drop-image">\
							<img class="drop-src" src="' + thumb + '"/>\
							<div class="loader"></div>\
							<a class="drop-delete" title="Remove" href="#"><span>[x]</span></a>\
						</div>\
					</div>\
					<div class="drop-meta">\
						<textarea class="description" rows="1" title="Description" placeholder="Add a description" wrap="off">' + description + '</textarea>\
						<input type="hidden" id="highRes" name="highRes" class="highRes" value="' + highRes +'">\
						<input type="hidden" id="dropId" name="dropId" class="dropId" value="' + id + '">\
					</div>\
				</div>')
			.appendTo('#f2f-dropzone');
      
			
			// add delete functionality to current drop
			addDeleteDropHandler();
			updateCurrentSelection();
			
			$("#f2f-dropzone").scrollTop($("#f2f-dropzone").get(0).scrollHeight - dropHeight);
			
		}
		
		
		// use flickr api to get all photos sizes of a flickr photo
		function getPhotoSizes(id, description){
		
			// ["Square", "Large Square", "Thumbnail", "Small", "Small 320", "Medium", "Medium 640", "Medium 800", "Large", "Large 1600"]
			$.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=3d4c2cd9b91afa47c3447b552f709d00&photo_id=' + id + '&format=json&nojsoncallback=1', function(data) {
				
				// save path to thumbnail
				thumb = jQuery.map(data['sizes'].size, function(o) {
					 if(o.label === 'Small') 
					     return o.source;
				});
				
				// save path to highest resolution available
				highRes = data['sizes'].size[data['sizes'].size.length-1].source;
				
				// if edit mode on, add drop to dropzone
				if($('#f2f-dropzone').attr('data-state') == 'opened')
					appendDrop(id, thumb, highRes, description);
					
				// add photo to session
				addToSession(id, thumb, highRes, description);

			});
		}
		
		
		// ultra complex animation for expanding working area
		function expandDropzone(){
		
			// calculate how many drop fit in a row and how many rows exist
			var dropsInRow = Math.floor( $('#f2f-dropzone').width() / $('.drop').width() );
			var numberOfRows = Math.ceil( $('.drop').length / dropsInRow );
		
			// expand dropzone to height of 2 rows or more
			if(numberOfRows > 2){
				var newHeight = dropHeight * numberOfRows;
				var maxHeight = (newHeight > $(window).height()-100) ? $(window).height()-100 : newHeight;
			}else{
				maxHeight = 2 * dropHeight;
			}
			

			$('#f2f-dropzone').stop().animate({ 
				height : maxHeight 
			}, 800, 'easeInOutQuart', function(){
    			 if(!firstUpload)
					$('#f2f-facebook .album-settings').addClass('loaded');
			}).attr('data-state', 'opened'); 
			$('body').stop().animate({ 
				paddingTop : (maxHeight+26) 
			}, 800, 'easeInOutQuart'); 	
			

			
		}
		
		// update topbar with current selected items
		function updateCurrentSelection(location){
			if(typeof location != 'undefined')
				$('.selection #current').text($('.drop' + location).length);
			$('.selection #total').text($('.drop').length);
		}
		
		// make drop deletable
		function addDeleteDropHandler(){
			$('.drop-delete').click(function(e){
				e.preventDefault();
				$(this).closest('.drop').stop().fadeOut('500', function(){
					removeFromSession($(this).closest('.drop').find('#dropId').val());
					$(this).remove();
				});
			});
		}
		
		// validate upload form
		function validateUploadForm(){
		
			if($('#album-name').val() == ''){
				alert('Ooops! Looks like you forgot to give your album a name.');
				return false;
			}else if($('#album-description').val() == ''){
				alert('Ooops! Looks like you forgot to give your album a description.');
				return false
			}else if($('.toggle[data-state="on"]').length > 0 && $('#album-url').val() == ''){
				alert('Ooops! Looks like you forgot to add an URL to your album.');
				return false
			}else{
				return true;
			}
					
		}
		

		// trigger facebook init
		function run_fb(){
		
			// check if flickr api is already loaded
			var isFacebookified = function () {
		        return typeof window.FB === 'object';
		    };
		    
		    if (isFacebookified()) {
		    	// connect to facebook
		        fb_connect();
		     } else {	
		    	var root_node = document.createElement('div');
		    	root_node.id = 'fb-root';
		    	document.getElementsByTagName('body')[0].appendChild(root_node);
		    	
		        var js = document.createElement('script');
		        js.id = 'facebook-jssdk';
		        js.async = true;
		        js.src = dependencies['fbApi'];
		        js.onreadystatechange = js.onload = function () {
		        	// connect to facebook
			        fb_connect();
			    };
		        document.getElementsByTagName('head')[0].appendChild(js);
		    }
		}
		
		// call FB.init and get login status
		function fb_connect(){
            
            // facebook connect configuration
			window.fbAsyncInit = function() {
			    FB.init({ appId: '353631031369003', 
			        status: true, 
			        cookie: true,
			        xfbml: true,
			        oauth: true
				});
						    
			    // run once with current status and whenever the status changes
			    FB.getLoginStatus(updateFacebookUI);
			    FB.Event.subscribe('auth.statusChange', updateFacebookUI);	
			};
	
	    }
	    
	    function updateFacebookUI(response) {
	        if (response.authResponse) {
	            //user is already logged in and connected
	            FB.api('/me', function(info) {
	                loginToFacebook(response, info);
	            });
	            
	        } else {
	            //user is not connected to your app or logged out
	            $('.album-settings').removeClass('init').removeClass('loaded');
	            $('.auth-facebook').addClass('init');
	            $('#auth-facebook').click(function(){
			    	FB.login(function(response) {
	                    if (response.authResponse) {
	                        FB.api('/me', function(info) {
	                            loginToFacebook(response, info);
	                        });	   
	                    } else {
	                        //user cancelled login or did not grant authorization
	                    }
	                }, {scope:'status_update,publish_stream,user_about_me'});  	
			    });

	        }
	    }

		// try login to facebook
		function loginToFacebook(response, info){
		    if (response.authResponse) {
		        var accessToken = response.authResponse.accessToken;
		        $('.auth-facebook').removeClass('init');
		        $('#f2f-facebook .profile-pic').css('background-image', 'https://graph.facebook.com/' + info.id + '/picture');
		        $('#f2f-facebook .fb-user h2').text(info.name);
		        $('#f2f-facebook .album-settings').removeClass('init').addClass('loaded');
			}else{
				alert('Ooops! Looks like the facebook login didn\'t succeed');
			}
		}
		
		var uploadToFacebook;
		var alreadyUploaded = 0;
		var albumId = '';
		
		// create album and call upload method
		function initFacebookUpload(){
			
			blockUI();
			
			uploadToFacebook = getSession();
					    
		    var albumName = $('#album-name').val();
		    var albumMessage = $('#album-description').val();
		    if($('#add-to-album').attr('data-state') == 'on')
					albumMessage = albumMessage + '\n\n' + $('#album-url').val();
		                    
		    FB.api('/me/albums', 'post', { 
	        	name        : albumName,
	            message     : albumMessage
		                                    
		    }, function(response) {
		        
		        if (!response || response.error) {
		            alert('Ooops. There occured an error while uploading your photos to facebook :(');
		        } else {
		            albumId = response.id;
		            fb_upload_photo();
		        }
		    });				
	
		}
		
		function blockUI(){
			$('.drop').die().css({ opacity : 0.5 });
			$('.description').attr('disabled', 'disabled');
			$('#f2f-dropzone').selectable('disable').droppable('disable');
			$('.ui-selected').removeClass('ui-selected');
			$('#f2f-facebook').addClass('disabled').find('.protector').css({ height : $('#f2f-dropzone').height() });
			$('#init-upload').text('Uploading photos to Facebook ...');
		}
		
		function showSuccess(){
			firstUpload = false;
			$('.album-settings').removeClass('loaded');
			$('#f2f-facebook').removeClass('disabled');
			$('#f2f-dropzone .drop-indicator').css({ display : 'none' });
			$('#f2f-dropzone .drop').remove();
			$('#f2f-dropzone').animate({
				height : minimizedHeight
			}, 1000, 'easeInOutQuart', function(){
				var success = $('<div id="f2f-success"><span>Your photos have been uploaded to Facebook <a class="close-bookmarklet" href="#">Close</a></span></div>');
				$('#f2f-workingarea').addClass('uploadDone');
				$('#f2f-dropzone').append(success);
				$('#f2f-dropzone').unbind('mousedown').die();
			});
			
			$('body').animate({
				paddingTop : (minimizedHeight+26)
			}, 1000, 'easeInOutQuart');
			
		}
    
		// upload photos to album
		function fb_upload_photo(){

			if((uploadToFacebook.length) == (alreadyUploaded)){
				$('.uploading').removeClass('uploading').not('.uploaded').addClass('uploaded');
				clearSession();
				showSuccess();
				//alert('Voila. Your photos have been uploaded to facebook :)');
			}else{
				alreadyUploaded++;
				$('.uploading').removeClass('uploading').addClass('uploaded');
				//console.log($('#dropId[value="' + uploadToFacebook[alreadyUploaded-1].original + '"]').closest('.drop').find('.loader').css({ display : 'block' }));
				$('#dropId[value="' + uploadToFacebook[alreadyUploaded-1].original + '"]').closest('.drop').addClass('uploading');
				
				
				var imgURL = uploadToFacebook[alreadyUploaded-1].highRes;
				var imgDesc = uploadToFacebook[alreadyUploaded-1].description;
				if($('#add-to-photo').attr('data-state') == 'on')
					imgDesc = imgDesc + '\n\n' + $('#album-url').val();
									
				FB.api('/' + albumId + '/photos', 'post', {
				    message: imgDesc,
				    url: imgURL        
				}, function(response){
				    if (!response || response.error) {
				        alert('Ooops! Looks like there was an error with uploading: ' + imgURL);
				    } else {
				        fb_upload_photo();
				    }
				
				});
			}
		}
		
	    
	    // add select and sort functionality to dropzone
	    function extendDropzone(){
	    
	    	// make dropzone selectable
	    	$('#f2f-dropzone').selectable({
				selecting: function(event, ui) {
					// update current selection info on each drop added to selection
					updateCurrentSelection('.ui-selecting');
				},
				unselecting: function(event, ui) {
					// update current selection info on each drop added to selection
					updateCurrentSelection('.ui-selecting');
				},
				selected: function(event, ui){
					$('.drop textarea:focus').blur().attr('wrap', 'off');
				}
			});
	    }
	    
	    $('#init-facebook').live('click', function(e){
	    	e.preventDefault();
	    	
	    	$(this).parent().hide();
	    	$('.drop-indicator').hide();
	    	
	    	if(firstUpload){
		    	$('#f2f-facebook .album-settings').addClass('init');
		  
		    	run_fb();
		    	
		    	loadSession();
		    	expandDropzone();
		    	extendDropzone();
	    	}else{
	    		$('#f2f-success').remove();
	    		$('#init-upload').text('Upload to Facebook');
	    		$('#album-name').val('');
	    		$('#album-description').text('');
	    		$('#album-url').val('');
	    		$('.toggle').attr('data-state', 'off');
	    		expandDropzone();
		    	extendDropzone();
		    	
		    	
	    	}
	    	
	    	

		});
		
		$('.close-bookmarklet').live('click', function(e){
			e.preventDefault();
			$('#f2f-overlay').fadeOut(1000, function(){
				$(this).remove();
				$('body').animate({
					paddingTop : originalPageSettings['paddingTop']
				}, 1000, 'easeInOutQuart', function(){ 
					// detach events, clean up 	
				});
			});
		});
		
		$('#f2f-logout').live('click', function(e){
			e.preventDefault();
			FB.logout(function(response) {
                //user logged out
            });

		});
	    
		// trigger facebook upload
		$('#init-upload').live('click', function(e){
			e.preventDefault();
	    	if(validateUploadForm())
	    		initFacebookUpload();
	    });			
		
			
		// initialize dropzone
		function initDropzone(){
		
			//append drop handler to dropzone
			$('#f2f-dropzone').droppable({
				activeClass: 'ui-state-default',
				hoverClass: "ui-state-hover",
				tolerance: "pointer",
				over: function(event, ui) { // add placeholder when drop enters dropzone
					$(ui.helper).addClass('allowed');
					if($(this).attr('data-state') != 'closed' && $('.drop-placeholder').length == 0)
						$('<div class="drop-placeholder"/>').stop().fadeIn(300, 'easeInOutQuart').appendTo(this);
					// scroll to bottom when user enters dropzone
					$("#f2f-dropzone").scrollTop($("#f2f-dropzone").get(0).scrollHeight - dropHeight);
				},
				out: function(event, ui){ //remove placeholder when drop leaves dropzone
					$(ui.helper).removeClass('allowed');
					$('.drop-placeholder').stop().fadeOut(500, 'easeInOutQuart', function(){ $(this).remove(); });
				},
				drop: function( event, ui ) {
					$('.drop-placeholder').remove();
					if(!$(ui.draggable).hasClass('ui-sortable-helper')){
						var id = $(ui.draggable).attr('src') || '';
						id = id.split('/');
						id = id[id.length-1].split('_');
						id = id[0];
					
						// prevent duplicates in collection
						if(preventDuplicates(id)){
							// create dom for new drop and append to dropzone
							getPhotoSizes(id, (typeof ui.draggable.attr('alt') != 'undefined') ? ui.draggable.attr('alt') : '');
						}else{
							alert('This photo is already in your album.');
						}
					}
				}
			}).mousedown(function(e){
				// if command/windows key is pressed, add drop to selection
				if(e.metaKey && mouse_over_drop){
					$(e.target).closest('.drop').toggleClass('ui-selected');
					e.stopImmediatePropagation();
	                e.stopPropagation();
	                e.preventDefault();
	                return false;
				}
			});
			
			// add hover effect for drops when only when user is not drawing selection
			// jquery solution because of issue with css hover when drawing selection
			$('.drop')
	    	.live('mouseenter', function(e){
	    		mouse_over_drop=true; 
				if($('.ui-selectable-helper').length == 0){			
					$(this).css({ background : 'rgba(34,34,34,0.25)'})
							.find('.drop-delete').stop().fadeIn('300');
				}
	 		}).live('mouseleave', function(e){
	 			mouse_over_drop=false; 
				$(this).css({ background : 'none'})
						.find('.drop-delete').stop().fadeOut('300');
			});    	
			
			// blur textarea on click outside of any drop
			$("#f2f-dropzone").live('mousedown', function(){
				if(! mouse_over_drop) {
					$('.drop textarea:focus').blur().attr('wrap', 'off');
				}
			});	
							
			// select drop when textarea gets focus
			$('.drop textarea').live('focus', function(){
				$('.ui-selected').removeClass('ui-selected');
				$(this).attr('wrap', 'on').closest('.drop').addClass('ui-selected');
			});
			
			// save session when drop description loses focus
			$('.drop textarea').live('blur', function(){
				$(this).attr('wrap', 'off');
			});
			
			// save session when when user presses enter
			$('.drop textarea').live('keydown', function(e){
				if(e.which == 13 && e.shiftKey) {
					$(this).blur().attr('wrap', 'off');
				}
			});
			
			// select all drops when user presses command/windows + a
			$(document).live('keydown', function(e){
				if($('textarea[wrap="on"]').length === 0 && e.metaKey && e.keyCode == '65'){
					e.preventDefault();
					$('.drop').addClass('ui-selected');
				}
			});
			
			// on click clear session
			$('#clear-session').live('click', function(e){
				e.preventDefault();
				$('#f2f-dropzone').empty();
				$.jStorage.deleteKey('f2f-droped-photos');
			});
			
			// switch toggles
			$('#f2f-overlay .toggle').live('click', function(e){
				console.log('click');
				e.preventDefault();
				if($(this).attr('data-state') == 'off'){
					$(this).attr('data-state', 'on');
					$('#album-url').removeAttr('disabled');
				}else{
					$(this).attr('data-state', 'off');
					if($('.toggle[data-state="on"]').length == 0)
						$('#album-url').attr('disabled', 'disabled');
						
				} 
			});
			
		// END initDropzone()
		}
	}

// YOU REACHED THE FUCKING END. GRATS!
})();