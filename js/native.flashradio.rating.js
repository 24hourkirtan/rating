/*
 * Native Flashradio Rating V1.16.03.14
 * https://github.com/24hourkirtan/rating
 *
 *
 * Copyright (C) SODAH | JOERG KRUEGER
 * http://www.sodah.de | http://native.flashradio.info
 * 
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory); // jQuery Switch
		// define(['zepto'], factory); // Zepto Switch
	} else {
		// Browser globals
		if(root.jQuery) { // Use jQuery if available
			factory(root.jQuery);
		} else { // Otherwise, use Zepto
			factory(root.Zepto);
		}
	}
}(this, function ($, undefined) {

	// Adapted from jquery.ui.widget.js (1.8.7): $.widget.bridge - Tweaked $.data(this,XYZ) to $(this).data(XYZ) for Zepto
	$.fn.flashradiorating = function( options ) {
		var name = "flashradiorating";
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $(this).data( name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $(this).data( name );
				if ( instance ) {
					instance.option( options || {} ); 
				} else {
					$(this).data( name, new $.flashradiorating( this, options ) );
				}
			});
		}
		return returnValue;
	};

	$.flashradiorating = function(element, options) {
		var idname = element.id;
		if ( arguments.length ) {
			this.element = $(element);
			this.options = $.extend(true, {},
				this.options,
				options
			);
			var self = this;
			this.element.bind( "remove.flashradiorating", function() {
				self.destroy();
			});
		}		

		//Settings
		var settings_loadinterval = options.loadinterval;
		var settings_streamurl = options.streamurl;
		var settings_scriptfolder = options.scriptfolder;

		//Container
		var divname;
		var container;
		var containerinside;

		//vars
		var rating_set = new Array();
		var rating_name = new Array();
		var rating_count = new Array();
		var rating_icon = new Array();
        var rating_iconsize = new Array();
		var rating_emptycolor = new Array();
		var rating_setcolor = new Array();
        var rating_overcolor = new Array();
		var rating_fontcolor = new Array();
        
        var song_current = "";
		var song_timer;
        var songinformationinterval = 20000;
        
        var scriptSource = "";
        if (settings_scriptfolder != undefined && settings_scriptfolder != ""){
        	scriptSource = settings_scriptfolder;
        } else {
        	scriptSource = urlofdoc("native.flashradio.rating.js");
        }

		$(document).ready(function() {
			ini(idname);
		});

		//###############################################################################
		//START
		//###############################################################################
		function ini(idname){
            divname = idname;
            if (settings_loadinterval != undefined && settings_loadinterval != ""){
                songinformationinterval = parseInt(settings_loadinterval);
            }
			
            if (settings_streamurl != undefined && settings_streamurl != ""){
                settings_streamurl = scriptSource + "currentsong.php?url=" + addhttp(settings_streamurl);
                load_settings();
            } else {
                container = document.getElementById(divname);
			    container.innerHTML = "ERROR - MISSING STREAM URL";
            }
            
		}		
		
		//###############################################################################
		//READ URL FROM JS-FILE
		//###############################################################################
		function urlofdoc ( jsfile ) {
		    var scriptElements = document.getElementsByTagName('script');
		    var i, element, myfile;
		        for( i = 0; element = scriptElements[i]; i++ ) {
		            myfile = element.src;
		            if( myfile.indexOf( jsfile ) >= 0 ) {
		                var myurl = myfile.substring( 0, myfile.indexOf( jsfile ) );
		            }
		        }
		    return myurl;
		}

		//###############################################################################
		//LOAD SETTINGS FROM XML
		//###############################################################################
		function load_settings() {
			var jqxhr = $.get(scriptSource + "native.flashradio.rating.settings.xml?hash="+Math.random(), function(d) {
				$(d).find('RATING').each(function(){
					if ($(this).attr("NAME") && $(this).attr("NAME") != "") {
						rating_set.push(0);							
						rating_name.push($(this).attr("NAME"));
						rating_count.push($(this).attr("COUNT"));
						rating_icon.push($(this).attr("ICON"));
                        rating_iconsize.push($(this).attr("ICONSIZE"));
						rating_emptycolor.push($(this).attr("EMPTYCOLOR"));
						rating_setcolor.push($(this).attr("SETCOLOR"));
						rating_overcolor.push($(this).attr("OVERCOLOR"));
						rating_fontcolor.push($(this).attr("FONTCOLOR"));
					}
				})
				iniDIV();
			})
			.done(function() { 
				//console.log("second success"); 
			})
			.fail(function() { 
				container = document.getElementById(divname);
		        container.innerHTML = "ERROR - XML FILE NOT FOUND";
			})
			.always(function() { 
				//console.log("finished"); 
			});
			jqxhr.always(function(){ 
				//console.log("second finished"); 
			});
		}
        
        //###############################################################################
		//SAVE RATING
		//###############################################################################
		function saveRATING(rating_name, rating_value) {
			//console.log(song_current, rating_name, rating_value);
            $.ajax({
                method: "POST",
                url: scriptSource + "native.flashradio.rating.php",
                data: { song: song_current, name: rating_name, set: rating_value }
            })
            .done(function( msg ) {
                //console.log("saved - " + msg);
            });
        }
        
		//###############################################################################
		//INITIAL DIV
		//###############################################################################
		function iniDIV() {
			container = document.getElementById(divname);
			container.innerHTML = "";
			container.style.overflow = "hidden";
			container.style.display = "block";

			containerinside = document.createElement("div");
			containerinside.id = divname + "_containerinside";
			containerinside.style.position = "relative";
			containerinside.style.left = "0px";
			containerinside.style.top = "0px";
			containerinside.style.height = "100%";
			containerinside.style.width = "100%";
			container.appendChild(containerinside);

			for( var x = 0; x < rating_name.length; x++ ) {
				iniRATING(x);
			}
            
            song_load();
			song_timer = setInterval(function(){ 
				song_load(); 
			}, songinformationinterval);
		}

		//###############################################################################
		//INITIAL RATING
		//###############################################################################
		function iniRATING(x) {
			var ratingsDIV = document.createElement("div");
            ratingsDIV.id = divname + "_ratings_" + x;
			containerinside.appendChild(ratingsDIV);
            $('#' + divname + "_ratings_" + x).append('<p style="color:' + rating_fontcolor[x] + '">' + rating_name[x] + '</p>').data("rating", 0);
			for(var y = 1; y <= parseInt(rating_count[x]); y++ ) {
				var ratingDIV = document.createElement("i");
				ratingDIV.id = divname + "_ratings_" + x + "_" + y;
                ratingDIV.title = y.toString();	
				ratingsDIV.appendChild(ratingDIV);
                $('#' + divname + "_ratings_" + x + "_" + y).data("ratingsid", x).data("ratingnumber", y);
				$('#' + divname + "_ratings_" + x + "_" + y).css({
					"cursor": "pointer",
					"text-shadow" : "0px 1px 2px rgba(0, 0, 0, 0.5)",
                    "font-size" : rating_iconsize[x] + "px", 
					"color" : rating_emptycolor[x]
				}).addClass(rating_icon[x]);
                
				ratingDIV.onmouseover = function(ev) {
                    overRATING($(this).data("ratingsid"), $(this).data("ratingnumber"));
					return false;
				};
				ratingDIV.onmouseout = function(ev) {
                    outRATING($(this).data("ratingsid"), $(this).parent().data("rating"));
				};
				ratingDIV.onclick = function(ev) {
                    $(this).parent().data("rating", $(this).data("ratingnumber"));
                    clickRATING($(this).data("ratingsid"), $(this).data("ratingnumber"));
                    saveRATING(rating_name[$(this).data("ratingsid")], $(this).data("ratingnumber"));
					return false;
				};
			}
		}
        //###############################################################################
		//DISPLAY MOUSE OVER RATING
		//###############################################################################
        function overRATING(x,y){
            var z;
            for(z = 1; z <= parseInt(rating_count[x]); z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_emptycolor[x]
				});
            }
            for(z = 1; z <= y; z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_overcolor[x]
				});
            }
        }
        //###############################################################################
		//DISPLAY MOUSE OUT RATING
		//###############################################################################
        function outRATING(x,y){
            var z;
            for(z = 1; z <= parseInt(rating_count[x]); z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_emptycolor[x]
				});
            }
            for(z = 1; z <= y; z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_setcolor[x]
				});
            }
        }
        //###############################################################################
		//DISPLAY MOUSE ON-CLICK RATING
		//###############################################################################
        function clickRATING(x,y){
            var z;
            for(z = 1; z <= parseInt(rating_count[x]); z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_emptycolor[x]
				});
            }
            for(z = 1; z <= y; z++ ) {
                $('#' + divname + "_ratings_" + x + "_" + z).css({
					"color" : rating_setcolor[x]
				});
            }
        }
        
        //###############################################################################
		//RESET ALL RATING ON NEXT SONG
		//###############################################################################
        function resetRATING(){
            for( var x = 0; x < rating_name.length; x++ ) {
                 $('#' + divname + "_ratings_" + x).data("rating", 0);
                for(var y = 1; y <= parseInt(rating_count[x]); y++ ) {
                    $('#' + divname + "_ratings_" + x + "_" + y).css({
                        "color" : rating_emptycolor[x]
                    });
                }
            }
        }

		//##############################################################################
		//LOAD SONG
		//###############################################################################
		function song_load() {
			//console.log(settings_streamurl);
            var jqxhr = $.get(settings_streamurl, function(data) {										
                if (song_current != data) {
                    song_current = data;
                    resetRATING();
                    //console.log(song_current);
                }
            })
            .done(function() { 
                //console.log("second success"); 
            })
            .fail(function() { 
                //console.log("error"); 
            })
            .always(function() { 
                //console.log("finished"); 
            });
            jqxhr.always(function(){ 
                //console.log("second finished"); 
            });
        
		}
		//###############################################################################
		//returnfalse
		//###############################################################################
		function returnfalse() {
		    return false;
		}
        
		//###############################################################################
		//CHECK HTTP OR HTTPS
		//###############################################################################
		function addhttp(url) {
		   if (!/^(f|ht)tps?:\/\//i.test(url)) {
		      url = "http://" + url;
		   }
		   return url;
		}
		//###############################################################################
		//removeLastSlash / or /;
		//###############################################################################
		function removeLastSlash(url) {		   
		   if (url.slice(url.length-1, url.length) == "/") {
		   		url = url.slice(0, url.length-1);
		   }
		   if (url.slice(url.length-2, url.length) == "/;") {
		   		url = url.slice(0, url.length-2);
		   }
		   return url;
		}
	};
}));