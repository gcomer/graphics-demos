var scene, gui, camera, renderer, controls, control_points, patchParams, show_vertices;


function init() {
  //init scene
  scene = new THREE.Scene();

  //init GUI
  gui = new dat.GUI();

  //initialize y postion of each control point and resolution of patch
  patchParams = {
        show_vertices: true,
        resolution:10,
        y00:0,
        y01:5,
        y02:5,
        y03:0,
        y10:0,
        y11:10,
        y12:10,
        y13:0,
        y20:0,
        y21:10,
        y22:10,
        y23:0,
        y30:0,
        y31:5,
        y32:5,
        y33:0
  };

  //initialize all 16 control points using variable y positions
  control_points = [
  	 [new THREE.Vector3( -15, patchParams.y00, -15 ),
  	  new THREE.Vector3(  -5, patchParams.y01, -15 ),
  	  new THREE.Vector3(   5, patchParams.y02, -15 ),
  	  new THREE.Vector3(  15, patchParams.y03, -15 )],
     [new THREE.Vector3( -15, patchParams.y10, -5  ),
      new THREE.Vector3(  -5, patchParams.y11, -5  ),
      new THREE.Vector3(   5, patchParams.y12, -5  ),
      new THREE.Vector3(  15, patchParams.y13, -5  )],
     [new THREE.Vector3( -15, patchParams.y20, 5   ),
      new THREE.Vector3(  -5, patchParams.y21, 5   ),
      new THREE.Vector3(   5, patchParams.y22, 5   ),
      new THREE.Vector3(  15, patchParams.y23, 5   )],
     [new THREE.Vector3( -15, patchParams.y30, 15  ),
      new THREE.Vector3(  -5, patchParams.y31, 15  ),
      new THREE.Vector3(   5, patchParams.y32, 15  ),
      new THREE.Vector3(  15, patchParams.y33, 15  )]
  ]

  //set up the cumbersome number of GUI elements
  gui.add(patchParams, "show_vertices");
  gui.add(patchParams, "resolution").min(1).max(25).step(1);
  gui.add(patchParams, 'y00').min(-10).max(10);
  gui.add(patchParams, 'y01').min(-10).max(10);
  gui.add(patchParams, 'y02').min(-10).max(10);
  gui.add(patchParams, 'y03').min(-10).max(10);
  gui.add(patchParams, 'y10').min(-10).max(10);
  gui.add(patchParams, 'y11').min(-10).max(10);
  gui.add(patchParams, 'y12').min(-10).max(10);
  gui.add(patchParams, 'y13').min(-10).max(10);
  gui.add(patchParams, 'y20').min(-10).max(10);
  gui.add(patchParams, 'y21').min(-10).max(10);
  gui.add(patchParams, 'y22').min(-10).max(10);
  gui.add(patchParams, 'y23').min(-10).max(10);
  gui.add(patchParams, 'y30').min(-10).max(10);
  gui.add(patchParams, 'y31').min(-10).max(10);
  gui.add(patchParams, 'y32').min(-10).max(10);
  gui.add(patchParams, 'y33').min(-10).max(10);

  //draw initial control points onto the scene
  scene.add(draw_points());
  //draw initial bezier patch
  draw_bezier_patch();

  //init camera
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		1000
	);
	camera.position.x = 20;
	camera.position.y = 30;
	camera.position.z = 75;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

  //init renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById('webgl').appendChild(renderer.domElement);
	renderer.render(
		scene,
		camera
	);

  //init orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  //call update to start the program cycle
  update();

  return scene;
}

function update() {

  //update control point y positions based on GUI
  control_points[0][0].y = patchParams.y00;
  control_points[0][1].y = patchParams.y01;
  control_points[0][2].y = patchParams.y02;
  control_points[0][3].y = patchParams.y03;
  control_points[1][0].y = patchParams.y10;
  control_points[1][1].y = patchParams.y11;
  control_points[1][2].y = patchParams.y12;
  control_points[1][3].y = patchParams.y13;
  control_points[2][0].y = patchParams.y20;
  control_points[2][1].y = patchParams.y21;
  control_points[2][2].y = patchParams.y22;
  control_points[2][3].y = patchParams.y23;
  control_points[3][0].y = patchParams.y30;
  control_points[3][1].y = patchParams.y31;
  control_points[3][2].y = patchParams.y32;
  control_points[3][3].y = patchParams.y33;

  //remove old control points and draw updated ones
  scene.remove(scene.getObjectByName('control-points'));
  scene.add(draw_points());

  //remove old patch and draw updated one
  scene.remove(scene.getObjectByName('patch'));
  scene.add(draw_bezier_patch());

  //call render and do other standard updates
	renderer.render(
		scene,
		camera
	);

	controls.update();

	requestAnimationFrame(function() {
		update();
	})
}

function draw_bezier_patch() {
  points = generate_points();
  scene.remove(scene.getObjectByName('pointy-points'));
  if(patchParams.show_vertices){
    scene.add(draw_points2(points));
  }
  var geometry = new THREE.BufferGeometry();
  var vertices = points;
  var material = new THREE.MeshBasicMaterial({color: 0x0000ff});
  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'patch';
  return mesh;
}

function generate_points() {
  r = patchParams.resolution;
  step = 1/(r-1);
  uv=[];
  for (var i = 0; i<r; i++){
    uv.push(step*i);
  }
  points = [];
  for(var u=0; u<uv.length; u++){
    line_points = [];
    for(var v=0; v<uv.length; v++){
      point = bernstein(uv[u],uv[v]);
      line_points.push(point);
    }
    points.push(line_points);
  }
  return points;
}

function bernstein( u, v, controlPts){
  x = 0.0;
  y = 0.0;
  z = 0.0;

  coeffs = coefficients( u, v);

  //for c, cp in zip( coeffs, control_points ){
  for(var i = 0; i<coeffs.length; i++){
    for(var j = 0; j<coeffs[i].length; j++){
      dx = coeffs[i][j]*control_points[i][j].x;
      dy = coeffs[i][j]*control_points[i][j].y;
      dz = coeffs[i][j]*control_points[i][j].z;

      x = x + dx;
      y = y + dy;
      z = z + dz;
    }
  }
  point = new THREE.Vector3(x,y,z)
  return point;
}

function coefficients( u, v ){
  u2 = u*u;
  u3 = u2*u;

  mu  = 1.0 - u;
  mu2 = mu*mu;
  mu3 = mu2*mu;

  v2 = v*v;
  v3 = v2*v;

  mv  = 1.0 - v;
  mv2 = mv*mv;
  mv3 = mv2*mv;

  r00 =      mu3*mv3; r01 = 3   *v*mu3*mv2; r02 = 3   *v2*mu3*mv; r03 =      v3*mu3;
  r10 = 3*u *mu2*mv3; r11 = 9*u *v*mu2*mv2; r12 = 9*u *v2*mu2*mv; r13 = 3*u *v3*mu2;
  r20 = 3*u2*mu *mv3; r21 = 9*u2*v*mu *mv2; r22 = 9*u2*v2*mu *mv; r23 = 3*u2*v3*mu;
  r30 =   u3    *mv3; r31 = 3*u3*v    *mv2; r32 = 3*u3*v2    *mv; r33 =   u3*v3;
  coeffs = [
     [r00, r01, r02, r03],
     [r10, r11, r12, r13],
     [r20, r21, r22, r23],
     [r30, r31, r32, r33]];
  return coeffs;
}

function draw_points() {
  pointsGeometry = new THREE.Geometry();
  material = new THREE.PointsMaterial({color: 0x00ff00});
  //for each point, append as vertex to geometry
  for (var i=0; i<control_points.length; i++) {
    for (var j=0; j<control_points[i].length; j++) {
      pointsGeometry.vertices.push(control_points[i][j]);
    }
  }
  //make new mesh based on control point geometry and basic material
  var points_object = new THREE.Points(pointsGeometry, material);
  //assign name for easy removal
  points_object.name = 'control-points';
  return points_object;
}

function draw_points2(control_points) {
  pointsGeometry = new THREE.Geometry();
  material = new THREE.PointsMaterial({color: 0xff0000});
  //for each point, append as vertex to geometry
  for (var i=0; i<control_points.length; i++) {
    for (var j=0; j<control_points[i].length; j++) {
      pointsGeometry.vertices.push(control_points[i][j]);
    }
  }
  //make new mesh based on control point geometry and basic material
  var points_object = new THREE.Points(pointsGeometry, material);
  //assign name for easy removal
  points_object.name = 'pointy-points';
  return points_object;
}

init();
