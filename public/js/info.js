var slate_status = false,
	previous_id;


function info_slate(id) {
	if(typeof previous_id === 'undefined'){
		previous_id = -1;
 	};
	
	if(id != previous_id) {
		if(slate_status == false) {
			slate_status = true;
		
			$('.inner h1').text(imdb_db[id].title);
			
			var runtime;
			
			if(imdb_db[id].runtime > 0) {
				runtime = imdb_db[id].runtime + " mins";
			} else{
				runtime = imdb_db[id].runtime + " min";
			}
			
			$('.inner h2').text(imdb_db[id].year + " - " + runtime);
			$('.inner h3').text("Rank: " + imdb_db[id].rank);
			$('.inner img').attr("src",imdb_db[id].imd_img);
			$('.inner p').text(imdb_db[id].description);
			
			$('.film_info').show("slide", { direction: "left" }, 200);
		} else {
			$('.film_info').hide("slide", { direction: "left" }, 200, function() {
				$('.inner h1').text(imdb_db[id].title);
			
				var runtime;
				
				if(imdb_db[id].runtime > 0) {
					runtime = imdb_db[id].runtime + " mins";
				} else{
					runtime = imdb_db[id].runtime + " min";
				}
				
				$('.inner h2').text(imdb_db[id].year + " - " + runtime);
				$('.inner h3').text("Rank: " + imdb_db[id].rank);
				$('.inner img').attr("src",imdb_db[id].imd_img);
				$('.inner p').text(imdb_db[id].description);
				
				$('.film_info').show("slide", { direction: "left" }, 200);
			});
		}
	}
	
	previous_id = id;
}

$(document).ready(function(){
	$('.close').click(function(){
		if(slate_status) {
			$('.film_info').hide("slide", { direction: "left" }, 200, function(){
				slate_status = false;
			});
		}
	});
});