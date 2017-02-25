var MinecraftChar = function(url){
    // var url = "img/spiderman.png";
    
    var tTexture    = THREE.ImageUtils.loadTexture( url );
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
        var geometry = new THREE.CubeGeometry(w, h, d);
        // set the geometry.dynamic by default
        geometry.dynamic= true;
        return new THREE.Mesh(geometry, material)
    };
};
