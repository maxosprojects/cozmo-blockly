
function Cozmo3d() {

  var that = this;

  var modelsMap = {
    'CRATE': CozmoBlockly.Crate,
    'ZOMBIE': CozmoBlockly.Zombie,
    'SPIDERMAN': CozmoBlockly.Spiderman,
    'WALL_BRICK': CozmoBlockly.WallBrick,
    'WALL_WOOD': CozmoBlockly.WallWood
  };

  this._initialized = false;
  this._animationId = null;
  this._dirty = false;
  this._scene = null;
  this._camera = null;
  this._cameraOrthographic = null;
  this._controls = null;
  this._calibrator = null;
  this._floor = null;
  this._light = null;
  this._ground = null;
  this._cozmo = null;
  this._cubes = [];
  this._statics = [];
  this._characters = [];
  this._anaglyph = false;
  this._gridOn = false;
  this._perspective = true;
  this._grid = null;
  this._gridNumbers = [];
  this._models = {
    'cubes': ['CRATE', 'CRATE', 'CRATE'],
    'statics': [],
    'characters': []
  };
  this._lastCameraPos = [-500,450,500];
  this.camUpdate = function(){};
  this._nonArCameraPos = null;
  this._nonArCameraQuat = null;
  that._nonArAnaglyph = false;
  that._nonArPerspective = true;
  this._arOn = false;
  this._defaultCamFov = 45;

  this.init = function() {
    if (that._initialized) {
      return;
    }

    that._scene = new THREE.Scene();
    var canvas = document.getElementById("canvas_3d");
    var width = $(canvas).width();
    var height = $(canvas).height();
    that._camera = new THREE.PerspectiveCamera( that._defaultCamFov, width/height, 0.1, 4000 );
    that._cameraOrthographic = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, 0.1, 4000 );

    var pos = this._lastCameraPos;
    that._camera.position.set(pos[0], pos[1], pos[2]);
    that._cameraOrthographic.position.set(pos[0], pos[1], pos[2]);
    // that._camera.focalLength = 3;
    that._camera.lookAt(that._scene.position);
    that._cameraOrthographic.lookAt(that._scene.position);
    that._scene.add(that._camera);
    that._scene.add(that._cameraOrthographic);

    that._renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    that._renderer.setSize(width, height);
    that._renderer.setPixelRatio( window.devicePixelRatio );
    
    // that._renderer.sortObjects = false;

    that._renderer.setClearColor( 0x9999ff, 1 );

    // var light = new THREE.PointLight(0xffffff, 1, 10000);
    // light.position.set(-100,400,100);
    // that._scene.add(light);

    // var lights = [];
    // lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );

    // lights[0].position.set( 0, 200, 0 );
    // lights[1].position.set( 100, 200, 100 );
    // lights[2].position.set( - 100, - 200, - 100 );

    // that._scene.add( lights[0] );
    // that._scene.add( lights[1] );
    // that._scene.add( lights[2] );

    that._light = new THREE.DirectionalLight(0xffffff, 2);
    that._light.position.set(100, 800, 1400);
    var target = new THREE.Object3D();
    target.position.set(0, -1000, 0);
    that._scene.add(target);
    that._scene.add(that._light);
    that._light.target = target;

    // that._scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
    // that._scene.fog.color.setHSL( 0.6, 0, 1 );

    // var ambientLight = new THREE.AmbientLight( 0xffffff );
    // that._scene.add( ambientLight );

    // GROUND
    that._ground = new THREE.Object3D();

    // FLOOR
    var floorTexture = CozmoBlockly.loadTexture( 'img/3d/grasslight-thin.jpg' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
    floorTexture.repeat.set( 1, 10 );
    // var floorTexture = new THREE.Texture(document.getElementById('canvas_cam'));
    // that.camUpdate = function() {floorTexture.needsUpdate = true};
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.FrontSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    that._floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.position.y = -0.5;
    that._floor.rotation.x = -Math.PI / 2;
    that._ground.add(that._floor);
    that._scene.add(that._ground);

    // SKYBOX
    // var skyBoxGeometry = new THREE.BoxGeometry( 3000, 3000, 3000 );
    // var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
    // var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    // that._scene.add(skyBox);

    // COZMO
    that._cozmo = new CozmoBlockly.Cozmo(that._scene);
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

    // CHARACTERS
    for (var i = 0; i < that._models.characters.length; i++) {
      var instance = new CozmoBlockly.Character(that._scene, that._models.characters[i]);
      instance.addToScene();
      that._characters[character.id] = instance;
    }

    that._effect = new THREE.AnaglyphEffect( that._renderer, width || 2, height || 2 );

    CozmoBlockly.loadingManager.onLoad = function() {
      that._renderOnce();
    }

    that._setControls();

    that._calibrator = new THREE.Calibrator(canvas);

    // var objectLoader = new THREE.ObjectLoader();
    // objectLoader.load("models/r2d2/r2-d2.json", function (obj) {
    //   that._scene.add(obj);
    // });

    that._initialized = true;
  };

  this.deinit = function() {
    if (!that._initialized) {
      return;
    }

    that._unsetControls();
    that._calibrator.dispose();

    CozmoBlockly.loadingManager.onLoad = function() {};

    that._scene = null;
    var camera = that._perspective ? that._camera : that._cameraOrthographic;
    that._lastCameraPos = camera.position.toArray();
    that._camera = null;
    that._cameraOrthographic = null;

    that._renderer.dispose();
    that._renderer = null;

    that.camUpdate = function(){};
    that._floor = null;
    that._ground = null;

    that._cozmo = null;
    that._cubes = [];
    that._statics = [];
    that._characters = {};
    that._models = {
      'cubes': ['CRATE', 'CRATE', 'CRATE'],
      'statics': [],
      'characters': []
    };

    that._effect = null;

    for (var key in CozmoBlockly.textureMap) {
      if (CozmoBlockly.textureMap.hasOwnProperty(key)) {
        var texture = CozmoBlockly.textureMap[key];
        texture.dispose();
      }
    }
    CozmoBlockly.textureMap = {};

    that._initialized = false;
  };

  this._setControls = function() {
    var camera = that._perspective ? that._camera : that._cameraOrthographic;
    var canvas = document.getElementById("canvas_3d");
    that._controls = new THREE.OrbitControls( camera, canvas );
    that._controls.minDistance = 10;
    that._controls.maxDistance = 1200;
    that._controls.minZoom = 0.7;
    that._controls.maxZoom = 10;
    that._controls.customEventListener = function() {
      that._renderOnce();
    };
    that._controls.addEventListener('change', that._controls.customEventListener);
  };

  this._unsetControls = function() {
    that._controls.removeEventListener('change', that._controls.customEventListener);
    that._controls.dispose();
    that._controls = null;
  };

  this.start = function() {
    if (!that._initialized) {
      return;
    }
  
    // Mock locations first to see the scene whithout any program running.
    // var data = {
    //   "cozmo": {
    //     "x": 0,
    //     "y": 0,
    //     "z": 0,
    //     "rot": [1, 0, 0, 0]
    //   },
    //   "cubes": [{
    //       "x": 200,
    //       "y": 20,
    //       "z": 50,
    //       "rot": [0.537, 0, 0, 0.843],
    //       "seen": true,
    //       "visible": true
    //     }, {
    //       "x": 200,
    //       "y": -20,
    //       "z": 5,
    //       "rot": [0.643, 0, 0, 0.766],
    //       "seen": true,
    //       "visible": true
    //     }, {
    //       "x": 195,
    //       "y": 40,
    //       "z": 5,
    //       "rot": [0.643, 0, 0, 0.766],
    //       "seen": true,
    //       "visible": true
    //     }
    //   ]
    // };

    // Override for testing
    var data = {
      "cozmo": {
        "x": 0,
        "y": 0,
        "z": 0,
        "rot": [1, 0, 0, 0],
        "seen": false
      },
      "cubes": [{
          "x": 200,
          "y": 20,
          "z": 50,
          "rot": [0.537, 0, 0, 0.843],
          "seen": false,
          "visible": false
        }, {
          "x": 200,
          "y": -20,
          "z": 5,
          "rot": [0.643, 0, 0, 0.766],
          "seen": false,
          "visible": false
        }, {
          "x": 195,
          "y": 40,
          "z": 5,
          "rot": [0.643, 0, 0, 0.766],
          "seen": false,
          "visible": false
        }
      ]
    };
    that._setGrid();
    that.onData(data);
    that._render();
  };
  
  this.stop = function() {
    if (!that._initialized) {
      return;
    }
    cancelAnimationFrame(that._animationId);
  };

  this._renderOnce = function () {
    if (!that._initialized) {
      return;
    }
    that._dirty = true;
  };

  this._render = function () {
    that._controls.update()
    if (that._calibrator.isDirty()) {
      var euler = that._calibrator.getRadians();
      var degrees = that._calibrator.getDegrees();
      that._ground.setRotationFromEuler(euler);
      that._camera.up = new THREE.Vector3(0, 1, 0).applyEuler(euler);
      Code.adjustGround(-degrees.x, degrees.z, degrees.y);
      that._dirty = true;
      // console.log('rotating ground');
    }

    if (that._dirty) {
      var camera = that._perspective ? that._camera : that._cameraOrthographic;

      for (var i = 0; i < that._gridNumbers.length; i++) {
        that._gridNumbers[i].lookAt(camera.position);
      }

      if (that._anaglyph) {
        that._effect.render(that._scene, camera);
      } else {
        that._renderer.render(that._scene, camera);
      }

      that._dirty = false;
    }

    that._animationId = requestAnimationFrame(that._render);
  };

  this.toggleAnaglyph = function() {
    if (!that._initialized) {
      return;
    }
    that._anaglyph = !that._anaglyph;
    that._renderOnce();
  };

  this.toggleGrid = function() {
    that._gridOn = !that._gridOn;
    that._setGrid();
    that._renderOnce();
  };

  this.togglePerspective = function() {
    if (!that._initialized) {
      return;
    }
    var camFrom;
    var camTo;
    if (that._perspective) {
      camFrom = that._camera;
      camTo = that._cameraOrthographic;
    } else {
      camFrom = that._cameraOrthographic;
      camTo = that._camera;
    }
    var pos = camFrom.position;
    camTo.position.set(pos.x, pos.y, pos.z);
    camTo.lookAt(that._scene.position);

    that._perspective = !that._perspective;
    that._unsetControls();
    that._setControls();
    that._renderOnce();
  };

  this.cameraTo = function(axis) {
    if (!that._initialized) {
      return;
    }
    var pos;
    if (axis === 'x') {
      pos = [1500, 0, 0];
    } else if (axis === 'y') {
      pos = [0, 0, 1500];
    } else {
      pos = [0, 1500, 0];
    }
    that._camera.position.set(pos[0], pos[1], pos[2]);
    that._camera.lookAt(that._scene.position);
    that._cameraOrthographic.position.set(pos[0], pos[1], pos[2]);
    that._cameraOrthographic.lookAt(that._scene.position);
    that._renderOnce();
  };

  this._setGrid = function() {
    if (!that._gridOn) {
      if (that._grid) {
        that._ground.remove(that._grid);
      }
      that._floor.visible = true;
    } else {
      that._floor.visible = false;
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
      that._ground.add(that._grid);
    }
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
    } else if (data.arInitData) {
      console.log('Received arInitData', data.arInitData);
      that._arPos = data.arInitData.pos;
      that._arRot = data.arInitData.rot;
      that._arFov = data.arInitData.fov;
    } else if (data.aruco) {
      for (var i = 0; i < data.aruco.length; i++) {
        var markerData = data.aruco[i];
        var character = that._characters[markerData.id];
        // hack: overwrite position to not get into refactoring now
        if (that._arOn) {
          var arPos = markerData.arPos;
          // markerData.pos = arPos;
          markerData.rot = markerData.arRot;
          var posVec = new THREE.Vector3(arPos[0], arPos[1], arPos[2]);
          var length = posVec.length();
          var canvasCam = document.getElementById('canvas_cam');
          var width = canvasCam.width;
          var height = canvasCam.height;
          posVec = new THREE.Vector3((arPos[3] / width) * 2 - 1, (arPos[4] / height) * 2 - 1, 0.5);
          posVec.unproject(that._camera);
          posVec.setLength(length);
          markerData.pos = [posVec.x, posVec.z, posVec.y];
        }
        character.update(markerData);
      }
    } else if (data.character && data.character.elements.length > 0) {
      that.addCharacterModel(data.character);
    }
    that._renderOnce();
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

  this.arOn = function(on) {
    if (!that._initialized) {
      return;
    }
    if ((on && that._arOn) || (!on && !that._arOn)) {
      return;
    }
    if (on) {
      that._nonArAnaglyph = that._anaglyph;
      that._anaglyph = false;

      that._nonArPerspective = that._perspective;
      that._perspective = true;

      that._controls.enabled = false;
      that._nonArCameraPos = that._camera.position.clone();
      that._nonArCameraQuat = that._camera.quaternion.clone();

      var canvasCam = document.getElementById('canvas_cam');
      var canvas3d = document.getElementById('canvas_3d');
      $(canvas3d).width(canvasCam.width);
      $(canvas3d).height(canvasCam.height);
      var width = $(canvas3d).width();
      var height = $(canvas3d).height();
      that._camera.aspect = width / height;
      that._renderer.setSize(width, height);

      // var arPosVec = new THREE.Vector3(that._arPos[0], that._arPos[2], that._arPos[1]);
      // var vec = arPosVec.clone();
      // var unitVec = arPosVec.clone().normalize();
      // var toNormal = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), unitVec);

      // console.log(vec);
      // vec.applyQuaternion(new THREE.Quaternion(that._arRot[1], that._arRot[3], that._arRot[2], that._arRot[0]));
      // console.log(vec);
      // vec.applyQuaternion(toNormal);
      // console.log(vec);
      // that._camera.position.set(-vec.x, -vec.y, -vec.z);

      // that._camera.lookAt(that._scene)

      that._camera.position.set(0, 0, 0);
      that._camera.lookAt(new THREE.Vector3(0, 100, 0));
      that._camera.up.set(0, 0, 1);
      // that._camera.fov = that._arFov.y;

      that._camera.updateProjectionMatrix();

      that._ground.visible = false;
      that._renderer.setClearColor( 0x000000, 0 );

      that._light.position.set(100, 0, 400);
      that._light.target.position.set(0, 1000, 0);

      that._arOn = true;
    } else {
      that._anaglyph = that._nonArAnaglyph;

      that._perspective = that._nonArPerspective;

      that._controls.enabled = true;
      that._camera.position.copy(that._nonArCameraPos);
      that._camera.quaternion.copy(that._nonArCameraQuat);
      that._camera.up.set(0, 1, 0);

      var canvas3d = document.getElementById('canvas_3d');
      $(canvas3d).width('100%');
      $(canvas3d).height('100%');
      var width = $(canvas3d).width();
      var height = $(canvas3d).height();
      that._camera.aspect = width / height;
      that._renderer.setSize(width, height);
      // that._camera.fov = that._defaultCamFov;

      that._camera.updateProjectionMatrix();

      that._ground.visible = true;
      that._renderer.setClearColor( 0x9999ff, 1 );

      that._light.position.set(100, 800, 1400);
      that._light.target.position.set(0, -1000, 0);

      that._arOn = false;
    }
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

  this.addCharacterModel = function(character) {
    // console.log("adding character model", character);
    that._models.characters.push(character);
    if (!that._initialized) {
      return;
    }
    var instance = new CozmoBlockly.Character(that._scene, character);
    instance.addToScene();
    that._characters[character.id] = instance;
  };

  this.clearCharacters = function() {
    for (var key in that._characters) {
      if (that._characters.hasOwnProperty(key)) {
        var instance = that._characters[key];
        instance.removeFromScene();
      }
    }
    that._models.characters = []
    that._characters = {};
  };
}
