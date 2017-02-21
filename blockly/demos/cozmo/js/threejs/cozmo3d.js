var cozmo3d = function() {
  var scene = new THREE.Scene();
  var canvas = document.getElementById("canvas_3d");
  var width = $(canvas).width();
  var height = $(canvas).height();
  var camera = new THREE.PerspectiveCamera( 60, width/height, 0.01, 3000 );

  camera.position.set(0,250,300);
  camera.focalLength = 3;
  camera.lookAt(scene.position);
  scene.add(camera);

  var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
  renderer.setSize(width, height);
  renderer.setPixelRatio( window.devicePixelRatio );

  var controls = new THREE.OrbitControls( camera, canvas );
  controls.maxDistance = 1000;

  var light = new THREE.PointLight(0xffffff);
  light.position.set(-100,400,100);
  scene.add(light);

  // FLOOR
  var floorTexture = new THREE.ImageUtils.loadTexture( 'img/grasslight-thin.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
  floorTexture.repeat.set( 1, 10 );
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.BackSide } );
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  // SKYBOX
  var skyBoxGeometry = new THREE.CubeGeometry( 2000, 2000, 2000 );
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  scene.add(skyBox);

  var cubeTexture = new THREE.ImageUtils.loadTexture( 'img/cozmo.png' );
  var cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture, side: THREE.FrontSide } );
  // var cubeMaterial = new THREE.MeshLambertMaterial( { map: cubeTexture, side: THREE.FrontSide } );
  var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100 );
  var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(0,100,0);
  scene.add( cube );

  effect = new THREE.AnaglyphEffect( renderer, width || 2, height || 2 );

  var render = function () {
    requestAnimationFrame( render );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    effect.render(scene, camera);

    controls.update();
  };

  render();
}
