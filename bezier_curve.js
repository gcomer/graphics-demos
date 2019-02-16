var scene, gui, camera, renderer, controls, control_points, curveParams;

function init() {
  scene = new THREE.Scene();
  gui = new dat.GUI();

  curveParams = {
        resolution:10,
        y0:0,
        y1:10,
        y2:10,
        y3:0
  };

  control_points = [
	  new THREE.Vector3( -15, curveParams.y0, 0 ),
	  new THREE.Vector3( -5, curveParams.y1, 0 ),
	  new THREE.Vector3( 5, curveParams.y2, 0 ),
	  new THREE.Vector3( 15, curveParams.y3, 0 )];

  scene.add(draw_points());
  scene.add(draw_bezier());

  gui.add(curveParams, 'resolution').min(1).max(25).step(1);
  gui.add(curveParams, 'y0').min(-10).max(10);
  gui.add(curveParams, 'y1').min(-10).max(10);
  gui.add(curveParams, 'y2').min(-10).max(10);
  gui.add(curveParams, 'y3').min(-10).max(10);

	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		1000
	);
	camera.position.x = 10;
	camera.position.y = 30;
	camera.position.z = 40;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);
	renderer.render(
		scene,
		camera
	);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  update();

  return scene;
}

function update() {

  control_points[0].y = curveParams.y0;
  control_points[1].y = curveParams.y1;
  control_points[2].y = curveParams.y2;
  control_points[3].y = curveParams.y3;
  scene.remove(scene.getObjectByName('control-points'));
  scene.add(draw_points(control_points));
  scene.remove(scene.getObjectByName('curve'));
  scene.add(draw_bezier(control_points));

	renderer.render(
		scene,
		camera
	);

	controls.update();

	requestAnimationFrame(function() {
		update();
	})
}

function draw_bezier() {
  scene.remove(scene.getObjectByName("curve"));
  var curve = new THREE.CubicBezierCurve3(
    control_points[0],
    control_points[1],
    control_points[2],
    control_points[3]
  );
  var points = curve.getPoints(curveParams.resolution);
  var geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  var material = new THREE.LineBasicMaterial( {color: 0xffffff} );
  var curveObject = new THREE.Line(geometry, material);
  curveObject.name = "curve";
  return curveObject;
}

function draw_points() {
  pointsGeometry = new THREE.Geometry();
  material = new THREE.PointsMaterial({color: 0x00ff00});
  //for each point, append as vertex to geometry
  for (var i=0; i<control_points.length; i++) {
    pointsGeometry.vertices.push(control_points[i]);
  }
  //make new mesh based on control point geometry and basic material
  var points_object = new THREE.Points(pointsGeometry, material);
  //assign name for easy removal
  points_object.name = 'control-points';
  return points_object;
}

init();
