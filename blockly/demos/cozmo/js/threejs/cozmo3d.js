function Cozmo3d() {

  var that = this;

  this._id = null;

  this.init = function() {
    that.scene = new THREE.Scene();
    var canvas = document.getElementById("canvas_3d");
    var width = $(canvas).width();
    var height = $(canvas).height();
    that.camera = new THREE.PerspectiveCamera( 60, width/height, 0.01, 3000 );

    that.camera.position.set(0,250,300);
    that.camera.focalLength = 3;
    that.camera.lookAt(that.scene.position);
    that.scene.add(that.camera);

    var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
    renderer.setSize(width, height);
    renderer.setPixelRatio( window.devicePixelRatio );

    that.controls = new THREE.OrbitControls( that.camera, canvas );
    that.controls.maxDistance = 1000;

    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,400,100);
    that.scene.add(light);

    // FLOOR
    var floorTexture = new THREE.ImageUtils.loadTexture( 'img/grasslight-thin.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 1, 10 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.BackSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    that.scene.add(floor);

    // SKYBOX
    var skyBoxGeometry = new THREE.CubeGeometry( 2000, 2000, 2000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    that.scene.add(skyBox);

    var cubeTexture = new THREE.ImageUtils.loadTexture( 'img/cozmo.png' );
    var cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture, side: THREE.FrontSide } );
    // var cubeMaterial = new THREE.MeshLambertMaterial( { map: cubeTexture, side: THREE.FrontSide } );
    var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100 );
    that.cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    that.cube.position.set(0,100,0);
    that.scene.add( that.cube );


    //make a sphere
    var sg = new THREE.SphereGeometry(100,16,12);
    //make cylinder - ideally the segmentation would be similar to predictable results
    var cg = new THREE.CylinderGeometry(100, 100, 200, 16, 4, false );
    //move vertices down for cylinder, so it maches half the sphere - offset pivot
    for(var i = 0 ; i < cg.vertices.length; i++) cg.vertices[i].y -= 99;
    //merge meshes
    THREE.GeometryUtils.merge(sg,cg);
    var mesh = new THREE.Mesh( sg, new THREE.MeshLambertMaterial( { color: 0x8D909D, wireframe: false, shading: THREE.FlatShading } ));
    mesh.position.x = 200;
    mesh.position.y = 200;
    that.scene.add(mesh);


    // var cylinder = THREE.CSG.toCSG(new THREE.CylinderGeometry(100, 100, 200, 16, 4, false ), new THREE.Vector3(200,200,200));
    // var sphere   = THREE.CSG.toCSG(new THREE.SphereGeometry(100,16,12), new THREE.Vector3(200,300,200));
    // var geometry = cylinder.union(sphere);
    // var mesh2     = new THREE.Mesh(THREE.CSG.fromCSG( geometry ), new THREE.MeshLambertMaterial( { color: 0x8D909D, wireframe: false, shading: THREE.FlatShading } ));
    // that.scene.add(mesh2);


    that.effect = new THREE.AnaglyphEffect( renderer, width || 2, height || 2 );
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

    that.effect.render(that.scene, that.camera);

    that.controls.update();
  };

  this.onData = function(data) {
    // console.log("received cozmo position", data);
    that.cube.rotation.y = data.cube2.angle;
    that.cube.position.x = data.cube2.x;
    that.cube.position.y = data.cube2.y;
    that.cube.position.z = data.cube2.z;
  };

}
