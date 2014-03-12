function info_slate(id) {
	$('.film_info').slideUp(200, function() {
		$('.inner h1').text(imdb_db[id].title);
		$('.inner h2').text(imdb_db[id].year);
		$('.inner h3').text("Rank: " + imdb_db[id].rank);
		$('.inner img').attr("src",imdb_db[id].imd_img);
	
		$('.film_info').slideDown(400);
	});
}