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
	radIncrement = 1;

var container, stats;

var camera, scene, renderer;

var mesh, zmesh, lightMesh, geometry;

var mouseX = 0, mouseY = 0;

var objects = [];


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
	camera.position.set( 0, 0, 1000 );
	camera.lookAt ( 0,0,0 );

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
	directionalLight.position.set( 0, 0.5, 1 );
	scene.add( directionalLight );
	
	scene.fog = new THREE.Fog( 0x000000, 1000, 0 );

	var colors = [ 0x000000, 0xff0080, 0x8000ff, 0xffffff ];
	var geometry = new THREE.Geometry();

	/*
for ( var i = 0; i < imdb_db.length; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = 360 * Math.cos(get_item_angle(i));
		vertex.y = 360 * Math.sin(get_item_angle(i));
		vertex.z = imdb_db[i].rank * 10;
*/
		/*
var material = new THREE.MeshLambertMaterial({
        	map: THREE.ImageUtils.loadTexture(imdb_db[i].imd_img)
      	});
      	var sphere = new THREE.Mesh( geometry, material );
*/
		/*
		var sphereMaterial = new THREE.MeshLambertMaterial( { color: colors[ Math.floor( Math.random() * colors.length ) ] } );
		var geometry = new THREE.SphereGeometry( 15, 32, 32 );
		var sphere = new THREE.Mesh( geometry, sphereMaterial );
		sphere.position.set(vertex.x, vertex.y, vertex.z);
		sphere.name = "sphere_" + i;
		scene.add( sphere );
	}
*/

	var axes = buildAxes( 1000 );
	
	//scene.add(axes);
	
	var vertex = new THREE.Vector3();
	vertex.x = 200;
	vertex.y = 0;
	vertex.z = 200;
	
	var angle = 0; // The Initial Angle Orbiting Starts From
	var orbit_speed = 2; // Number Of Pixels Orbited Per Frame
	var radius = 200; // Orbiting Distance From Origin
	
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: colors[ Math.floor( Math.random() * colors.length ) ] } );
	var geometry = new THREE.SphereGeometry( 15, 32, 32 );
	var sphere = new THREE.Mesh( geometry, sphereMaterial );
	sphere.position.set(vertex.x, vertex.y, vertex.z);

	sphere.name = "sphere_" + 0;
	
	objects[0] = {
		name: 		sphere.name,
		origin:		vertex,
		radius:		radius,
		angle:		angle,
		speed:		orbit_speed
	}
	
	scene.add( sphere );


	renderer = new THREE.WebGLRenderer( { preserveDrawingBuffer: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	renderer.autoClearColor = false;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	//

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

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	var timer = Date.now() * 0.0008;

	/*
camera.position.x = Math.cos( timer ) * 1500;
	camera.position.z = Math.sin( timer ) * 1500;
*/
	
	var sphere = scene.getObjectByName(objects[0].name, true);
	
	var rad 			= objects[0].angle * (Math.PI / 180); // Converting Degrees To Radians
	sphere.position.x 	= axis.x + objects[0].radius * Math.cos(rad); // Position The Orbiter Along x-axis
	sphere.position.z 	= axis.z + objects[0].radius * Math.sin(rad); // Position The Orbiter Along y-axis
	
	objects[0].angle += objects[0].speed; // Object will orbit clockwise
	//objects[0].angle -= objects[0].speed; // Object will orbit counter-clockwise

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