//Console Colours
var	blue  		= '\033[34m',
	green 		= '\033[32m',
	red   		= '\033[31m',
	yellow 		= '\033[33m',
	reset 		= '\033[0m';
	
//Static Variables
var id_index	= 1,
	id_prefix	= "tt",
	id_size		= 7; 

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
    	var MONGOHQ_URL="mongodb://admin:stormur2013@vincent.mongohq.com:10044/imdb_test";
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

imdb.getReq({ id: 'tt0000001' }, function(err, imdb_item) {

    if(err) {
	    console.log(red+'errr: '+reset+ JSON.stringify(err));
    }
    
    var item_url = imdb_item.imdburl;
    
    request(item_url, function(error, response, body){
		if(!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			
			var item_img_path = $("#img_primary .image a img").attr('src');
			var item_cast_list = [];
			$(".cast_list tr td.itemprop a span").each(function(i, element) {
				item_cast_list[i] = $(this).text();
			});
			
			console.log(item_cast_list);
		}
		else if(response.statusCode != 200) {
   			console.log(yellow+"warn: "+reset+"statusCode - "+response.statusCode);
		}
		else if(error) {
			console.log(red+"error: "+reset+error);
		}
   	});
});



//Functions

Number.prototype.pad = function(size) {
	var s = String(this);
	if(typeof(size) !== "number"){size = 2;}
	
	while (s.length < size) {s = "0" + s;}
	return s;
}