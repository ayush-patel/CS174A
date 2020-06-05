
//// HELPER FUNCTIONS ////

function ncube(dim) { // Programatically generate vertices and edges for n-dimensional cuboid.
    let lowBound = -1, highBound = 1;
    // N-cube unrotated at init, so vertexes differring by only a single coordinate are adjacent.
    // Any more than one difference indicates non-adjacency,
    // and ncube()'s implementation ensures a vertex will never be checked against itself.
    function adjacent(v1, v2) {
        let diff = false;
        for (let i = 0; i < dim; i++) {
            if (v1[i] != v2[i]) {
                if (diff) {return false;}
                diff = true;
            }
        }
        return true;
    }

    // Perform an effective permutation of an n-bit binary number to get vertex coordinates.
    // We can also identify whether each vertex is on the front or back face/cell of the n-cube.
    let vertices = [], vertexCount = 2**dim;
    let frontV = [], backV = [];
    for (let v = 0; v < vertexCount; v++) {
        let vertex = [], secSize;
        for (let i = 0; i < dim; i++) {
            secSize = 2**(dim - i);
            vertex.push( ((v%secSize)/secSize < 1/2) ? lowBound : highBound );
        }
        vertices.push(vertex);
        if (vertex[dim-1] == lowBound) {
            backV.push(v);
        } else {
            frontV.push(v);
        }
    }

    // Determine edges by checking each vertex's adjacency with all other vertices.
    // This implementation prevents checking self-adjacency or duplicate checks.
    let edges = [];
    for (let i = 0; i < vertexCount; i++) {
        for (let j = i+1; j < vertexCount; j++) {
            if (adjacent(vertices[i], vertices[j])) {
                edges.push([i, j]);
            }
        }
    }

    // Identify the edges composing the front and back cells so they can be color coded later on.
    let frontE = [], backE = [];
    for (let i = 0, edgeCount = edges.length; i < edgeCount; i++) {
        let v1 = vertices[edges[i][0]], v2 = vertices[edges[i][1]];
        if (v1[dim-1] == v2[dim-1]) {
            if (v1[dim-1] == lowBound) {
                backE.push(i);
            } else {
                frontE.push(i);
            }
        }
    }

    return {
        vertices: vertices,
        edges: edges,
        frontVertices: frontV,
        backVertices: backV,
        frontEdges: frontE,
        backEdges: backE
    }
}
function getRotBetween(from, to) { // Use quaternion to generate 4x4 matrix performing rotation between vectors.
    // Formulas adapted from quaternion.js by Robert Eisele (C) 2016.

    // For brevity...
    let a = from[0], b = from[1], c = from[2];
    let x = to[0],   y = to[1],   z = to[2];

    // Construct normalized quaternion between vectors.
    let qw,
        qx = b*z - c*y,
        qy = c*x - a*z,
        qz = a*y - b*x;
    let dot = a*x + b*y + c*z;
    qw = dot + Math.sqrt(dot*dot + qx*qx + qy*qy + qz*qz);
    let norm = Math.sqrt(qw*qw + qx*qx + qy*qy + qz*qz);
    qw /= norm;
    qx /= norm;
    qy /= norm;
    qz /= norm;

    // Translate quaternion to 4x4 matrix.
    let wx = 2*qw*qx, wy = 2*qw*qy, wz = 2*qw*qz;
    let xx = 2*qx*qx, xy = 2*qx*qy, xz = 2*qx*qz;
    let yy = 2*qy*qy, yz = 2*qy*qz, zz = 2*qz*qz;
    return [ [1-(yy+zz),     xy-wz,     xz+wy, 0],
             [    xy+wz, 1-(xx+zz),     yz-wx, 0],
             [    xz-wy,     yz+wx, 1-(xx+yy), 0],
             [        0,         0,         0, 1] ];
}

///////////////////////////////////////////////////////////////////

//// STATIC SHAPE DEFINITIONS ////

window.Box = window.classes.Box =
    class Box extends Shape {
        constructor() {
            super("positions", "normals"); // Name the values we'll define per each vertex.  They'll have positions and normals.

            // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
            this.positions.push(...Vec.cast(
                [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
                [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
                [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]));
            // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
            // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
            this.normals.push(...Vec.cast(
                [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
                [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
                [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]));

            // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
            // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
            // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
            this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
        }
    };

///////////////////////////////////////////////////////////////////

//// DYNAMIC SHAPE DEFINITIONS ////

window.Cube_Wireframe = window.classes.Cube_Wireframe =
    class Cube_Wireframe extends Shape {
        constructor() {
            super("positions", "colors"); // Name the values we'll define per each vertex.

            // Generate geometry and set initial positions.
            let cube = ncube(3);
            this.vertices = cube.vertices;
            this.edges = cube.edges;
            this.front = cube.frontEdges;
            this.back = cube.backEdges;
            this.frontV = cube.frontVertices;
            this.backV = cube.backVertices;
            this.updatePositions(); // sets this.positions

            // Define edge colors of wireframe.
            let cf = Color.of(1, 0, 0, 1); // red front
            let cb = Color.of(0, 1, 0, 1); // green back
            let cc = Color.of(1, 1, 1, 1); // white connectors
            this.setColors(cf, cb, cc);

            // Indices not required for wireframe geometry.
            this.indexed = false;

            // Debugging variables.
            this.ori = {
                yaw: 0,     // about z (along xy, or nose-wing)
                pitch: 0,   // about y (along xz, or nose-down)
                roll: 0     // about x (along yz, or wing-down)
            }
        }

        setColors(cf, cb, cc) { // Recolor edges, which are described as either front face/cell, back face/cell, or connecting.
            this.colors = [];
            let c;
            for (let i = 0, n = this.edges.length; i < n; i++) {
                if (this.front.indexOf(i) != -1) {
                    c = cf;
                } else if (this.back.indexOf(i) != -1) {
                    c = cb;
                } else {
                    c = cc;
                }
                this.colors.push(...Vec.cast(c, c));
            }
        }
        updatePositions() { // Rebuilds this.positions to support dynamic shapes.
            let lineArr = this.getLINE();
            this.positions = [];
            for (let i = 0, n = lineArr.length; i < n; i++) {
                this.positions.push(...Vec.cast(lineArr[i]));
            }
        }
        getLINE() { // Converts vertex and edge data into format required for wireframe geometry.    // Shape.draw(..., "LINES")
            let lineArr = [], v1, v2;
            for (let edge of this.edges) {
                v1 = this.vertices[edge[0]];
                v2 = this.vertices[edge[1]];
                lineArr.push([v1[0], v1[1], v1[2]]);
                lineArr.push([v2[0], v2[1], v2[2]]);
            }
            return lineArr;
        }
        rotateAbout(axis, angle) { // Rotate about specified line ("x", "y", or "z" axes) by "angle" radians.
            let s = Math.sin(angle), c = Math.cos(angle);
            let v, t;
            for (let vertex of this.vertices) {
                v = vertex;
                switch (axis) {
                    case 'x':
                        t    = v[1]*c - v[2]*s;     // y = yc - zs
                        v[2] = v[1]*s + v[2]*c;     // z = ys + zc
                        v[1] = t;
                        break;
                    case 'y':
                        t    = v[0]*c + v[2]*s;     // x = xc + zs
                        v[2] = -v[0]*s + v[2]*c;    // z = -xs + zc
                        v[0] = t;
                        break;
                    case 'z':
                        t    = v[0]*c - v[1]*s;     // x = xc - ys
                        v[1] = v[0]*s + v[1]*c;     // y = xs + yc
                        v[0] = t;
                        break;
                }
            }
            this.updatePositions();
        }
        rotateAlong(axis, angle) { // Rotate along specified plane, or equivalently, rotate about the line orthogonal to it.
            switch (axis) {
                case 'xy':
                    this.rotateAbout('z', angle);
                    break;
                case 'xz':
                    this.rotateAbout('y', angle);
                    break;
                case 'yz':
                    this.rotateAbout('x', angle);
                    break;
            }
        }
    };

window.Hypercube_Wireframe = window.classes.Hypercube_Wireframe =
    class Hypercube_Wireframe extends Shape {
        constructor() {
            super("positions", "colors"); // Name the values we'll define per each vertex.

            // Generate 4d geometry used internally.
            let hypercube = ncube(4);
            this.vertices = hypercube.vertices;
            this.edges = hypercube.edges;
            this.front = hypercube.frontEdges;
            this.back = hypercube.backEdges;
            this.frontV = hypercube.frontVertices;
            this.backV = hypercube.backVertices;
            // Project internal geometry to 3d representation usable by tiny-graphics.
            this.updatePositions();

            // Define edge colors of wireframe.
            let cf = Color.of(1, 0, 0, 1); // red front
            let cb = Color.of(0, 1, 0, 1); // green back
            let cc = Color.of(1, 1, 1, 1); // white connectors
            this.setColors(cf, cb, cc);

            // Indices not required for wireframe geometry.
            this.indexed = false;

            // Debugging variables.
            this.ori = {
                yaw: 0,     // about zw (along xy, or nose-wing)
                pitch: 0,   // about yw (along xz, or nose-down)
                roll: 0,    // about xw (along yz, or wing-down)
                // [these terms non-standard]
                duck: 0,    // about xy (along zw)
                slip: 0,    // about xz (along yw)
                twist: 0    // about yz (along xw)
            }
        }

        setColors(cf, cb, cc) { // Recolor edges, which are described as either front face/cell, back face/cell, or connecting.
            this.colors = [];
            let c;
            for (let i = 0, n = this.edges.length; i < n; i++) {
                if (this.front.indexOf(i) != -1) {
                    c = cf;
                } else if (this.back.indexOf(i) != -1) {
                    c = cb;
                } else {
                    c = cc;
                }
                this.colors.push(...Vec.cast(c, c));
            }
        }
        updatePositions() {  // Rebuilds this.positions to support dynamic shapes.
            let lineArr = this.getLINE();
            this.positions = [];
            for (let i = 0, n = lineArr.length; i < n; i++) {
                this.positions.push(...Vec.cast(lineArr[i]));
            }
        }
        getLINE(projection) { // Projects 4d geometry into 3-space, and converts data into format required for wireframe geometry.
            let lineArr = [], v1, v2;
            for (let edge of this.edges) {
                v1 = this.vertices[edge[0]];
                v2 = this.vertices[edge[1]];
                // Only parallel projection is supported for the moment. Intended to support perspective projection in the future.
                    // switch (projection) {case 'parallel': ...; case 'perspective': ...;}
                lineArr.push([v1[0], v1[1], v1[2]]);
                lineArr.push([v2[0], v2[1], v2[2]]);
            }
            return lineArr;
        }
        rotateAbout(axis, angle) { // Rotate about specified plane by "angle" radians. Note that while 3-shapes rotate about a fixed line, 4-shapes rotate about a fixed plane.
            let s = Math.sin(angle), c = Math.cos(angle);
            let v, t;
            for (let vertex of this.vertices) {
                // Only supports predefined major axes (standard planes) until a more general matrix can be assembled.
                v = vertex; // x = v[0], y = v[1], z = v[2], w = v[3]
                switch (axis) {
                    case 'xy':
                        t    = v[2]*c - v[3]*s;     // z = zc - ws
                        v[3] = v[2]*s + v[3]*c;     // w = zs + wc
                        v[2] = t;
                        break;
                    case 'xz':
                        t    = v[1]*c - v[3]*s;     // y = yc - ws
                        v[3] = v[1]*s + v[3]*c;     // w = ys + wc
                        v[1] = t;
                        break;
                    case 'xw':
                        t    = v[1]*c + v[2]*s;     // y = yc + zs
                        v[2] = -v[1]*s + v[2]*c;    // z = -ys + zc
                        v[1] = t;
                        break;
                    case 'yz':
                        t    = v[0]*c + v[3]*s;     // x = xc + ws
                        v[3] = -v[0]*s + v[3]*c;    // w = -xs + wc
                        v[0] = t;
                        break;
                    case 'yw':
                        t    = v[0]*c + v[2]*s;     // x = xc + zs
                        v[2] = -v[0]*s + v[2]*c;    // z = -xs + zc
                        v[0] = t;
                        break;
                    case 'zw':
                        t    = v[0]*c + v[1]*s;     // x = xc + ys
                        v[1] = -v[0]*s + v[1]*c;    // y = -xs + yc
                        v[0] = t;
                        break;
                }
            }
            this.updatePositions();
        }
        rotateAlong(axis, angle) { // Rotate along specified plane, or equivalently, rotate about the plane orthogonal to it.
            switch (axis) {
                case 'xy':
                    this.rotateAbout('zw', angle);
                    break;
                case 'xz':
                    this.rotateAbout('yw', angle);
                    break;
                case 'xw':
                    this.rotateAbout('yz', angle);
                    break;
                case 'yz':
                    this.rotateAbout('xw', angle);
                    break;
                case 'yw':
                    this.rotateAbout('xz', angle);
                    break;
                case 'zw':
                    this.rotateAbout('xy', angle);
                    break;
            }
        }
    };

///////////////////////////////////////////////////////////////////

//// SCENE DEFINITIONS ////

let rots4 = {
    // 3d
    zw: false,  // yaw
    yw: false,  // pitch
    xw: true,   // roll
    // 4d
    xy: false,  // duck
    xz: false,  // slip
    yz: true    // twist
};
let colors = {
    update: false,
    cf: Color.of(1, 0, 0, 1),
    cb: Color.of(0, 1, 0, 1)
}

window.Hypercube_Scene = window.classes.Hypercube_Scene =
    class Hypercube_Scene extends Scene_Component {
        constructor(context, control_box) {
            super(context, control_box);

            // Define secondary Scene that provides movement controls.
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));
            // Set up graphics state.
            const r = context.width / context.height;
            context.globals.graphics_state.camera_transform = Mat4.translation([0, -1.5, -14])  // (camera uses inverted matrix)
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            // Initial shape definitions.
            let shapes = {
                'cube': new Cube_Wireframe(),
                'hypercube': new Hypercube_Wireframe(),
                'sphere': new Subdivision_Sphere(4),
                'box': new Box(),
                'surface': new Displacement_Rect(763, 762, img)
            };
            for (let i = 0, vertexCount = shapes['cube'].vertices.length; i < vertexCount; i++) {
                shapes['cs' + i] = new Subdivision_Sphere(2); // 3c cube vertices
            }
            for (let i = 0, edgeCount = shapes['cube'].edges.length; i < edgeCount; i++) {
                shapes['cc' + i] = new Subdivision_Cylinder(2); // 3d cube edges
            }
            for (let i = 0, vertexCount = shapes['hypercube'].vertices.length; i < vertexCount; i++) {
                shapes['hcs' + i] = new Subdivision_Sphere(2); // 3d hypercube vertices
            }
            for (let i = 0, edgeCount = shapes['hypercube'].edges.length; i < edgeCount; i++) {
                shapes['hcc' + i] = new Subdivision_Cylinder(2); // 3d hypercube edges
            }
            this.submit_shapes(context, shapes);
            // Running this.submit_shapes() loads all object data to the gpu's vertex buffer for efficiency.
            // However, this effectively freezes the shapes' definitions.
            // We need to save context (canvas_manager) so we can dynamically update later using this.shapes[shape].copy_onto_graphics_card(this.ctx.gl)
            this.ctx = context;

            // Define basic lights/materials/etc.
            // this.lights = [new Light(Vec.of(0, 5, 5, 1), Color.of(1, .4, 1, 1), 100000)];
            this.white = context.get_instance(Basic_Shader).material();
            this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
                ambient: .4,
                diffusivity: .4
            });
            this.plastic = this.clay.override({specularity: .6});
            this.colors = {
                cf: Color.of(1, 0, 0, 1), // red front
                cb: Color.of(0, 1, 0, 1), // green back
                cc: Color.of(1, 1, 1, 1)  // white connectors
            };
            this.bg_color = this.clay.override({color: Color.of(0.8, 1, 0.94, 1)}); //ivory color for the background

            this.light_source = {
                material: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {ambient: 1}, {smoothness: 1}), // defining material for ball of light
                bloom_material: context.get_instance(BloomEffect).material(Color.of(1, 1, 1, 1), {ambient: 1}, {smoothness: 1}), // ball of light with bloom effect
                x_coord: 0,
                y_coord: 0,
                z_coord: 0
            }

            // Define state variables and misc settings.
            this.colorCoding = true;
            this.frozen = false;
            this.wireframe = false;
            this.bloomeffect = false;
        }

        make_control_panel() {
            // Toggles color-coding of front/back faces/cells of shapes.
            this.key_triggered_button("Toggle Color Coding", ["n"], () => {
                this.colorCoding = !this.colorCoding;
                this.refreshColors();
            });
            // Toggles dynamic transforms of shapes. (only static rotations for now)
            this.key_triggered_button("Toggle Rotation", ["m"], () => {
                this.frozen = !this.frozen;
            });
            // Toggles flat wireframe vs 3d wireframe.
            this.key_triggered_button("Toggle 3D Wireframe", ["b"], () => {
                this.wireframe = !this.wireframe;
            });

            this.new_line();

            this.key_triggered_button("Move Light Up", ["y"], () => {
                this.light_source.y_coord += 1; 
            });

            this.key_triggered_button("Move Light Down", ["h"], () => {
                this.light_source.y_coord -= 1; 
            });

            this.key_triggered_button("Move Light Left", ["g"], () => {
                this.light_source.x_coord -= 1; 
            });

            this.key_triggered_button("Move Light Right", ["j"], () => {
                this.light_source.x_coord += 1; 
            });

            this.new_line();

            this.key_triggered_button("Bloom Effect", ["l"], () => {
                this.bloomeffect = !this.bloomeffect; 
            });
        }

        refreshColors() {
            let cf, cb, cc;
            if (this.colorCoding) {
                cf = this.colors.cf;
                cb = this.colors.cb;
                cc = this.colors.cc;
            } else {
                cf = cb = cc = this.colors.cc;
            }
            for (let shape in this.shapes) {
                if (this.shapes[shape].setColors) {
                    this.shapes[shape].setColors(cf, cb, cc);
                    this.shapes[shape].copy_onto_graphics_card(this.ctx.gl); // dynamically update color defs
                }
            }
        }

        display(graphics_state) {
            // Set up scene contents.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
            let c = this.shapes.cube;
            let hc = this.shapes.hypercube;
            let s = this.shapes.surface;
            let cylinderVec = Vec.of(0, 0, 1); // initial alignment of directional cylinder (anchored at one end)
            let cubeAnchor = Vec.of(-4, 0, 0); // center pos of dynamic cube
            let hypercubeAnchor = Vec.of(4, 0, 0); // center pos of dynamic hypercube
            let lightSourceAnchor = this.shapes.sphere;    // ball of light
            let box = this.shapes.box;

            // Perform dynamic recoloring.
            if (colors.update) {
                this.colors.cf = colors.cf;
                this.colors.cb = colors.cb;
                this.refreshColors();
                colors.update = false;
            }

            // Perform dynamic transforms (edit shape defs).
            if (!this.frozen) {
                // cube
                c.rotateAbout('z', 0.005);
                c.rotateAlong('xz', 0.005);
                c.copy_onto_graphics_card(this.ctx.gl); // dynamically update shape def
                // hypercube
                for (let axis in rots4) {
                    if (rots4[axis]) {
                        hc.rotateAbout(axis, 0.005); // rotations temporatily defined externally
                    }
                }
                hc.copy_onto_graphics_card(this.ctx.gl); // dynamically update shape def
            }

            // Perform static transforms (manipulate shapes).
            let model_transform = Mat4.identity()
                .times(Mat4.translation([0,-3,1]))
                .times(Mat4.rotation(- Math.PI / 2, Vec.of(1,0,0)))
                .times(Mat4.scale([14, 8, 1]));
            s.draw(graphics_state, model_transform, this.plastic.override({color: this.colors.cc}));

            // Creating a ball of light that will interact with our wireframe objects
            model_transform = Mat4.identity().times(Mat4.scale([0.75, 0.75, 0.75])).times(Mat4.translation([this.light_source.x_coord, this.light_source.y_coord, this.light_source.z_coord]));
            if (!this.bloomeffect) {
                lightSourceAnchor.draw(graphics_state, model_transform, this.light_source.material);
            }
            else {
                lightSourceAnchor.draw(graphics_state, model_transform, this.light_source.bloom_material);
            }
            this.lights = [new Light(Vec.of(this.light_source.x_coord, this.light_source.y_coord, this.light_source.z_coord, 1), Color.of(1, 1, 1, 1), 100000)];
            graphics_state.lights = this.lights;

            //Creating our background using thin cubes acting as 4 planes (bottom, behind, left, and right)
            model_transform = Mat4.identity().times(Mat4.translation([0, 1, -3])).times(Mat4.scale([7, 4, 0.1]));
            box.draw(graphics_state, model_transform, this.bg_color); //back surface

            model_transform = Mat4.identity().times(Mat4.rotation(- Math.PI / 2 , Vec.of(1, 0, 0))).times(Mat4.translation([0, -1, -3])).times(Mat4.scale([7, 4, 0.1]));
            box.draw(graphics_state, model_transform, this.bg_color); //bottom surface
            
            model_transform = Mat4.identity().times(Mat4.rotation(- Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.translation([1, 1, -7])).times(Mat4.scale([4, 4, 0.1]));
            box.draw(graphics_state, model_transform, this.bg_color); //right surface

            model_transform = Mat4.identity().times(Mat4.rotation(- Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.translation([1, 1, 7])).times(Mat4.scale([4, 4, 0.1]));
            box.draw(graphics_state, model_transform, this.bg_color); //left surface

            // Do we render flat wireframes...?
            if (this.wireframe) {
                model_transform = Mat4.identity().times(Mat4.translation(cubeAnchor));
                c.draw(graphics_state, model_transform, this.white, "LINES");
                model_transform = Mat4.identity().times(Mat4.translation(hypercubeAnchor));
                hc.draw(graphics_state, model_transform, this.white, "LINES");
            // Or do we render 3d wireframes...?
            } else {
                // Define vars for 3d vertices.
                let v, vc = this.colors.cc, offset_transform;
                // Define vars for 3d edges.
                let v1, v2, ec = this.colors.cc;
                let anchor, track, from, to;
                let qMat, edgeLen, lookat_transform;

                // Set cube as reference origin.
                model_transform = Mat4.identity().times(Mat4.translation(cubeAnchor));
                // Draw 3d vertices on cube.
                for (let i = 0, vertexCount = c.vertices.length; i < vertexCount; i++) {
                    v = c.vertices[i];
                    if (this.colorCoding) {vc = (c.frontV.indexOf(i) != -1) ? this.colors.cf : this.colors.cb;}
                    offset_transform = model_transform.times(Mat4.translation([v[0], v[1], v[2]])).times(Mat4.scale([0.15, 0.15, 0.15]));
                    this.shapes['cs' + i].draw(graphics_state, offset_transform, this.plastic.override({color: vc}));
                }
                // Draw 3d edges on cube.
                for (let i = 0, edgeCount = c.edges.length; i < edgeCount; i++) {
                    // calc reference vecs
                    v1 = c.vertices[c.edges[i][0]];
                    v2 = c.vertices[c.edges[i][1]];
                    anchor = Vec.of(v1[0],v1[1],v1[2]).plus(cubeAnchor); // abs pos of anchored end of cylinder
                    track = Vec.of(v2[0],v2[1],v2[2]).plus(cubeAnchor); // abs pos of vertex we're tracking
                    from = cylinderVec; // starting vec (default direction of cylinder)
                    to = track.minus(anchor); // vec to align with (describes edge)
                    // construct transformation matrix
                    edgeLen = Math.sqrt(to[0]*to[0] + to[1]*to[1] + to[2]*to[2]);
                    lookat_transform = Mat4.identity()
                                        .times(Mat4.translation([anchor[0], anchor[1], anchor[2]]))
                                        .times(getRotBetween(from, to))
                                        .times(Mat4.scale([0.05, 0.05, edgeLen]));
                    // color code if necessary
                    if (this.colorCoding) {
                        if (c.front.indexOf(i) != -1) {
                            ec = this.colors.cf;
                        } else if (c.back.indexOf(i) != -1) {
                            ec = this.colors.cb;
                        } else {
                            ec = this.colors.cc;
                        }
                    }
                    // draw
                    this.shapes['cc' + i].draw(graphics_state, lookat_transform, this.plastic.override({color: ec}));
                }

                // Set hypercube as reference origin.
                model_transform = Mat4.identity().times(Mat4.translation(hypercubeAnchor));
                // Draw 3d vertices on hypercube.
                for (let i = 0, vertexCount = hc.vertices.length; i < vertexCount; i++) {
                    v = hc.vertices[i];
                    if (this.colorCoding) {vc = (hc.frontV.indexOf(i) != -1) ? this.colors.cf : this.colors.cb;}
                    offset_transform = model_transform.times(Mat4.translation([v[0], v[1], v[2]])).times(Mat4.scale([0.15, 0.15, 0.15]));
                    this.shapes['hcs' + i].draw(graphics_state, offset_transform, this.plastic.override({color: vc}));
                }
                // Draw 3d edges on hypercube.
                for (let i = 0, edgeCount = hc.edges.length; i < edgeCount; i++) {
                    // calc reference vecs
                    v1 = hc.vertices[hc.edges[i][0]];
                    v2 = hc.vertices[hc.edges[i][1]];
                    anchor = Vec.of(v1[0],v1[1],v1[2]).plus(hypercubeAnchor); // abs pos of anchored end of cylinder
                    track = Vec.of(v2[0],v2[1],v2[2]).plus(hypercubeAnchor); // abs pos of vertex we're tracking
                    from = cylinderVec; // starting vec (default direction of cylinder)
                    to = track.minus(anchor); // vec to align with (describes edge)
                    // construct transformation matrix
                    edgeLen = Math.sqrt(to[0]*to[0] + to[1]*to[1] + to[2]*to[2]);
                    lookat_transform = Mat4.identity()
                                        .times(Mat4.translation([anchor[0], anchor[1], anchor[2]]))
                                        .times(getRotBetween(from, to))
                                        .times(Mat4.scale([0.05, 0.05, edgeLen]));
                    // color code if necessary
                    if (this.colorCoding) {
                        if (hc.front.indexOf(i) != -1) {
                            ec = this.colors.cf;
                        } else if (hc.back.indexOf(i) != -1) {
                            ec = this.colors.cb;
                        } else {
                            ec = this.colors.cc;
                        }
                    }
                    // draw
                    this.shapes['hcc' + i].draw(graphics_state, lookat_transform, this.plastic.override({color: ec}));
                }
            }
        }
    };