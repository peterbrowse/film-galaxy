//Console Colours
var	blue  		= '\033[34m',
	green 		= '\033[32m',
	red   		= '\033[31m',
	yellow 		= '\033[33m',
	reset 		= '\033[0m';
	
//Static Variables
var id_index	= 1,
	id_prefix	= "tt",
	id_size		= 7,
	id_limit	= 1000; 

//Dynamic Variables
var id_count	= 0;

//Dependencies
var express 	= require('express')
,	http 		= require('http')
,	app 		= express()
,	server 		= http.createServer(app)
,	imdb 		= require('imdb-api')
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
    max      : 40,
    idleTimeoutMillis : 30000,
    log : false 
});

if(id_count < id_index) {
	id_count++;
}

for (var i=id_count; i<id_limit; i++) {
	var id_num = id_prefix + pad(i, id_size);

	imdb.getReq({ id: id_num }, function(err, imdb_item) {
	
	    if(err) {
		    console.log(red+'errr: '+reset+ JSON.stringify(err));
		} else {
		    var item_url = imdb_item.imdburl;
		    var item_genres = imdb_item.genres.split(",");
		    var item_languages = imdb_item.languages.split(",");
		    var item_country = imdb_item.country.split(",");
		    var item_runtime = parseInt(imdb_item.runtime.slice(0,imdb_item.runtime.indexOf("min")));
		    
		    request(item_url, function(error, response, body){
				if(!error && response.statusCode == 200) {
					$ = cheerio.load(body);
					var item_img_path = $("#img_primary .image a img").attr('src');
					var item_cast_list = [];
					$(".cast_list tr td.itemprop a span").each(function(i, element) {
						item_cast_list[i] = $(this).text();
					});
					
					pool.acquire(function(err, db) {
						if (err) {
							console.log(red+"error: "+reset+err);
						}
						else {
							var collection = db.collection('imdb_data');
								collection.update(
									{_id: imdb_item.imdbid},
									{
										$set: {
											title: 		imdb_item.title,
											imdburl: 	item_url,
											imd_img: 	item_img_path,
											cast: 		item_cast_list,
											genres: 	item_genres,
											languages: 	item_languages,
											country: 	item_country,
											votes: 		parseInt(imdb_item.votes),
											runtime: 	item_runtime,
											rating: 	parseInt(imdb_item.rating),
											year: 		parseInt(imdb_item._year_data)	 
										}
									},
										{ upsert: true },
										function(err, results) {
											if(err) {
												console.log(red+'errr: '+reset+'Adding '+imdb_item.title+' into db with error: '+err);
											} else {
												console.log(blue+'film: '+yellow+imdb_item.title+reset+' inserted into database');
											}
										}
								);
						}
						pool.release(db);
					});
				}
		   	});
		   	
		   	id_count++;
	   	}
	});
}

//Functions

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}