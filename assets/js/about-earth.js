
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/* ==========================================
   SOUTHWEST CHAPTER
   ABOUT PAGE - ROTATING EARTH
   Independent animation
========================================== */

const canvas = document.getElementById('about-earth-canvas');

if (!canvas) {
    console.error('About Earth canvas not found.');
} else {

    /* SCENE */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        40,
        1,
        0.1,
        100
    );

    camera.position.set(0, 0, 5.5);


    /* RENDERER */

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;


    /* EARTH GROUP */

    const earthGroup = new THREE.Group();

    scene.add(earthGroup);


    /* EARTH TEXTURE */

    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
    );

    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const earthGeometry = new THREE.SphereGeometry(
        1.55,
        96,
        96
    );

    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 18,
        specular: new THREE.Color('#354b63')
    });

    const earth = new THREE.Mesh(
        earthGeometry,
        earthMaterial
    );

    earthGroup.add(earth);


    /* CLOUDS */

    const cloudTexture = textureLoader.load(
        'https://threejs.org/examples/textures/planets/earth_clouds_1024.png'
    );

    const cloudGeometry = new THREE.SphereGeometry(
        1.575,
        96,
        96
    );

    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.20,
        depthWrite: false
    });

    const clouds = new THREE.Mesh(
        cloudGeometry,
        cloudMaterial
    );

    earthGroup.add(clouds);


    /* ATMOSPHERE */

    const atmosphereGeometry = new THREE.SphereGeometry(
        1.68,
        96,
        96
    );

    const atmosphereMaterial = new THREE.ShaderMaterial({

        vertexShader: `
            varying vec3 vNormal;

            void main() {
                vNormal = normalize(
                    normalMatrix * normal
                );

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(position, 1.0);
            }
        `,

        fragmentShader: `
            varying vec3 vNormal;

            void main() {
                float intensity = pow(
                    0.72 - dot(
                        vNormal,
                        vec3(0.0, 0.0, 1.0)
                    ),
                    3.0
                );

                gl_FragColor = vec4(
                    0.20,
                    0.55,
                    1.0,
                    intensity * 0.65
                );
            }
        `,

        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
    });

    const atmosphere = new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
    );

    earthGroup.add(atmosphere);


    /* LIGHTING */

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.15
    );

    scene.add(ambientLight);

    const sunlight = new THREE.DirectionalLight(
        0xffffff,
        2.4
    );

    sunlight.position.set(4, 2, 5);

    scene.add(sunlight);

    const blueLight = new THREE.PointLight(
        0x397dff,
        2,
        10
    );

    blueLight.position.set(-4, 1, -2);

    scene.add(blueLight);


    /* STAR FIELD */

    const starGeometry = new THREE.BufferGeometry();

    const starPositions = [];

    for (let i = 0; i < 1400; i++) {

        const x = (Math.random() - 0.5) * 35;
        const y = (Math.random() - 0.5) * 25;
        const z = (Math.random() - 0.5) * 25;

        starPositions.push(x, y, z);
    }

    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            starPositions,
            3
        )
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.025,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(
        starGeometry,
        starMaterial
    );

    scene.add(stars);


    /* RESPONSIVE SIZE */

    function updateSize() {

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (!width || !height) return;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;

        camera.fov = window.innerWidth <= 768 ? 48 : 40;

        camera.updateProjectionMatrix();
    }

    updateSize();

    window.addEventListener('resize', updateSize);


    /* ANIMATION */

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Slow continuous Earth rotation
        earthGroup.rotation.y += 0.0015;

        // Independent cloud movement
        clouds.rotation.y += 0.00025;

        // Gentle star field movement
        stars.rotation.y = elapsed * 0.002;

        renderer.render(scene, camera);
    }

    animate();


    /* CLEANUP */

    window.addEventListener('beforeunload', () => {

        window.removeEventListener('resize', updateSize);

        renderer.dispose();

        earthGeometry.dispose();
        earthMaterial.dispose();

        cloudGeometry.dispose();
        cloudMaterial.dispose();

        atmosphereGeometry.dispose();
        atmosphereMaterial.dispose();

        starGeometry.dispose();
        starMaterial.dispose();

        earthTexture.dispose();
        cloudTexture.dispose();

    });

}
