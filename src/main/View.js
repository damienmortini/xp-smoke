import Camera from "../../node_modules/dlib/3d/Camera.js";
import GLRayMarchingObject from "../../node_modules/dlib/gl/objects/GLRayMarchingObject.js";
import TrackballController from "../../node_modules/dlib/3d/controllers/TrackballController.js";
import Matrix4 from "../../node_modules/dlib/math/Matrix4.js";

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
    for (let index = 0; index < 10; index++) {
      sdfObjects.push({
        spherical: 1,
        size: 1,
        blend: 0,
        position: [
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ],
      });
    }
    this.object = new GLRayMarchingObject({
      gl: this.gl,
      sdfObjects,
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

    this.object.draw({
      uniforms: {
        sdfObjects: this.object.sdfObjects,
        camera: this.camera,
      },
    });
  }
}
