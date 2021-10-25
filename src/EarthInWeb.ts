import { LitElement, html, css } from 'lit';
import * as THREE from 'three';

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

  constructor() {
    super();
    this._handleResize();
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._handleResize);
    this._draw();
  }

  private _handleResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private _draw = () => {
    requestAnimationFrame(this._draw);

    this.scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(15),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      )
    );
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return html`<main>${this.renderer.domElement}</main> `;
  }
}
