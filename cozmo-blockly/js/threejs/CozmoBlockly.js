
var CozmoBlockly = {};

CozmoBlockly.textureMap = {};
CozmoBlockly.maxAnisotropy = 0;
CozmoBlockly.loadingManager = new THREE.LoadingManager();
CozmoBlockly.textureLoader = new THREE.TextureLoader(CozmoBlockly.loadingManager);
CozmoBlockly.cozmo2threejs = {};
CozmoBlockly.threejs2cozmo = {};
CozmoBlockly.aruco2threejs = {};

CozmoBlockly.Dynamic = class {
  constructor(scene, offx, offy, offz) {
    this.scene = scene;
    this.offx = offx;
    this.offy = offy;
    this.offz = offz;

    // Default pose conversion function
    this.convertPose = CozmoBlockly.cozmo2threejs.pose;
  }

  update(data) {
    if (data.seen === false) {
      this._setOpacity(0);
    } else if (data.visible === false) {
      this._setOpacity(0.5);
    } else {
      this._setOpacity(0.5);
      var pose = this.convertPose(data);
      this.mesh.position.x = pose.x + this.offx;
      this.mesh.position.y = pose.y + this.offy;
      this.mesh.position.z = pose.z + this.offz;
      var quat = new THREE.Quaternion(pose.rot[0], pose.rot[1], pose.rot[2], pose.rot[3])
      this.mesh.setRotationFromQuaternion(quat);
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

CozmoBlockly.Static = class {
  constructor(scene, x1, y1, x2, y2, depth, height, textureUrl) {
    this.scene = scene;

    var pos1 = CozmoBlockly.cozmo2threejs.position({
      x: x1,
      y: y1,
      z: 0
    });
    var pos2 = CozmoBlockly.cozmo2threejs.position({
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
      var texture = CozmoBlockly.textureLoader.load(textureUrl);
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

CozmoBlockly.WallBrick = class extends CozmoBlockly.Static {
  constructor(scene, x1, y1, x2, y2, depth, height) {
    super(scene, x1, y1, x2, y2, depth, height, 'img/3d/wall_brick.png');
  }
}

CozmoBlockly.WallWood = class extends CozmoBlockly.Static {
  constructor(scene, x1, y1, x2, y2, depth, height) {
    super(scene, x1, y1, x2, y2, depth, height, 'img/3d/wall_wood.png');
  }
}

CozmoBlockly.Cozmo = class extends CozmoBlockly.Dynamic {
  constructor(scene) {
    super(scene, 0, 42, 0);

    var cozmoTexture = CozmoBlockly.loadTexture( 'img/3d/cozmo.png' );
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
    var mesh = this.mesh;

    this.setOpacity = function(opacity) {
      if (opacity == 0) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
      }
    }
  }
}

CozmoBlockly.Crate = class extends CozmoBlockly.Dynamic {
  constructor(scene) {
    super(scene, 0, 22.15, 0);

    var cubeTexture = CozmoBlockly.loadTexture('img/3d/crate.jpg');
    var cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture, side: THREE.FrontSide, transparent: true } );
    // var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x225522, side: THREE.FrontSide } );
    var cubeGeometry = new THREE.BoxGeometry( 44.3, 44.3, 44.3 );
    this.mesh = new THREE.Mesh( cubeGeometry, cubeMaterial );

    // var geometry = new THREE.EdgesGeometry( this.mesh.geometry );
    // var material = new THREE.LineBasicMaterial( { color: 0x00ff000, linewidth: 5 } );
    // var edges = new THREE.LineSegments( geometry, material );
    // this.mesh.add( edges );

    this.setOpacity = function(opacity) {
      if (opacity == 0) {
        this.mesh.visible = false;
      } else {
        this.mesh.visible = true;
        cubeMaterial.opacity = opacity;
      }
    }
  }
}


///////////////// UTILS ////////////////////////

CozmoBlockly.loadTexture = function(url, onLoad) {
  var elem = CozmoBlockly.textureMap[url];
  if (elem) {
    if (onLoad) {
      if (elem.texture.image) {
        onLoad(elem.texture);
      } else {
        elem.loaders.push(onLoad);
      }
    }
    return elem.texture;
  }

  var loaders = [];
  if (onLoad) {
    loaders.push(onLoad);
  }
  // console.log('Adding onLoad for texture', url);
  var texture = CozmoBlockly.textureLoader.load(url + "?" + new Date().getTime(), function(loadedTexture) {
    // console.log('Running onLoad for texture', url);
    // loadedTexture.anisotropy = CozmoBlockly.maxAnisotropy;
    for (var i = 0; i < loaders.length; i++) {
      loaders[i](loadedTexture);
    }
  });
  CozmoBlockly.textureMap[url] = {
    texture: texture,
    loaders: loaders
  };
  return texture;
}

CozmoBlockly.disposeTextures = function() {
  for (var key in CozmoBlockly.textureMap) {
    if (CozmoBlockly.textureMap.hasOwnProperty(key)) {
      var texture = CozmoBlockly.textureMap[key].texture;
      texture.dispose();
    }
  }
  CozmoBlockly.textureMap = {};
}

// Cozmo2ThreeJs
CozmoBlockly.cozmo2threejs.pose = function(pose) {
  return CozmoBlockly.convertPose(pose, CozmoBlockly.cozmo2threejs.position, CozmoBlockly.cozmo2threejs.rotation);
}

CozmoBlockly.cozmo2threejs.position = function(position) {
  return {
    x: position.x,
    y: position.z,
    z: -position.y
  }
}

CozmoBlockly.cozmo2threejs.rotation = function(rot) {
  return [-rot[2], -rot[0], -rot[1], rot[3]];
}

// ThreeJs2Cozmo
CozmoBlockly.threejs2cozmo.pose = function(pose) {
  return CozmoBlockly.convertPose(pose, CozmoBlockly.threejs2cozmo.position, CozmoBlockly.threejs2cozmo.rotation);
}

CozmoBlockly.threejs2cozmo.position = function(position) {
  return {
    x: position.x,
    y: -position.z,
    z: position.y
  };
}

CozmoBlockly.threejs2cozmo.rotation = function(rot) {
  return [-rot[1], -rot[2], -rot[0], rot[3]];
}

CozmoBlockly.convertPose = function(pose, positionFunc, quaternionFunc) {
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
CozmoBlockly.aruco2threejs.pose = function(pose) {
  return CozmoBlockly.convertPose(pose, CozmoBlockly.aruco2threejs.position, CozmoBlockly.aruco2threejs.rotation);
}

CozmoBlockly.aruco2threejs.position = function(pose) {
  return {
    x: pose.pos[0],
    y: pose.pos[2],
    z: -pose.pos[1]
  };
}

CozmoBlockly.aruco2threejs.rotation = function(rot) {
  return [rot[1], rot[3], rot[2], rot[0]];
}
