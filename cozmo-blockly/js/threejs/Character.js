
CozmoBlockly.Character = class extends CozmoBlockly.Dynamic {
  constructor(scene, character) {
    super(scene, 0, 0, 0);

    this.convertPose = CozmoBlockly.aruco2threejs.pose;
    this.id = character.id;
    var materials = [];
    var root = new THREE.Object3D();
    var elements = character.elements;

    for (var i = 0; i < elements.length; i++) {
      var elem = elements[i];
      var colorStr = elem.color.replace('#', '');
      var color = parseInt(colorStr, 16);
      var material = new THREE.MeshLambertMaterial( { color: color, side: THREE.FrontSide, transparent: true } );
      var size = elem.size;
      var mesh = createCuboid(size.width, size.height, size.depth, material);
      materials.push(material);
      root.add(mesh);
      var moveby = elem.moveby
      translate(mesh, moveby.mx, moveby.mz, moveby.my);
    }

    this.mesh = root;

    this.setOpacity = function(opacity) {
      if (opacity == 0) {
        this.mesh.visible = false;
      } else {
        this.mesh.visible = true;
        for (var i = 0; i < materials.length; i++) {
          var material = materials[i];
          material.opacity = opacity;
        }
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
