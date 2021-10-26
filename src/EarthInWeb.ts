import { LitElement, html, css } from 'lit';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class EarthInWeb extends LitElement {
  static styles = css``;

  renderer = new THREE.WebGLRenderer();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );

  sun = new THREE.Mesh(
    new THREE.SphereGeometry(10),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('textures/solar.jpg'),
    })
  );

  earth = new THREE.Mesh(
    new THREE.SphereGeometry(5),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('textures/earth.jpg'),
    })
  );

  clock = new THREE.Clock();

  private static _data = {
    earth: {
      radius: 30,
    },
  };

  constructor() {
    super();
    this._handleResize();
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(200, 200, 100);
    this.scene.add(
      this.sun,
      this.earth,
      light,
      new THREE.AmbientLight(0xffffff, 0.3)
    );

    Object.entries(EarthInWeb._data).forEach(([, data]) => {
      const circle = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.Path()
            .absarc(0, 0, data.radius, 0, Math.PI * 2, true)
            .getPoints(24)
        ),
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      circle.rotateX((-90 * Math.PI) / 180);
      this.scene.add(circle);
    });

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._handleResize);
    this._draw();
  }

  private _handleResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  private _draw = () => {
    requestAnimationFrame(this._draw);

    this.sun.rotateY(5e-3);
    this.earth.rotateY(1e-2);

    this.earth.position.x = Math.cos(this.clock.getElapsedTime() * 0.1) * 30;
    this.earth.position.z = -Math.sin(this.clock.getElapsedTime() * 0.1) * 30;

    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return html`<main>${this.renderer.domElement}</main> `;
  }
}
