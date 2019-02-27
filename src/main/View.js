import Camera from "../../node_modules/dlib/3d/Camera.js";
import GLRayMarchingObject from "../../node_modules/dlib/gl/objects/GLRayMarchingObject.js";
import TrackballController from "../../node_modules/dlib/3d/controllers/TrackballController.js";
import Vector3 from "../../node_modules/dlib/math/Vector3.js";

export default class View {
  constructor({
    canvas = undefined,
  } = {}) {
    this.canvas = canvas;

    const webGLOptions = {
      depth: true,
      alpha: false,
      antialias: true,
    };

    if (!/\bforcewebgl1\b/.test(window.location.search)) {
      this.gl = this.canvas.getContext("webgl2", webGLOptions);
    }
    if (!this.gl) {
      this.gl = this.canvas.getContext("webgl", webGLOptions) || this.canvas.getContext("experimental-webgl", webGLOptions);
    }

    this.camera = new Camera();

    this.cameraController = new TrackballController({
      matrix: this.camera.transform,
      distance: 5,
    });

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    const sdfObjects = [];
    for (let index = 0; index < 40; index++) {
      sdfObjects.push({
        _speed: .05 + Math.random() * .05,
        shape: "sphere",
        blend: 1,
        material: [
          Math.random(),
          Math.random(),
          Math.random(),
          1,
        ],
        position: new Vector3([
          (Math.random() * 2 - 1) * 5,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ]),
      });
    }
    this.object = new GLRayMarchingObject({
      gl: this.gl,
      sdfObjects,
      shaders: [
        {
          fragmentShaderChunks: [
            ["end", `
              float lightRatio = max(0., dot(normal, normalize(vec3(1., 1., -1.))));
              vec3 color = voxel.material.rgb;
              color += lightRatio;
              fragColor = vec4(color, voxel.material.a);
            `],
          ],
        },
      ],
    });
  }

  resize(width, height) {
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.camera.aspectRatio = width / height;
    this.update();
  }

  update() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.cameraController.update();

    for (const sdfObject of this.object.sdfObjects) {
      sdfObject.position.x += sdfObject._speed;
      sdfObject.size = 1 - Math.abs(Math.min(10, (sdfObject.position.x + 5)) / 10 * 2 - 1);
      if (sdfObject.position.x > 5) {
        sdfObject.position.x = -5;
        sdfObject.position.y = Math.random() * 2 - 1;
        sdfObject.position.z = Math.random() * 2 - 1;
        sdfObject._speed = Math.random() * .05 + .05;
      }
    }

    this.object.draw({
      // mode: this.gl.LINES,
      uniforms: {
        sdfObjects: this.object.sdfObjects,
        camera: this.camera,
      },
    });
  }
}
