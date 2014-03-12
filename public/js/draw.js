var genres = [
	"Action",
	"Adventure",
	"Animation",
	"Biography",
	"Comedy",
	"Crime",
	"Documentary",
	"Drama",
	"Family",
	"Fantasy",
	"Film-Noir",
	"History",
	"Horror",
	"Music",
	"Musical",
	"Mystery",
	"Romance",
	"Sci-Fi",
	"Sport",
	"Rhriller",
	"War",
	"Western"
];

var startTime	= Date.now();

var degree_step = 16.36;

var rad = 0,
	radIncrement = 1,
	delay = 0.1;

var container, stats;

var camera, scene, renderer;

var mesh, zmesh, lightMesh, geometry;

var mouseX = 0, mouseY = 0;

var objects = [];

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED, projector;


var axis = new THREE.Vector3(0,0,0);


var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
//document.addEventListener( 'mousemove', onDocumentMouseMove, false );

$(document).ready(function(){
	init();
	animate();
});

function init() {
	container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.set( 0, 200, 3000 );
	camera.lookAt ( 0,0,0 );
	
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render )

	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);
    
    areaLight1 = new THREE.AreaLight( 0xffffff, 1 );
	areaLight1.position.set( 0, 0, 2500 );
	areaLight1.width = 10;
	areaLight1.height = 1;
	
	scene.add( areaLight1 );
    
    // directional lighting
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0, 0, 1 );
	scene.add( directionalLight );
	
	scene.fog = new THREE.Fog( 0x000000, 0, 10000 );

	var colors = [ 0x000000, 0xff0080, 0x8000ff, 0xffffff ];
	var geometry = new THREE.Geometry();
	
	/*
var axes = buildAxes( 1000 );
	scene.add(axes);
*/

	projector = new THREE.Projector();
	
	for ( var i = 0; i < imdb_db.length; i ++ ) {
		
		var material = new THREE.MeshLambertMaterial({
        	map: THREE.ImageUtils.loadTexture(imdb_db[i].imd_img)
      	});
      	//var sphereMaterial = new THREE.MeshLambertMaterial( { color: colors[ Math.floor( Math.random() * colors.length ) ] } );
		
		var vertex = new THREE.Vector3();
		vertex.x = imdb_db[i].rank * 10;
		vertex.y = 360 * Math.sin(get_item_angle(i));
		vertex.z = imdb_db[i].rank * 10;
		
		var angle = 0; // The Initial Angle Orbiting Starts From
		var orbit_speed = randomIntFromIntervalNonFloored(0.01,0.1); // Number Of Pixels Orbited Per Frame
		var radius = imdb_db[i].rank * 10; // Orbiting Distance From Origin
		
		var geometry = new THREE.SphereGeometry( 15, 32, 32 );
		var sphere = new THREE.Mesh( geometry, material );
		sphere.position.set(vertex.x, vertex.y, vertex.z);
		sphere.name = i;
		
		objects[i] = {
			name: 		sphere.name,
			origin:		vertex,
			radius:		radius,
			angle:		angle,
			speed:		orbit_speed,
			direction:	randomIntFromInterval(0,1),
			id:			i
		}
	
		scene.add( sphere );
	}

	renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: false, alpha: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	renderer.autoClearColor = false;
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	container.appendChild( renderer.domElement );

	/*
stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
*/

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove(event) {

	mouseX = ( event.clientX - windowHalfX ) * 10;
	mouseY = ( event.clientY - windowHalfY ) * 10;

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    var vector = new THREE.Vector3(
        ( event.clientX / window.innerWidth ) * 2 - 1,
      - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5
    );
    projector.unprojectVector( vector, camera );

    var ray = new THREE.Raycaster( camera.position, 
                             vector.sub( camera.position ).normalize() );

    var intersects = ray.intersectObjects( scene.children , true);

    if ( intersects.length > 0 ) {
		info_slate(intersects[0].object.name);
    }
}

function animate() {

	requestAnimationFrame( animate );

	render();
	//stats.update();

}

function render() {
	/*
	var timer = Date.now() * 0.0008;
	camera.position.x = Math.cos( timer ) * 1500;
	camera.position.z = Math.sin( timer ) * 1500;
	*/
	
	for ( var i = 0; i < imdb_db.length; i ++ ) {
		var sphere 			= scene.getObjectByName(objects[i].name, true);
		var rad 			= objects[i].angle * (Math.PI / 180); // Converting Degrees To Radians
		sphere.position.x 	= axis.x + objects[i].radius * Math.cos(rad); // Position The Orbiter Along x-axis
		sphere.position.z 	= axis.z + objects[i].radius * Math.sin(rad); // Position The Orbiter Along z-axis
		if(objects[i].direction) {
			objects[i].angle -= objects[i].speed;
		} else {
			objects[i].angle += objects[i].speed;
		}
	}
	
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}

function get_item_angle(position) {
	var input_genre = imdb_db[position].genres[0];

	for ( j = 0; j < genres.length; j++ ) {
		if(genres[j] == input_genre) {
			return (j + 1) * degree_step;	
		}
	}
}

function buildAxes( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        return axes;

}

function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat; 

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomIntFromIntervalNonFloored(min,max) {
	return Math.random()*(max-min+delay)+min;
}