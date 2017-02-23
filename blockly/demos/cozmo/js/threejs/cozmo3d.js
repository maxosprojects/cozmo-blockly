function Cozmo(scene) {
  var that = this;

  var cozmoTexture = new THREE.ImageUtils.loadTexture( 'img/cozmo.png' );
  var cozmoMaterial = new THREE.MeshBasicMaterial( { map: cozmoTexture, side: THREE.FrontSide } );
  // var cubeMaterial = new THREE.MeshLambertMaterial( { map: cubeTexture, side: THREE.FrontSide } );

  var bodyGeometry = new THREE.CubeGeometry( 70, 30, 56 );
  var headGeometry = new THREE.CubeGeometry( 36, 36, 39.4 );

  var bodyMesh = new THREE.Mesh(bodyGeometry, cozmoMaterial);
  bodyMesh.position.x = 10;
  bodyMesh.position.y = -27;
  bodyMesh.updateMatrix();
  headGeometry.merge(bodyMesh.geometry, bodyMesh.matrix);
  that._body = new THREE.Mesh(headGeometry, cozmoMaterial);

  scene.add(that._body);

  this.update = function(data) {
    that._body.position.x = data.x;
    that._body.position.y = data.z + 42;
    that._body.position.z = -data.y;
    var rot = data.rot;
    var quat = new THREE.Quaternion(-rot[2], -rot[0], -rot[1], rot[3])
    that._body.setRotationFromQuaternion(quat);
  }
}

function Cube(scene) {
  var that = this;

  var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x225522, side: THREE.FrontSide } );
  var cubeGeometry = new THREE.CubeGeometry( 44.3, 44.3, 44.3 );
  that._cube = new THREE.Mesh( cubeGeometry, cubeMaterial );

  var geometry = new THREE.EdgesGeometry( that._cube.geometry );
  var material = new THREE.LineBasicMaterial( { color: 0x00ff000, linewidth: 3 } );
  var edges = new THREE.LineSegments( geometry, material );
  that._cube.add( edges );

  scene.add(that._cube);

  this.update = function(data) {
    that._cube.position.x = data.x;
    that._cube.position.y = data.z + 22.15;
    that._cube.position.z = -data.y + 22.15;
    var rot = data.rot;
    var quat = new THREE.Quaternion(-rot[2], -rot[0], -rot[1], rot[3])
    that._cube.setRotationFromQuaternion(quat);
  }
}

function Cozmo3d() {

  var that = this;

  this._id = null;
  this._scene = null;
  this._camera = null;
  this._controls = null;
  this._cozmo = null;
  this._cubes = [];
  this._anaglyph = false;

  this.init = function() {
    that._scene = new THREE.Scene();
    var canvas = document.getElementById("canvas_3d");
    var width = $(canvas).width();
    var height = $(canvas).height();
    that._camera = new THREE.PerspectiveCamera( 60, width/height, 0.01, 3000 );

    that._camera.position.set(0,250,300);
    that._camera.focalLength = 3;
    that._camera.lookAt(that._scene.position);
    that._scene.add(that._camera);

    that._renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
    that._renderer.setSize(width, height);
    that._renderer.setPixelRatio( window.devicePixelRatio );

    that._controls = new THREE.OrbitControls( that._camera, canvas );
    that._controls.maxDistance = 1000;

    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,400,100);
    that._scene.add(light);

    // FLOOR
    var floorTexture = new THREE.ImageUtils.loadTexture( 'img/grasslight-thin.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 1, 10 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.BackSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    that._scene.add(floor);

    // SKYBOX
    var skyBoxGeometry = new THREE.CubeGeometry( 2000, 2000, 2000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    that._scene.add(skyBox);

    // COZMO
    that._cozmo = new Cozmo(that._scene);

    // CUBES
    for (var i = 0; i < 3; i++) {
      var cube = new Cube(that._scene);
      that._cubes.push(cube);
    }

    that._effect = new THREE.AnaglyphEffect( that._renderer, width || 2, height || 2 );
  };

  this.start = function() {
    that._render();
  };
  
  this.stop = function() {
    cancelAnimationFrame(that._id);
  };

  this._render = function () {
    that._id = requestAnimationFrame( that._render );

    // that.cube.rotation.x += 0.01;
    // that.cube.rotation.y += 0.01;

    if (that.anaglyph) {
      that._effect.render(that._scene, that._camera);
    } else {
      that._renderer.render(that._scene, that._camera);
    }

    that._controls.update();
  };

  this.toggleAnaglyph = function() {
    that.anaglyph = !that.anaglyph;
  };

  this.onData = function(data) {
    // console.log("received cozmo position", data);
    that._cozmo.update(data.cozmo);

    for (var i = 0; i < that._cubes.length; i++) {
      that._cubes[i].update(data.cubes[i]);
    }
  };

}
