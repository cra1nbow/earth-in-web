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
    500
  );

  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(15),
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('textures/earth.jpg'),
    })
  );

  constructor() {
    super();
    this._handleResize();
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(200, 200, 100);
    this.scene.add(this.sphere, light, new THREE.AmbientLight(0xffffff, 0.3));

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

    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return html`<main>${this.renderer.domElement}</main> `;
  }
}
