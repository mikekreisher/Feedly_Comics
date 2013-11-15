// ==UserScript==
// @name       Feedly Comics
// @namespace  http://mikekreisher.com/
// @version    0.1
// @description  Enhances comics in Feedly
// @include http://cloud.feedly.com/
// @include http://cloud.feedly.com/*
// @include https://cloud.feedly.com/
// @include https://cloud.feedly.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js
// @copyright  2012+, You
// ==/UserScript==

var extension = false;

function is_comic(link) {

	var comics = {
		"http://3dbdotcom.com/"									: "3db",  // 3 Dollar Bill
		"http://abstrusegoose.com/" 							: "ag",   // Abstruse Goose
		"http://www.amazingsuperpowers.com/"            		: "asp",  // Amazing Super Powers
		"http://www.anticscomic.com/"                   		: "ant",  // Antics Comic
		"http://www.boatcrime.com/"                     		: "bc",   // Boat Crime
		"http://www.beeserker.com/"								: "bee",  // Beeserker
		"http://www.boxerhockey.com/"							: "bh",	  // Boxer Hockey
		"http://brawlinthefamily.keenspot.com/"         		: "bitf", // Brawl in the Family
		"http://www.channelate.com/"							: "c8",	  // Channelate
		"http://cowbirdsinlove.com/"							: "cil",  // Cowbirds in Love
		"http://www.explosm.net/comics/"                		: "ch",   // Cyanide & Happiness
		"http://corpseruncomics.com/"							: "crc",  // Corpse Run Comics
		"http://dairyboycomics.com/comic/"						: "db",	  // DairyBoy Comics
		"http://doctorkawaii.com/"								: "dk",	  // Doctor Kawaii
		"http://thedoghousediaries.com"						    : "dd",   // Doghouse Diaries
		"http://www.dumbingofage.com/"							: "doa",  // Dumbing of Age
		"http://extrafabulouscomics.com/"						: "efc",  // Extra Fabulous Comics
		"http://gunshowcomic.com/"                              : "gsc",  // Gun Show Comics
		"http://hijinksensue.com/"								: "he",   // Hijinx Ensue
		"http://www.geekculture.com/joyoftech/"                 : "jot",  // The Joy of Tech
		"http://legacy-control.com/comic/"						: "lc",	  // Legacy Control
		"http://www.leasticoulddo.com/"							: "licd", // Least I Could Do
		"http://www.leadpaintcomics.com/"						: "lpc",  // Lead Paint Comics
		"http://www.lukesurl.com/"				                : "ls",   // Luke Surl
		"http://loldwell.com/" 									: "lw",   // LOLd Well
		"http://mayoking.com/"									: "mayo", // Mayoking
        "http://mrlovenstein.com/" 								: "ml",   // Mr Lovenstein
        "http://www.mercworks.net/"								: "mw",	  // MercWorks
        "http://nedroid.com/" 									: "npd",  // Nedroid Picture Diary
		"http://www.nerdragecomic.com/"							: "nr",	  // Nerd Rage
        "http://www.nerfnow.com/"				 				: "nn",   // Nerf Now
		"http://www.nukees.com/"								: "nu",	  // Nukees
		"http://theoatmeal.com/"                                : "oat",  // The Oatmeal #NEEDS WORK
		"http://www.optipess.com/"								: "opt",  // Optipess
		"http://www.penny-arcade.com/"		                	: "pa",   // Penny Arcade
		"http://popstrip.com/"                                  : "ps",   // Popstrip
		"http://paintraincomic.com/"							: "pt",	  // Pain Train
		"http://robbieandbobby.com/"							: "rab",  // Robbie and Bobby
        "http://www.safelyendangered.com/comic/"				: "se",	  // Safely Endangered
        "http://www.samandfuzzy.com/"							: "saf",  // Sam and Fuzzy
		"http://www.smbc-comics.com/"                   		: "smbc", // SMBC
		"http://www.somethingpositive.net/"                     : "sp",   // Something Positive
		"http://www.stickycomics.com/"			          		: "sc",   // Sticky Comics
		"http://www.twogag.com/"								: "tgag", // Two Guys and Guy
		"http://vectorbelly.com/"								: "vb",	  // Vector Belly
		"http://www.victimsofcircumsolar.com/"					: "voc",  // Victims of Circumsolar
        "http://www.weregeek.com/"								: "wg",	  // Weregeek
		"http://xkcd.com/"                              		: "xkcd", // XKCD
        "http://www.zombieroomie.com/"							: "zr"	  // Zombie Roomie
		
	}
	for (var c in comics) {
		if ( link.match("^"+c) ) return comics[c];
	}
	return null;
}

function add_secrets(item_body, title, panel_src) {
    var stripped_id = $(item_body).attr('id').replace(/\W/g, '');
    var text_div_id = "text_" + stripped_id;
    var text_div = "<div id="+ text_div_id + " />";
	var div = $(text_div);
	if ( title ) div.append($("<p />").append(title).css("background", "#FFFFAD"));
	if ( panel_src ) {
		if ($.isArray(panel_src)){
			var pic;
			for(pic in panel_src){
				div.append($("<img />").attr("src", panel_src[pic]));
			}
		} else {
			div.append($("<img />").attr("src", panel_src));
		}
	}
    if($(('#' + text_div_id)).length == 0){
		$(item_body).after(div);
    }
}

function handle_response(data, item_body, title) {
	var panel_src = null;
	try {
		responseJSON = JSON.parse(data);
		panel_src = responseJSON.panel;
	} catch (e) {}
	
	if (panel_src || title) {
		add_secrets(item_body, title, panel_src);
	}
}

function ajax_panel(link, item_body, title) {
	link = "http://comic-helper.appspot.com/panel?link="+link;
	if ( extension ) {
		$.get(link, function(data) {
			handle_response(data, item_body, title);
		});
	} else {
		setTimeout(function() {
		GM_xmlhttpRequest({
			method: "GET",
			url: link,
			onload: function(response) {
				handle_response(response.responseText, item_body, title);
			}
		});
		}, 0);
	}
}

function get_extras(comic, item_body, link, metadata) {
	link = encodeURIComponent(link);
	var title = null;
	switch (comic) {
		case "ag":		// Abstruse Goose
		case "bc":		// Boat Crime
		case "cil":		// Cowbirds in Love
		case "dd":		// Doghouse Diaries
		case "gsc":		// Gun Show Comics
		case "lpc":		// Lead Paint Comics
		case "ls":		// Luke Surl
		case "lw":		// LOLd Well
		case "ml":		// Mr Lovenstein
		case "npd":		// Nedroid Picture Diary
		case "opt":		// Optipess
		case "ps":		// Popstrip
		case "vb":		// Vector Belly
		case "sc":		// Sticky Comics
		case "xkcd":	// XKCD
			title = $(item_body).find("img").attr("title");
			if (title) {
				add_secrets(item_body,title,null);
			}
			break;
			
		case "3db":		// 3 Dollar Bill
			var img = $(item_body).find("img");
			var panel = img.attr("src").replace("-150x150", "");
			if(panel != null){
				$(img).hide();
				add_secrets(item_body, null, panel);
			}
			break;
			
		case "ant":		// Antics Comic
			date_span = $(metadata).find("span[title*='published']");
            published_str = $(date_span).attr('title');
            var panel = ant_regex(link, published_str);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
			break;
			
		case "asp":		// Amazing Super Powers
			var img = $(item_body).find("img");
			title = img.attr("title");
			var panel = asp_regex(img.attr("src"));
			if ( panel != null ) {
				add_secrets(item_body,title,panel);
			}
			break;
			
		case "bee":		// Beeserker
			date_span = $(metadata).find("span[title*='published']");
            published_str = $(date_span).attr('title');
            var panel = bee_regex(link, published_str);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
			break;
		
		case "bh":		// Boxer Hockey
			var panel = bh_regex(link);
			if(panel != null){
				add_secrets(item_body, null, panel);
			}
			break;
			
		case "bitf":	// Brawl in the Family
			var panel = bitf_regex(link);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
			break;
			
		case "ch":		// Cyanide & Happiness
			ajax_panel(link, item_body, title);
			break;
			
		case "crc":		// Corpse Run Comics
            date_span = $(metadata).find("span[title*='published']");
            published_str = $(date_span).attr('title');
            var panel = crc_regex(link, published_str);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
			break;
			
		case "db":		// DairyBoy Comics
			img = $(item_body).find("img[src*='dairyboycomics.com']");
			src = $(img).attr("src");
			title = $(img).attr("title");
			var panel = db_regex(src);
			if(panel != null){
				add_secrets(item_body, title, panel);
				$(img).hide();
			}
			break;
			
		case "dk":		// Doctor Kawaii
			img = $(item_body).find("img[src*='doctorkawaii.com']");
			src = $(img).attr("src");
			title = $(img).attr("title");
			var panel = dk_regex(src);
			if(panel != null){
				add_secrets(item_body, title, panel);
				$(img).hide();
			}
			break;
			
		case "doa":		// Dumbing of Age
			img = $(item_body).find("img[src*='dumbingofage']");
			src = $(img).attr("src");
			var panel = doa_regex(src);
			title = $(item_body).find("img").attr("title");
			if (title && panel != null) {
				add_secrets(item_body,title,panel);
				img.hide();
			}
			break;
			
		case "efc":		// Extra Fabulous Comics
			img = $(item_body).find("img[src*='extrafabulouscomics']");
			src = $(img).attr("src");
			var panel = src.replace('-150x150', '');
			title = $(img).attr("alt");
			if(panel != null){
				$(img).hide();
				add_secrets(item_body, title, panel);
			}
			break;
			
        case "he":		// Hijinx Ensue
            img = $(item_body).find("img[src*='comics-rss']");
			if($(img).attr("src") == null ) {
				img = $(item_body).find("img[src*='uploads']");
			}
            src = $(img).attr("src");
            title = $(img).attr("title")
            var panel = he_regex(src);
            if(panel != null){
                add_secrets(item_body, title, panel);
            }
            $(img).hide();
            break;
			
		case "jot":		// The Joy of Tech
            var panel = jot_regex(link);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
			break;
		
		case "lc":		// Legacy Control
			img = $(item_body).find("img[src*='comics-rss']");
            src = $(img).attr("src");
            title = $(img).attr("title")
            var panel = lc_regex(src);
            if(panel != null){
                add_secrets(item_body, title, panel);
            }
            $(img).hide();
            break;
			
		case "licd":	// Least I Could Do
			img = $(item_body).find("img[src*='wp-content']");
			src = $(img).attr("src");
			var panel = licd_regex(src);
			var title = null;
			if (panel != null){
				img.hide();
				add_secrets(item_body, title, panel);
			}
			break;
			
		case "mayo":	// Mayoking
			link = $(item_body).find("a[href*='mayoking.com']");
			img = $(item_body).find("img");
			src = $(link).attr("href");
			var panel = mayo_regex(src);
			title = $(link).attr("title");
			if(panel != null){
				img.hide();
				add_secrets(link, title, panel);
			}
			break;
            
        case "mw":		// MercWorks
            date_span = $(metadata).find("span[title*='published']");
            published_str = $(date_span).attr('title');
            var panel = mw_regex(link, published_str);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
            break;
			
        case "nn":		// Nerf Now
            img = $(item_body).find("img[src*='comic']");
            src = $(img).attr("src");
            var panel = nn_regex(src);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
            $(img).hide();
            break;
			
		case "nr":		// Nerd Rage
			var panel = nr_regex(link);
			if(panel != null){
				add_secrets(item_body, null, panel);
			}
			break;
			
		case "nu":		// Nukees
			var panel = nu_regex(link);
			if(panel != null){
				add_secrets(item_body, null, panel);
			}
			break;
			
		case "pa":		// Penny Arcade
			var div_html = $(item_body).find("div").html();			
			var test = /New Comic/i;
			if (( div_html ) && ( test.test(div_html) )) {
				ajax_panel(link, item_body, null);
			}
			break;
			
		case "pt":		// Pain Train
			date_span = $(metadata).find("span[title*='published']");
            published_str = $(date_span).attr('title');
			var panel = pt_regex(link, published_str);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
			break;
			
		case "rab":		// Robbie and Bobby
			img = $(item_body).find("img[src*='robbieandbobby']");
			src = $(img).attr("src");
			var panel = rab_regex(src);
			title = $(img).attr("title");
			if(panel != null){
				img.hide();
				add_secrets(item_body, title, panel);
			}
			break;
            
        case "saf":		// Sam and Fuzzy
            var panel = saf_regex(link);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
            break;
            
        case "se":		// Safely Endangered
            img = $(item_body).find("img[src*='safelyendangered']");
			src = $(img).attr("src");
			var panel = se_regex(src);
			var title = null;
			if (panel != null){
				$(img).hide();
				add_secrets(item_body, title, panel);
			}
            break;
			
		case "smbc":	// SMBC
			var img = $(item_body).find("img");
			var panel = smbc_regex(img.attr("src"));
			if ( panel != null ) {
				add_secrets(item_body, null, panel);
			}
			break;
			
        case "sp":		// Something Positive
            var panel = sp_regex(link);
            if(panel != null){
                add_secrets(item_body, null, panel);
            }
            break;
			
		case "tgag":	// Two Guys and Guy
			img = $(item_body).find("img[src*='twogag']");
			src = $(img).attr("src");
			var panel = tgag_regex(src);
            title = $(img).attr("title");
			if(panel != null){
				add_secrets(item_body, title, panel);
				img.hide();
			}
			break;
			
		case "voc":		// Victims of Circumsolar
			img = $(item_body).find("img[src*='victimsofcircumsolar']");
			src = $(img).attr("src");
			var panel = voc_regex(src);
			if(panel != null){
				add_secrets(item_body, null, panel);
				img.hide();
			}
			break;
            
        case "wg":		// Weregeek
            var panel = wg_regex(link);
            if(panel != null){
            	add_secrets(item_body, null, panel);
            }
            break;
			
        case "zr":		// Zombie Roomie
            img = $(item_body).find("img[src*='comics-rss']").css('max-height', '0px');
            src = $(img).attr("src");
            add_secrets(item_body, null, src);
           	break; 
	}
}

var process_node = function(e){
    var entry_title_link = null;
    var entry_main 		 = null;
    var item_body 		 = null;
    var metadata 		 = null;
    
    
    $(e.target).find("div[class='u100Entry']").each(function(){
    	entry_main = $(this);
        $(entry_main).find("a.title").each(function(){
        	entry_title_link = $(this).attr("href");
        });
        $(entry_main).find("div[class='entryBody']").each(function(){
        	item_body = this;
        });
        $(entry_main).find("div.metadata").each(function(){
        	metadata = this;
        });
    });
    
    if(!entry_main || !entry_title_link || !item_body || !metadata){ return; }
    
    var comic = is_comic(entry_title_link);
    if(!comic){return;}
    get_extras(comic, item_body, entry_title_link, metadata);
}

function go(){
    $(document).on('DOMNodeInserted', process_node);
    //document.body.addEventListener('DOMNodeInserted', process_node, false);
}

go();

function get_month(mon){
	var month = "";
	switch(mon){
		case "Jan":
            month = "01";
            break;
        case "Feb":
            month = "02";
            break;
        case "Mar":
            month = "03";
            break;
        case "Apr":
            month = "04";
            break;
        case "May":
            month = "05";
            break;
        case "Jun":
            month = "06";
            break;
        case "Jul":
            month = "07";
            break;
        case "Aug":
            month = "08";
            break;
        case "Sep":
            month = "09";
            break;
        case "Oct":
            month = "10";
            break;
        case "Nov":
            month = "11";
            break;
        case "Dec":
            month = "12";
            break;
    }
	return month;
}

function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function ant_regex(src, str){
    var date_re = new RegExp(/published:.*, (\d{2}) (\w{3}) (\d{4}) \d{2}:\d{2}:\d{2} GMT -- received: .*/);
    var src_re  = new RegExp(/(http:\/\/www\.anticscomic\.com)\/.*/);
    var date_match = date_re.exec(str);
    var src_match  = src_re.exec(decodeURIComponent(src));
    var panel = null;
	console.log("*******************" + decodeURIComponent(src));
    if(date_match != null && src_match != null){
        var month = get_month(date_match[2]);
    	panel = src_match[1] + "/comics/" + date_match[3] + "-" + month + "-" + date_match[1] + ".jpg";
    }
    return panel;
}

function asp_regex(src) {
	/*
	Perform the regular expression to translate from a given comic source
	url, into it's associated hidden comic for amazingsuperpowers.com
	This is stored in common.js so that it can be used in the files for
	the ASP home page, as well as in Google Reader
	*/
	var re = new RegExp(/http:\/\/www\.amazingsuperpowers\.com\/comics(-rss)?\/(\d{4}-\d{2}-\d{2})-.*\.png/);
	var match = re.exec(src);
	var panel = null;
	if (match != null) {
		panel = "http://www.amazingsuperpowers.com/hc/comics/" + match[2] + ".jpg";
	}
	return panel;
}

function bee_regex(src, str){
    var date_re = new RegExp(/published:.*, (\d{2}) (\w{3}) (\d{4}) \d{2}:\d{2}:\d{2} GMT -- received: .*/);
    var src_re  = new RegExp(/(http:\/\/www\.beeserker\.com)\/.*/);
    var date_match = date_re.exec(str);
    var src_match  = src_re.exec(decodeURIComponent(src));
    var panel = null;
	console.log("*******************" + decodeURIComponent(src));
    if(date_match != null && src_match != null){
        var month = get_month(date_match[2]);
    	panel = src_match[1] + "/comics/" + date_match[3] + "-" + month + "-" + date_match[1] + "-beeserker.png";
    }
    return panel;
}

function bh_regex(src){
	var re = new RegExp(/http:\/\/www\.boxerhockey\.com\/\?id=(.*)/);
	var match = re.exec(decodeURIComponent(src));
    var panel = null;
	if(match != null){
		panel = "http://boxerhockey.fireball20xl.com/img/comic/" + match[1] + ".png";
	}
    return panel;
}

function bitf_regex(src){
	var re = new RegExp(/http:\/\/brawlinthefamily\.keenspot.com\/(\d{4})\/(\d{2})\/(\d{2})\/(\d+)-(.*)\//);
	var match = re.exec(decodeURIComponent(src));
	var panel = null;
	if(match != null){
		var comic_title = "";
		for each(var word in match[5].split('-')){
			comic_title += capitalizeFirstLetter(word);
		}
		panel = "http://cdn.brawlinthefamily.keenspot.com/comics/" + match[1] + "-" + match[2] + "-" + match[3] + "-" + match[4] + "-" + comic_title + ".jpg";
	}
	return panel;
}

function crc_regex(src, str){
    var date_re = new RegExp(/published:.*, (\d{2}) (\w{3}) (\d{4}) \d{2}:\d{2}:\d{2} GMT -- received: .*/);
    var src_re  = new RegExp(/(http:\/\/corpseruncomics\.com)\/.*\//);
    var date_match = date_re.exec(str);
    var src_match  = src_re.exec(decodeURIComponent(src));
    var panel = null;
    if(date_match != null && src_match != null){
        var month = get_month(date_match[2]);
    	panel = src_match[1] + "/comics/" + date_match[3] + "-" + month + "-" + date_match[1] + "-amd_corpse_run_" + date_match[3].slice(2) + "_" + month + "_" + date_match[1] + ".png";
    }
    return panel;
}

function db_regex(src){
	var re = new RegExp(/http:\/\/dairyboycomics.com\/wp-content\/uploads\/(.+)-150x150.jpg/);
	var match = re.exec(src);
	var panel = null;
	if(match != null) {
		panel = "http://dairyboycomics.com/wp-content/uploads/"+ match[1] +".jpg";
	}
	return panel;
}

function dk_regex(src){
	var re = new RegExp(/http:\/\/doctorkawaii.com\/wp-content\/uploads\/(.+)-150x150.jpg/);
	var match = re.exec(src);
	var panel = null;
	if(match != null) {
		panel = "http://doctorkawaii.com/wp-content/uploads/"+ match[1] +".jpg";
	}
	return panel;
}

function doa_regex(src){
	var re = new RegExp(/(http:\/\/www\.dumbingofage\.com\/comics)-rss\/(.*)/);
	var match = re.exec(src);
	var panel = null;
	if(match != null){
		panel = match[1] + "/" + match[2];
	}
	return panel;
}

function he_regex(src){
    var re = new RegExp(/http:\/\/hijinksensue\.com\/comics-rss\/(.+)/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://hijinksensue.com/comics/"+match[1];
    } else {
		re = new RegExp(/http:\/\/hijinksensue.com\/wp-content\/uploads\/(.+)-\d{3}x\d{3}\.jpg/);
		match = re.exec(src);
		if(match != null) {
			panel = "http://hijinksensue.com/wp-content/uploads/"+match[1]+".jpg";
		}
	}
    return panel;
}

function jot_regex(src) {
    var re = new RegExp(/http:\/\/www\.geekculture\.com\/joyoftech\/joyarchives\/(\d+)\.html/);
    var match = re.exec(decodeURIComponent(src));
    var panel = [];
    if(match != null) {
        panel.push("http://www.geekculture.com/joyoftech/joyimages/"+match[1]+".gif");
		panel.push("http://www.geekculture.com/joyoftech/joyimages/"+match[1]+".jpg");
    }
    return panel;
}

function lc_regex(src){
    var re = new RegExp(/http:\/\/legacy-control\.com\/comics-rss\/(.*)/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://legacy-control.com/comics/"+match[1];
    } 
    return panel;
}

function licd_regex(src){
	var re = new RegExp(/http:\/\/.*\.com\/(wp-content\/uploads\/.*)[-180x60]*\.gif/);
	var match = re.exec(src);
	var panel = null;
	if (match != null){
        panel = "http://licd.com/" + match[1] + ".gif";
	}
	return panel;
}

function mayo_regex(src){
	var re = new RegExp(/http:\/\/mayoking\.com\/(.*)\/(.*)\/(.*)\/(.*)\//);
	var match = re.exec(src);
    var panel = null;
	if(match != null){
		panel = "http://mayoking.com/comics/" + match[1] + "-" + match[2] + "-" + match[3] + "-" + match[4].replace("-","_") + ".png";
	}
    return panel;
}

function mw_regex(src, str){
    var date_re = new RegExp(/published:.*, (\d{2}) (\w{3}) (\d{4}) \d{2}:\d{2}:\d{2} GMT -- received: .*/);
    var src_re  = new RegExp(/(http:\/\/www\.mercworks\.net)\/(.*)\//);
    var date_match = date_re.exec(str);
    var src_match  = src_re.exec(decodeURIComponent(src));
    var panel = null;
    if(date_match != null && src_match != null){
        var month = get_month(date_match[2]);
    	panel = src_match[1] + "/comics/" + date_match[3] + "-" + month + "-" + date_match[1] + "-" + src_match[2] + "-final.png";
    }
    return panel;
}

function nn_regex(src){
    var re = new RegExp(/http:\/\/www\.nerfnow\.com\/comic\/thumb\/(\d+)\/large/);
    var match = re.exec(src);
    var panel = null;
    if(match != null) {
        panel = "http://www.nerfnow.com/comic/image/"+match[1];
    }
    return panel;
}

function nr_regex(src){
	var re = new RegExp(/http%3A%2F%2Fwww\.nerdragecomic\.com%2Findex\.php%3Fdate%3D(.*)/);
	var match = re.exec(src);
	var panel = null;
	if(match != null){
		panel = "http://www.nerdragecomic.com/strips/"+match[1]+".jpg";
	}
	return panel;
}

function nu_regex(src){
	var re = new RegExp(/http%3A%2F%2Fwww\.nukees\.com%2Fd%2F(.*)\.html/);
	var match = re.exec(src);
	var panel = null;
	if(match != null){
		panel = "http://www.nukees.com/comics/nukees"+match[1]+".gif"
	}
	return panel;
}

function pt_regex(src, str){
    var date_re = new RegExp(/published:.*, (\d{2}) (\w{3}) (\d{4}) \d{2}:\d{2}:\d{2} GMT -- received: .*/);
    var src_re  = new RegExp(/(http:\/\/paintraincomic\.com)\/(.*)\//);
    var date_match = date_re.exec(str);
    var src_match  = src_re.exec(decodeURIComponent(src));
	
	var comic_title = "";
	for each(var word in src_match[2].split("-")){
		comic_title += capitalizeFirstLetter(word);
	}
    var panel = null;
    if(date_match != null && src_match != null){
        var month = get_month(date_match[2]);
    	panel = src_match[1] + "/comics/" + date_match[3] + "-" + month + "-" + pad((parseInt(date_match[1]) + 1), 2) + "-" + comic_title + ".jpg";
    }
    return panel;
}

function rab_regex(src){
    var panel = src.replace("comics-firstpanel", "comics");
    return panel;
}

function saf_regex(src){
	var re = new RegExp(/http%3A%2F%2Fwww\.samandfuzzy\.com%2F(\d*)/);
    var match = re.exec(src);
    var panel = null;
    if(match != null){
        var zeros = "00000000";
        var comic_no = (zeros + match[1]).substring(match[1].length);
    	panel = "http://samandfuzzy.com/comics/"+ comic_no +".gif";
    }
    return panel;
}

function se_regex(src){
	var re = new RegExp(/(http:\/\/www\.safelyendangered.com\/wp-content\/uploads\/.*)-150x150\.png/);
	var match = re.exec(src);
	var panel = null;
	if (match != null){
		panel = match[1] + ".png";
	}
	return panel;
}

function smbc_regex(src) {
	/*
	Guess at the URL of the secret panel, given the src of a comic
	*/
	var re = new RegExp(/http:\/\/(.*)\.smbc-comics\.com\/comics\/(\d{8})\..*/);
	var match = re.exec(src);
	var panel = null;
	if (match != null) {
		panel = "http://"+match[1]+".smbc-comics.com/comics/"+match[2]+"after.gif";
	}
	return panel;
}

function sp_regex(src){
    var re = new RegExp(/http:\/\/www\.somethingpositive\.net\/(sp\d+)\.shtml/);
    var match = re.exec(decodeURIComponent(src));
    var panel = null;
    if(match != null) {
        panel = "http://www.somethingpositive.net/"+match[1]+".png";
    }
    return panel;
}

function tgag_regex(src){
    var panel = src.replace("comics-rss", "comics");
    return panel;
}

function voc_regex(src){
	var panel = src.replace("-150x150", "");
	return panel;
}

function wg_regex(src){
    var re = new RegExp(/(http:\/\/www.weregeek.com)\/(\d{4}\/\d{2}\/\d{2})/);
    var match = re.exec(decodeURIComponent(src));
    var panel = null;
    if(match != null){
    	panel = match[1] + "/comics/" + match[2].replace(/\//g, "-") + ".jpg";
    }
    return panel
}