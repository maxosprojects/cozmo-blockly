
var textureMap = {};
var textureLoader = new THREE.TextureLoader();
var cozmo2threejs = {};
var threejs2cozmo = {};
var aruco2threejs = {};

class Dynamic {
  constructor(scene, offx, offy, offz) {
    this.scene = scene;
    this.offx = offx;
    this.offy = offy;
    this.offz = offz;
  }

  update(data) {
    var pose = cozmo2threejs.pose(data);
    this.mesh.position.x = pose.x + this.offx;
    this.mesh.position.y = pose.y + this.offy;
    this.mesh.position.z = pose.z + this.offz;
    var quat = new THREE.Quaternion(pose.rot[0], pose.rot[1], pose.rot[2], pose.rot[3])
    this.mesh.setRotationFromQuaternion(quat);

    if (data.seen === false) {
      this._setOpacity(0);
    } else if (data.visible === false) {
      this._setOpacity(0.5);
    } else {
      this._setOpacity(1);
    }
  }

  addToScene() {
    this.scene.add(this.mesh);
  }

  removeFromScene() {
    this.scene.remove(this.mesh);
  }

  copyPoseTo(other) {
    other.mesh.position.copy(this.mesh.position);
    other.mesh.rotation.copy(this.mesh.rotation);
  }

  // ECMA2015 doesn't provide a nice way to override parent method in a way that
  // parent would be able to call child's overridden method.
  // Hence, all derived classed must implement it this way:
  //
  // this.setOpacity = function(opacity) {
  //   
  // }

  set setOpacity(func) {
    this._setOpacity = func;
  }

  get setOpacity() {
    return this._setOpacity;
  }
}

class Static {
  constructor(scene, x1, y1, x2, y2, depth, height, textureUrl) {
    this.scene = scene;

    var pos1 = cozmo2threejs.position({
      x: x1,
      y: y1,
      z: 0
    });
    var pos2 = cozmo2threejs.position({
      x: x2,
      y: y2,
      z: 0
    });

    var centerX = (pos1.x + pos2.x) / 2.0;
    var centerY = height / 2.0;
    var centerZ = (pos1.z + pos2.z) / 2.0;

    var width = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
    var angleY = Math.atan2(pos1.x - pos2.x, pos1.z - pos2.z) + Math.PI / 2.0;

    // 'loadTexture' caches textures, so setting tiling on that texture applies that repeating to all sides.
    // Also, cloning doesn't work without 'needsUpdate', which requires the texture to be fully loaded
    // at the time of cloning.
    // TODO: load texture once and clone on 'onLoad'. That would need some code rewriting, otherwise 'addToScene'
    // wouldn't work.

    // var texture = loadTexture(textureUrl);
    // function cloneTexture() {
    //   var newTxture = texture.clone();
    //   newTxture.needsUpdate = true;
    //   return newTxture;
    // }
    function cloneTexture() {
      var texture = textureLoader.load(textureUrl);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    }
    var staticTextureX = cloneTexture();
    staticTextureX.repeat.x = width / 32;
    staticTextureX.repeat.y = height / 32;
    var staticTextureY = cloneTexture();
    staticTextureY.repeat.x = width / 32;
    staticTextureY.repeat.y = depth / 32;
    var staticTextureZ = cloneTexture();
    staticTextureZ.repeat.x = depth / 32;
    staticTextureZ.repeat.y = height / 32;
    var staticMaterialX = new THREE.MeshBasicMaterial( { map: staticTextureX, side: THREE.FrontSide } );
    var staticMaterialY = new THREE.MeshBasicMaterial( { map: staticTextureY, side: THREE.FrontSide } );
    var staticMaterialZ = new THREE.MeshBasicMaterial( { map: staticTextureZ, side: THREE.FrontSide } );
    var staticMultimaterial = new THREE.MultiMaterial([
      staticMaterialZ,
      staticMaterialZ,
      staticMaterialY,
      staticMaterialY,
      staticMaterialX,
      staticMaterialX
    ]);
    var staticGeometry = new THREE.BoxGeometry( width, height, depth );
    this.mesh = new THREE.Mesh(staticGeometry, staticMultimaterial);

    this.mesh.position.x = centerX;
    this.mesh.position.y = centerY;
    this.mesh.position.z = centerZ;

    this.mesh.rotateY(angleY);
  }

  addToScene() {
    this.scene.add(this.mesh);
  }

  removeFromScene() {
    this.scene.remove(this.mesh);
  }
}

class WallBrick extends Static {
  constructor(scene, x1, y1, x2, y2, depth, height) {
    super(scene, x1, y1, x2, y2, depth, height, 'img/3d/wall_brick.png');
  }
}

class WallWood extends Static {
  constructor(scene, x1, y1, x2, y2, depth, height) {
    super(scene, x1, y1, x2, y2, depth, height, 'img/3d/wall_wood.png');
  }
}

class Cozmo extends Dynamic {
  constructor(scene) {
    super(scene, 0, 42, 0);

    var cozmoTexture = loadTexture( 'img/3d/cozmo.png' );
    var cozmoMaterial = new THREE.MeshBasicMaterial( { map: cozmoTexture, side: THREE.FrontSide } );
    // Transparency with current texture isn't working well
    // var cozmoMaterial = new THREE.MeshBasicMaterial( { map: cozmoTexture, side: THREE.FrontSide, transparent: true } );

    var bodyGeometry = new THREE.BoxGeometry( 70, 30, 56 );
    var headGeometry = new THREE.BoxGeometry( 36, 36, 39.4 );

    var bodyMesh = new THREE.Mesh(bodyGeometry, cozmoMaterial);
    bodyMesh.position.x = 10;
    bodyMesh.position.y = -27;
    bodyMesh.updateMatrix();
    headGeometry.merge(bodyMesh.geometry, bodyMesh.matrix);
    this.mesh = new THREE.Mesh(headGeometry, cozmoMaterial);

    this.setOpacity = function(opacity) {
      cozmoMaterial.opacity = opacity;
    }
  }
}

class Crate extends Dynamic {
  constructor(scene) {
    super(scene, 0, 22.15, 0);

    var cubeTexture = loadTexture('img/3d/crate.jpg');
    var cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture, side: THREE.FrontSide, transparent: true } );
    // var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x225522, side: THREE.FrontSide } );
    var cubeGeometry = new THREE.BoxGeometry( 44.3, 44.3, 44.3 );
    this.mesh = new THREE.Mesh( cubeGeometry, cubeMaterial );

    // var geometry = new THREE.EdgesGeometry( this.mesh.geometry );
    // var material = new THREE.LineBasicMaterial( { color: 0x00ff000, linewidth: 5 } );
    // var edges = new THREE.LineSegments( geometry, material );
    // this.mesh.add( edges );

    this.setOpacity = function(opacity) {
      cubeMaterial.opacity = opacity;
    }
  }
}

class Mob extends Dynamic {
  constructor(scene, texture) {
    super(scene, 0, 0, 0);

    var char = new MinecraftChar(texture);
    this.mesh = char.getRoot();

    this.setOpacity = char.setOpacity;
  }
}

class Zombie extends Mob {
  constructor(scene) {
    super(scene, 'img/3d/zombiehd.png');
  }
}

class Spiderman extends Mob {
  constructor(scene) {
    super(scene, 'img/3d/spiderman.png');
  }
}

var MinecraftChar = function(url){
    var tTexture    = loadTexture( url );
    tTexture.magFilter  = THREE.NearestFilter;
    tTexture.minFilter  = THREE.NearestFilter;
    this._tTexture  = tTexture

    var tMaterial   = new THREE.MeshBasicMaterial({
        transparent : true,
        map : tTexture
    });
    var tMaterialt  = new THREE.MeshBasicMaterial({
        map     : tTexture,
        transparent : true,
        side        : THREE.DoubleSide
    });

    //////////////////////////////////////////////////////////////////////////
    // define size constant
    var sizes   = {};
    sizes.pixRatio  = 2;

    sizes.headH = 8  * sizes.pixRatio;
    sizes.headW = 8  * sizes.pixRatio;
    sizes.headD = 8  * sizes.pixRatio;

    sizes.helmetH   = 9  * sizes.pixRatio;
    sizes.helmetW   = 9  * sizes.pixRatio;
    sizes.helmetD   = 9  * sizes.pixRatio;

    sizes.bodyH = 12 * sizes.pixRatio;
    sizes.bodyW =  8 * sizes.pixRatio;
    sizes.bodyD =  4 * sizes.pixRatio;

    sizes.legH  = 12 * sizes.pixRatio;
    sizes.legW  =  4 * sizes.pixRatio;
    sizes.legD  =  4 * sizes.pixRatio;

    sizes.armH  = 12 * sizes.pixRatio;
    sizes.armW  =  4 * sizes.pixRatio;
    sizes.armD  =  4 * sizes.pixRatio;

    // sizes.charH = 60;
    sizes.charH = sizes.legH + sizes.bodyH + sizes.headH;

    // build model core hierachy
    // - origin between 2 feet
    // - height of full character is 1
    var model   = {}
    model.root  = new THREE.Object3D();
    model.headGroup = new THREE.Object3D();
    translateY(model.headGroup, sizes.charH - sizes.headH);
    model.root.add(model.headGroup);

    // build model.head
    model.head  = createCube(sizes.headW, sizes.headH, sizes.headD, tMaterial);
    model.headGroup.add(model.head);
    translateY(model.head, sizes.headH/2);
                    // .back()
    var tGeometry   = model.head.geometry;
    // var tGeometry   = model.head.geometry().get(0);
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0, 16, 24, 24, 16) // left
    mapUv(tGeometry, 1,  0, 24,  8, 16) // right
    mapUv(tGeometry, 2,  8, 32, 16, 24) // top
    mapUv(tGeometry, 3, 16, 32, 24, 24) // bottom
    mapUv(tGeometry, 4,  8, 24, 16, 16) // front
    mapUv(tGeometry, 5, 24, 24, 32, 16) // back
    
    // // build model.helmet
    model.helmet    = createCube(sizes.helmetH, sizes.helmetH, sizes.helmetH, tMaterialt);
    model.headGroup.add(model.helmet);
    translateY(model.helmet, sizes.headH/2);
                    // .back()
    var tGeometry   = model.helmet.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0, 48, 24, 56, 16) // left
    mapUv(tGeometry, 1, 32, 24, 40, 16) // right
    mapUv(tGeometry, 2, 40, 32, 48, 24) // top
    mapUv(tGeometry, 3, 48, 32, 56, 24) // bottom
    mapUv(tGeometry, 4, 40, 24, 48, 16) // front
    mapUv(tGeometry, 5, 56, 24, 64, 16) // back
    
    
    // build model.body
    model.body  = createCube(sizes.bodyW, sizes.bodyH, sizes.bodyD, tMaterial);
    model.root.add(model.body);
    translateY(model.body, sizes.legH + sizes.bodyH/2);
    var tGeometry   = model.body.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0, 28, 12, 32,  0) // left
    mapUv(tGeometry, 1, 16, 12, 20,  0) // right
    mapUv(tGeometry, 2, 20, 16, 28, 12) // top
    mapUv(tGeometry, 3, 28, 16, 32, 12) // bottom
    mapUv(tGeometry, 4, 20, 12, 28,  0) // front
    mapUv(tGeometry, 5, 32, 12, 40,  0) // back

    // build model.armR
    model.armR  = createCube(sizes.armW, sizes.armH, sizes.armD, tMaterial);
    model.root.add(model.armR);
    translateY(model.armR, -sizes.armH/2 + sizes.armW/2);
                    // .back()
    translateX(model.armR, -sizes.bodyW/2 - sizes.armW/2);
    translateY(model.armR, sizes.legH + sizes.bodyH - sizes.armW/2);
    var tGeometry   = model.armR.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0, 48, 12, 52,  0) // right
    mapUv(tGeometry, 1, 40, 12, 44,  0) // left
    mapUv(tGeometry, 2, 44, 16, 48, 12) // top
    mapUv(tGeometry, 3, 48, 16, 52, 12) // bottom
    mapUv(tGeometry, 4, 44, 12, 48,  0) // front
    mapUv(tGeometry, 5, 52, 12, 56,  0) // back
    
    // build model.armL
    model.armL  = createCube(sizes.armW, sizes.armH, sizes.armD, tMaterial);
    model.root.add(model.armL);
    translateY(model.armL, -sizes.armH/2 + sizes.armW/2);
                    // .back()
    translateX(model.armL, sizes.bodyW/2 + sizes.armW/2);
    translateY(model.armL, sizes.legH + sizes.bodyH - sizes.armW/2);
    var tGeometry   = model.armL.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0, 44, 12, 40,  0) // right
    mapUv(tGeometry, 1, 52, 12, 48,  0) // left
    mapUv(tGeometry, 2, 44, 16, 48, 12) // top
    mapUv(tGeometry, 3, 48, 16, 52, 12) // bottom
    mapUv(tGeometry, 4, 48, 12, 44,  0) // front
    mapUv(tGeometry, 5, 56, 12, 52,  0) // back

    // build model.legR
    model.legR  = createCube(sizes.legW, sizes.legH, sizes.legD, tMaterial);
    model.root.add(model.legR);
    translateY(model.legR, -sizes.legH/2)
                    // .back()
    translateX(model.legR, -sizes.legW/2);
    translateY(model.legR, sizes.legH);
    var tGeometry   = model.legR.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0,  8, 12, 12,  0) // right
    mapUv(tGeometry, 1,  0, 12,  4,  0) // left
    mapUv(tGeometry, 2,  4, 16,  8, 12) // top
    mapUv(tGeometry, 3,  8, 16, 12, 12) // bottom
    mapUv(tGeometry, 4,  4, 12,  8,  0) // front
    mapUv(tGeometry, 5, 12, 12, 16,  0) // back

    // build model.legL
    model.legL  = createCube(sizes.legW, sizes.legH, sizes.legD, tMaterial);
    model.root.add(model.legL);
    translateY(model.legL, -sizes.legH/2);
                    // .back()
    translateX(model.legL, sizes.legW/2)
    translateY(model.legL, sizes.legH)
    var tGeometry   = model.legL.geometry;
    tGeometry.faceVertexUvs[0] = [];
    mapUv(tGeometry, 0,  4, 12,  0,  0) // left
    mapUv(tGeometry, 1, 12, 12,  8,  0) // right
    mapUv(tGeometry, 2,  8, 16,  4, 12) // top
    mapUv(tGeometry, 3, 12, 16,  8, 12) // bottom
    mapUv(tGeometry, 4,  8, 12,  4,  0) // front
    mapUv(tGeometry, 5, 16, 12, 12,  0) // back

    this._model = model;

    this.getRoot = function() {
        return model.root;
    };

    this.setOpacity = function(opacity) {
        tMaterial.opacity = opacity;
        tMaterialt.opacity = opacity;
    }

    return this;

    function mapUv(tGeometry, faceIdx, x1, y2, x2, y1){
        var tileUvW = 1/64;
        var tileUvH = 1/32;
        var x1y1 = new THREE.Vector2(x1 * tileUvW, y1 * tileUvH);
        var x2y1 = new THREE.Vector2(x2 * tileUvW, y1 * tileUvH);
        var x2y2 = new THREE.Vector2(x2 * tileUvW, y2 * tileUvH);
        var x1y2 = new THREE.Vector2(x1 * tileUvW, y2 * tileUvH);
        tGeometry.faceVertexUvs[0][faceIdx * 2] = [x1y2, x1y1, x2y2];
        tGeometry.faceVertexUvs[0][faceIdx * 2 + 1] = [x1y1, x2y1, x2y2];
    }

    function translateOnAxis( obj, axis, distance ) {
        obj.position.add( axis.multiplyScalar( distance ) );
    }

    function translateX(obj, distance) {
        translateOnAxis( obj, new THREE.Vector3( 1, 0, 0 ), distance );
    };

    function translateY(obj, distance) {
        translateOnAxis( obj, new THREE.Vector3( 0, 1, 0 ), distance );
    };

    function translateZ(obj, distance) {
        translateOnAxis( obj, new THREE.Vector3( 0, 0, 1 ), distance );
    };

    function createCube(w, h, d, material) {
        var geometry = new THREE.BoxGeometry(w, h, d);
        // set the geometry.dynamic by default
        geometry.dynamic= true;
        return new THREE.Mesh(geometry, material)
    };
};

function Cozmo3d() {

  var that = this;

  var modelsMap = {
    'CRATE': Crate,
    'ZOMBIE': Zombie,
    'SPIDERMAN': Spiderman,
    'WALL_BRICK': WallBrick,
    'WALL_WOOD': WallWood
  };

  this._initialized = false;
  this._animationId = null;
  this._scene = null;
  this._camera = null;
  this._controls = null;
  this._floorMaterial = null;
  this._cozmo = null;
  this._cubes = [];
  this._statics = [];
  this._anaglyph = false;
  this._gridOn = false;
  this._grid = null;
  this._gridNumbers = [];
  this._models = {
    'cubes': ['CRATE', 'CRATE', 'CRATE'],
    'statics': []
  };
  this._lastCameraPos = [-500,450,500];

  this.init = function() {
    if (that._initialized) {
      return;
    }

    that._scene = new THREE.Scene();
    var canvas = document.getElementById("canvas_3d");
    var width = $(canvas).width();
    var height = $(canvas).height();
    that._camera = new THREE.PerspectiveCamera( 45, width/height, 0.01, 3000 );

    that._camera.position.set(this._lastCameraPos[0], this._lastCameraPos[1], this._lastCameraPos[2]);
    // that._camera.focalLength = 3;
    that._camera.lookAt(that._scene.position);
    that._scene.add(that._camera);

    that._renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    that._renderer.setSize(width, height);
    that._renderer.setPixelRatio( window.devicePixelRatio );

    that._controls = new THREE.OrbitControls( that._camera, canvas );
    that._controls.maxDistance = 1200;

    var light = new THREE.PointLight(0xffffff);
    light.position.set(-100,400,100);
    that._scene.add(light);

    // FLOOR
    var floorTexture = loadTexture( 'img/3d/grasslight-thin.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 1, 10 );
    that._floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.BackSide, transparent: true } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, that._floorMaterial);
    // floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    that._scene.add(floor);

    // SKYBOX
    var skyBoxGeometry = new THREE.BoxGeometry( 2000, 2000, 2000 );
    var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    that._scene.add(skyBox);

    // COZMO
    that._cozmo = new Cozmo(that._scene);
    that._cozmo.addToScene();

    // CUBES
    for (var i = 0; i < that._models.cubes.length; i++) {
      var model = that._models.cubes[i];
      var clazz = modelsMap[model];
      var instance = new clazz(that._scene);
      instance.addToScene();
      that._cubes.push(instance);
    }

    // STATICS
    for (var i = 0; i < that._models.statics.length; i++) {
      var obj = that._models.statics[i];
      var clazz = modelsMap[obj.model];
      var instance = new clazz(that._scene, obj.x1, obj.y1, obj.x2, obj.y2, obj.depth, obj.height);
      instance.addToScene();
      that._statics.push(instance);
    }

    that._effect = new THREE.AnaglyphEffect( that._renderer, width || 2, height || 2 );

    that._initialized = true;
  };

  this.deinit = function() {
    if (!that._initialized) {
      return;
    }

    that._scene = null;
    that._lastCameraPos = that._camera.position.toArray();
    that._camera = null;

    that._renderer.dispose();
    that._renderer = null;

    that._controls.dispose();
    that._controls = null;

    that._floorMaterial.dispose();
    that._floorMaterial = null;

    that._cozmo = null;
    that._cubes = [];
    that._statics = [];

    that._effect = null;

    for (var key in textureMap) {
      if (textureMap.hasOwnProperty(key)) {
        var texture = textureMap[key];
        texture.dispose();
      }
    }
    textureMap = {};

    that._initialized = false;
  };

  this.start = function() {
    if (!that._initialized) {
      return;
    }
  
    // Mock locations first to see the scene whithout any program running.
    var data = {
      "cozmo": {
        "x": 0,
        "y": 0,
        "z": 0,
        "rot": [1, 0, 0, 0]
      },
      "cubes": [{
          "x": 200,
          "y": 20,
          "z": 50,
          "rot": [0.537, 0, 0, 0.843],
          "seen": true,
          "visible": true
        }, {
          "x": 200,
          "y": -20,
          "z": 5,
          "rot": [0.643, 0, 0, 0.766],
          "seen": true,
          "visible": true
        }, {
          "x": 195,
          "y": 40,
          "z": 5,
          "rot": [0.643, 0, 0, 0.766],
          "seen": true,
          "visible": true
        }
      ]
    };

    // Override for testing
    // data = {
    //   "cozmo": {
    //     "x": 5000,
    //     "y": 5000,
    //     "z": 5000,
    //     "rot": [1, 0, 0, 0]
    //   },
    //   "cubes": [{
    //       "x": 200,
    //       "y": 20,
    //       "z": 50,
    //       "rot": [0.537, 0, 0, 0.843],
    //       "seen": false,
    //       "visible": false
    //     }, {
    //       "x": 200,
    //       "y": -20,
    //       "z": 5,
    //       "rot": [0.643, 0, 0, 0.766],
    //       "seen": false,
    //       "visible": false
    //     }, {
    //       "x": 195,
    //       "y": 40,
    //       "z": 5,
    //       "rot": [0.643, 0, 0, 0.766],
    //       "seen": false,
    //       "visible": false
    //     }
    //   ]
    // };
    that.onData(data);
    that._render();
  };
  
  this.stop = function() {
    if (!that._initialized) {
      return;
    }
    cancelAnimationFrame(that._animationId);
  };

  this._render = function () {
    that._animationId = requestAnimationFrame( that._render );

    for (var i = 0; i < that._gridNumbers.length; i++) {
      that._gridNumbers[i].lookAt(that._camera.position);
    }

    if (that.anaglyph) {
      that._effect.render(that._scene, that._camera);
    } else {
      that._renderer.render(that._scene, that._camera);
    }

    that._controls.update();
  };

  this.toggleAnaglyph = function() {
    if (!that._initialized) {
      return;
    }
    that.anaglyph = !that.anaglyph;
  };

  this.toggleGrid = function() {
    if (that._gridOn) {
      that._scene.remove(that._grid);
      that._floorMaterial.opacity = 1;
    } else {
      that._floorMaterial.opacity = 0;
      if (!that._grid) {
        that._grid = new THREE.GridHelper( 1000, 20, 0xeeeeee, 0x44ee77 );
        that._grid.position.x = 1;
        var fontLoader = new THREE.FontLoader();
        var font = fontLoader.parse(font_gentilis_bold);
        var textMaterial = new THREE.MeshBasicMaterial( { color: 0x44ee77, side: THREE.FrontSide } );
        function makeAxis(text, x, z) {
          var mesh = makeText(text);
          mesh.position.x = x;
          mesh.position.y = 50;
          mesh.position.z = z;
          that._gridNumbers.push(mesh);
          that._grid.add(mesh);
        }
        function makeText(text) {
            var textGeometry = new THREE.TextGeometry(text, {
              font: font,
              size: 30,
              height: 1
            });
            textGeometry.computeBoundingBox();
            var box = textGeometry.boundingBox;
            var offset = (box.max.x - box.min.x) / 2.0;
            textGeometry.applyMatrix(new THREE.Matrix4().makeTranslation( -offset, 0, 0 ));
            return new THREE.Mesh(textGeometry, textMaterial);
        }
        function addNumbers(x, z) {
          for (var i = -400; i < 500; i += 100) {
            var mesh;
            if (x) {
              mesh = makeText("" + (-i / 10));
              mesh.position.x = x;
              mesh.position.z = i;
            } else {
              mesh = makeText("" + i / 10);
              mesh.position.x = i;
              mesh.position.z = z;
            }
            mesh.position.y = 50;
            that._gridNumbers.push(mesh);
            that._grid.add(mesh);
          }
        }
        addNumbers(null, -500);
        addNumbers(500, null);
        makeAxis("X", -500, -500);
        makeAxis("Y", 500, 500);
      }
      that._scene.add(that._grid);
    }
    that._gridOn = !that._gridOn;
  };

  this.onData = function(data) {
    if (!that._initialized) {
      return;
    }
    if (data.cozmo || data.cubes) {
      that._cozmo.update(data.cozmo);
      for (var i = 0; i < that._cubes.length; i++) {
        that._cubes[i].update(data.cubes[i]);
      }
    } else if (data.addStaticObject) {
      var static = data.addStaticObject;
      that.addStaticModel(static.model, static.x1, static.y1, static.x2, static.y2, static.depth, static.height);
    } else if (data.setCubeModel) {
      var mod = data.setCubeModel;
      that.setCubeModel(mod.model, mod.cubeNum);
    } else if (data.aruco && data.aruco.length > 0) {
      for (var i = 0; i < data.aruco.length; i++) {
        var id = data.aruco[i].id;
        if (id == 5 || id == 10) {
          var cube;
          var r0 = data.aruco[i].rot;
          var pos = aruco2threejs.position(data.aruco[i].pos);
          var rot = aruco2threejs.rotation(data.aruco[i].rot);
          if (id == 5) {
            cube = that._cubes[1];
            tick(r0[0], r0[1], r0[2], r0[3]);
          } else if (id == 10) {
            cube = that._cubes[2];
          }

          var quat = new THREE.Quaternion(rot[0], rot[1], rot[2], rot[3])
          cube.mesh.setRotationFromQuaternion(quat);
          cube.mesh.position.x = pos[0];
          cube.mesh.position.y = pos[1];
          cube.mesh.position.z = pos[2];

          cube.setOpacity(1);
        }
      }
    }
  };

  this.setCubeModel = function(model, num) {
    console.log('Changing model for cube', model, num);
    that._models.cubes[num-1] = model;
    if (!that._initialized) {
      return;
    }
    var oldCube = that._cubes[num-1];
    var clazz = modelsMap[model];
    var instance = new clazz(that._scene);
    oldCube.copyPoseTo(instance);
    oldCube.removeFromScene(that._scene);
    instance.addToScene();
    that._cubes[num-1] = instance;
  };

  this.addStaticModel = function(model, x1, y1, x2, y2, depth, height) {
    // console.log("adding static model", model, x1, y1, x2, y2, depth, height);
    var obj = {
      "model": model,
      "x1": x1 * 10,
      "y1": y1 * 10,
      "x2": x2 * 10,
      "y2": y2 * 10,
      "depth": depth * 10,
      "height": height * 10
    };
    that._models.statics.push(obj);
    if (!that._initialized) {
      return;
    }
    var clazz = modelsMap[model];
    var instance = new clazz(that._scene, obj.x1, obj.y1, obj.x2, obj.y2, obj.depth, obj.height);
    instance.addToScene();
    that._statics.push(instance);
  };

  this.clearStatics = function() {
    for (var i = 0; i < that._statics.length; i++) {
      var instance = that._statics[i];
      instance.removeFromScene();
    }
    that._models.statics = []
    that._statics = [];
  };
}

function loadTexture(url) {
  if (textureMap[url]) {
    return textureMap[url];
  }
  var texture = textureLoader.load(url + "?" + new Date().getTime());
  textureMap[url] = texture;
  return texture;
}


///////////////// UTILS ////////////////////////

// Cozmo2ThreeJs
cozmo2threejs.pose = function(pose) {
  return convertPose(pose, cozmo2threejs.position, cozmo2threejs.rotation);
}

cozmo2threejs.position = function(position) {
  return {
    x: position.x,
    y: position.z,
    z: -position.y
  }
}

cozmo2threejs.rotation = function(rot) {
  return [-rot[2], -rot[0], -rot[1], rot[3]];
}

// ThreeJs2Cozmo
threejs2cozmo.pose = function(pose) {
  return convertPose(pose, threejs2cozmo.position, threejs2cozmo.rotation);
}

threejs2cozmo.position = function(position) {
  return {
    x: position.x,
    y: -position.z,
    z: position.y
  };
}

threejs2cozmo.rotation = function(rot) {
  return [-rot[1], -rot[2], -rot[0], rot[3]];
}

function convertPose(pose, positionFunc, quaternionFunc) {
  var position = positionFunc.call(this, pose);
  var rot = quaternionFunc.call(this, pose.rot);
  return {
    x: position.x,
    y: position.y,
    z: position.z,
    rot: rot
  };
}

// Aruco2ThreeJs
aruco2threejs.position = function(position) {
  return [position[0], position[2], -position[1]];
}

aruco2threejs.rotation = function(rot) {
  return [-rot[2], -rot[0], -rot[1], rot[3]];
}
