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
    5000,
  );

  lunaOrbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      new THREE.Path().absarc(0, 0, 1, 0, Math.PI * 2, true).getPoints(24),
    ),
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );

  clock = new THREE.Clock();

  private _1AU = 30;

  private _1earthRadi = 3e-2;

  private _orbitalPeriod = 1e-2;

  private _rotationPeriod = 1e-2;

  private _data = Object.fromEntries(
    Object.entries({
      /** 태양 */
      solar: {
        radius: 695508,
        earthRadius: 109,
        orbitalSemimajorAxis: 0,
        orbitalPeriod: 0.24,
        rotationPeriod: 25.8,
      },
      /** 목성 */
      jupiter: {
        radius: 69911,
        earthRadius: 11.2,
        orbitalSemimajorAxis: 5.2,
        orbitalPeriod: 11.9,
        rotationPeriod: 0.41,
      },
      /** 토성 */
      saturn: {
        radius: 58232,
        earthRadius: 9.5,
        orbitalSemimajorAxis: 9.5,
        orbitalPeriod: 29.4,
        rotationPeriod: 0.44,
      },
      /** 천왕성 */
      uranus: {
        radius: 25362,
        earthRadius: 4.0,
        orbitalSemimajorAxis: 19.2,
        orbitalPeriod: 84,
        rotationPeriod: -0.72,
      },
      /** 해왕성 */
      neptune: {
        radius: 24622,
        earthRadius: 3.9,
        orbitalSemimajorAxis: 30.1,
        orbitalPeriod: 164,
        rotationPeriod: 0.67,
      },
      /** 지구 */
      earth: {
        radius: 6371,
        earthRadius: 1,
        orbitalSemimajorAxis: 1.0,
        orbitalPeriod: 1,
        rotationPeriod: 1,
      },
      /** 금성 */
      venus: {
        radius: 6052,
        earthRadius: 0.95,
        orbitalSemimajorAxis: 0.72,
        orbitalPeriod: 0.62,
        rotationPeriod: -243,
      },
      /** 화성 */
      mars: {
        radius: 3389,
        earthRadius: 0.53,
        orbitalSemimajorAxis: 1.52,
        orbitalPeriod: 1.9,
        rotationPeriod: 1,
      },
      /** 수성 */
      mercury: {
        radius: 2439,
        earthRadius: 0.38,
        orbitalSemimajorAxis: 0.39,
        orbitalPeriod: 0.24,
        rotationPeriod: 59,
      },
      luna: {
        radius: 1720,
        earthRadius: 0.27,
        orbitalSemimajorAxis: 0.033,
        orbitalPeriod: 0.08,
        rotationPeriod: 27.3,
      },
    }).map(([key, data]) => [
      key,
      {
        ...data,
        mesh: new THREE.Mesh(
          new THREE.SphereGeometry(
            data.earthRadius * this._1earthRadi * (key === 'solar' ? 1 : 10),
          ),
          key === 'solar'
            ? new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(`textures/${key}.jpg`),
              })
            : new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load(`textures/${key}.jpg`),
              }),
        ),
      },
    ]),
  );

  constructor() {
    super();
    this._handleResize();
    this.camera.position.set(0, 30, 100);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(
      new THREE.PointLight(0xffffff, 1, 0),
      new THREE.AmbientLight(0xffffff, 0.1),
      this.lunaOrbit,
    );
    this.lunaOrbit.rotateX((-90 * Math.PI) / 180);

    Object.entries(this._data).forEach(([key, data]) => {
      this.scene.add(data.mesh);
      if (['luna', 'solar'].includes(key)) return;
      const circle = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.Path()
            .absarc(
              0,
              0,
              data.orbitalSemimajorAxis * this._1AU,
              0,
              Math.PI * 2,
              true,
            )
            .getPoints(24),
        ),
        new THREE.LineBasicMaterial({ color: 0xffffff }),
      );
      circle.rotateX((-90 * Math.PI) / 180);
      this.scene.add(circle);
    });

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
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

    Object.entries(this._data).forEach(([key, data]) => {
      data.mesh.rotateY(
        ((this.clock.getElapsedTime() * Math.PI * 2) / data.rotationPeriod) *
          this._rotationPeriod,
      );
      if (['luna', 'solar'].includes(key)) return;
      data.mesh.position.set(
        Math.cos(
          ((this.clock.getElapsedTime() * Math.PI * 2) /
            data.orbitalPeriod /
            365) *
            this._orbitalPeriod,
        ) *
          data.orbitalSemimajorAxis *
          this._1AU,
        0,
        -Math.sin(
          ((this.clock.getElapsedTime() * Math.PI * 2) /
            data.orbitalPeriod /
            365) *
            this._orbitalPeriod,
        ) *
          data.orbitalSemimajorAxis *
          this._1AU,
      );
    });

    this.lunaOrbit.position.copy(this._data.earth.mesh.position);

    this._data.luna.mesh.position.set(
      this._data.earth.mesh.position.x +
        Math.cos(
          ((this.clock.getElapsedTime() * Math.PI * 2) /
            this._data.luna.orbitalPeriod) *
            this._orbitalPeriod,
        ) *
          this._data.luna.orbitalSemimajorAxis *
          this._1AU,
      0,
      this._data.earth.mesh.position.z -
        Math.sin(
          ((this.clock.getElapsedTime() * Math.PI * 2) /
            this._data.luna.orbitalPeriod) *
            this._orbitalPeriod,
        ) *
          this._data.luna.orbitalSemimajorAxis *
          this._1AU,
    );

    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return html`<main>${this.renderer.domElement}</main> `;
  }
}
