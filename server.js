//Console Colours
var	blue  		= '\033[34m',
	green 		= '\033[32m',
	red   		= '\033[31m',
	yellow 		= '\033[33m',
	reset 		= '\033[0m';
	
//Static Variables
var id_index			= 165795,
	id_prefix			= "tt",
	url_prefix_start	= 'http://www.imdb.com/title/',
	url_prefix_end		= '/'
	id_size				= 7,
	id_limit			= 50000,
	dynamic_limit		= id_index + id_limit; 
	
//tt0165795

//Dynamic Variables
var id_count	= 0,
	top_list_db	= []
	db_loaded	= false;

//Dependencies
var express 	= require('express')
,	http 		= require('http')
,	app 		= express()
,	server 		= http.createServer(app)
,	MongoClient = require('mongodb').MongoClient
,	request 	= require('request')
,	cheerio 	= require('cheerio')
,	poolModule 	= require('generic-pool');

//Pool Setup
var pool = poolModule.Pool({
    name     : 'mongodb',
    create   : function(callback) {
    	var MONGOHQ_URL="mongodb://admin_usr:imdb_test_13@troup.mongohq.com:10061/imdb_test";
		var MongoClient = require('mongodb').MongoClient;

		MongoClient.connect(MONGOHQ_URL, function(err, client) {
			if(err) {console.log(err);}
			else {
				callback(null, client);
			}
		});
    },
    destroy  : function(client) { client.close(); },
    max      : 60,
    idleTimeoutMillis : 30000,
    log : false 
});

request('http://www.imdb.com/chart/top', function(error, response, body){
	if(!error && response.statusCode == 200) {
		$ = cheerio.load(body);
		var top_list = [];
		$('.chart tbody tr .titleColumn a').each(function(i, element) {
			var href = $(this).attr('href').split('/title/');
			top_list[i] = href[1];
		});
		
		for (var i = 0; i<top_list.length; i++) {
			var item_url = url_prefix_start+top_list[i];
			
			request(item_url, function(error, response, body){
				if(!error && response.statusCode == 200) {
					$ = cheerio.load(body);
					var meta = $('meta');
		   			var keys = Object.keys(meta);
		   			var item_id_url;
		    			
					keys.forEach(function(key){
					    if (  meta[key].attribs
					       	&& meta[key].attribs.property
					       	&& meta[key].attribs.property === 'og:url') {
					    		item_id_url = meta[key].attribs.content;
					    }
					});
					
					var item_id				= item_id_url.replace(/.*\/([^/]+).*/, "$1");
					var item_title			= $('.header span.itemprop').text();
					var item_year 			= $('.header span.nobr a').text();
					var item_rank			= response.request.uri.query.split('ref_=chttp_tt_')[1];
					var item_runtime_raw 	= $('time').text();
					var item_runtime 		= parseInt(item_runtime_raw.slice(0,item_runtime_raw.indexOf(" min")));
					var item_rating			= $('#overview-top .star-box .titlePageSprite').text();
					var item_img_path 		= $("#img_primary .image a img").attr('src');
					var item_cast_list 		= [];
					$("[itemprop=actor] a span").each(function(j, element) {
						item_cast_list[j] = $(this).text();
					});
					var item_directors		= [];
					$('[itemprop=director] a').each(function(j, element) {
						item_directors[j] = $(this).text();
					});
					var item_genres			= [];
					$('.article [itemprop=genre] a').each(function(j, element) {
						item_genres[j] = $(this).text();
					});
					
					top_list_db[item_rank-1] = {
						title: 		item_title,
						imdburl: 	item_id_url,
						imd_img: 	item_img_path,
						cast: 		item_cast_list,
						director:	item_directors,
						genres: 	item_genres,
						votes: 		item_rating,
						runtime: 	item_runtime,
						rating: 	item_rating,
						year: 		item_year,
						rank:		item_rank
					};
					
					if(item_rank == top_list.length) {
						db_loaded = true;
					}
					
					/*
pool.acquire(function(err, db) {
						if (err) {
							console.log(red+"error: "+reset+err);
						}
						else {
							var collection = db.collection('imdb_top_250');
								collection.update(
									{_id: item_id},
									{
										$set: {
											title: 		item_title,
											imdburl: 	item_id_url,
											imd_img: 	item_img_path,
											cast: 		item_cast_list,
											director:	item_directors,
											genres: 	item_genres,
											votes: 		item_rating,
											runtime: 	item_runtime,
											rating: 	item_rating,
											year: 		item_year,
											rank:		item_rank	 
										}
									},
										{ upsert: true },
										function(err, results) {
											if(err) {
												console.log(red+'errr: '+reset+'Adding '+item_title+' into db with error: '+err);
											} else {
												console.log(blue+'film: '+reset+item_id+" - "+yellow+item_title+reset+' inserted into database');
											}
										}
								);
						}
						pool.release(db);
					});
*/
				}
			});
		}
	}
});






//Functions

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}