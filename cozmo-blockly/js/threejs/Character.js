
CozmoBlockly.Character = class extends CozmoBlockly.Dynamic {
  constructor(scene, elements) {
    super(scene, 0, 0, 0);

    var material = new THREE.MeshLambertMaterial( { color: 0x0074D9, side: THREE.FrontSide, transparent: true } );

    var root = new THREE.Object3D();
    for (var i = 0; i < elements.length; i++) {
      var elem = elements[i];
      var mesh = createCuboid(elem.width, elem.height, elem.depth, material);
      root.add(mesh);
      translate(mesh, elem.mx, elem.mz, elem.my);
    }

    this.mesh = root;

    this.setOpacity = function(opacity) {
      if (opacity == 0) {
        this.mesh.visible = false;
      } else {
        this.mesh.visible = true;
        material.opacity = opacity;
      }
    }
  }

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

function translate(obj, x, y, z) {
  obj.position.add(new THREE.Vector3(x, y, z));
};

function createCuboid(w, h, d, material) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  // set the geometry.dynamic by default
  geometry.dynamic= true;
  return new THREE.Mesh(geometry, material)
};
