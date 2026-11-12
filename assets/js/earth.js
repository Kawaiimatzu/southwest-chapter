
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

/* ==========================================
   SOUTHWEST CHAPTER
   INTERACTIVE 3D EARTH
========================================== */

const canvas = document.getElementById('earth-canvas');
const hero = document.querySelector('.earth-hero');
const hint = document.querySelector('.earth-hint');
const regionLabel = document.querySelector('.earth-region-label');
const mapCard = document.querySelector('.southwest-map-card');
const earthControl = document.getElementById('earthControl');
const earthControlText = document.getElementById('earthControlText');

if (!canvas) {
    console.error('Earth canvas not found.');
} else {

    /* --------------------------------------
       SCENE
    -------------------------------------- */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        40,
        1,
        0.1,
        100
    );

    camera.position.set(0, 0, 5.5);

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


    /* --------------------------------------
       EARTH GROUP
    -------------------------------------- */

    const earthGroup = new THREE.Group();

    scene.add(earthGroup);

    const earthGeometry = new THREE.SphereGeometry(
        1.55,
        96,
        96
    );


    /* --------------------------------------
       LOAD EARTH TEXTURES
    -------------------------------------- */

    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
        () => {
            earthTexture.colorSpace = THREE.SRGBColorSpace;
        }
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


    /* --------------------------------------
       CLOUD LAYER
    -------------------------------------- */

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


    /* --------------------------------------
       ATMOSPHERE GLOW
    -------------------------------------- */

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

                gl_Position = projectionMatrix *
                    modelViewMatrix *
                    vec4(position, 1.0);
            }
        `,

        fragmentShader: `
            varying vec3 vNormal;

            void main() {
                float intensity = pow(
                    0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)),
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


    /* --------------------------------------
       LIGHTING
    -------------------------------------- */

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


    /* --------------------------------------
       STAR FIELD
    -------------------------------------- */

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


    /* --------------------------------------
       RESPONSIVE CAMERA
    -------------------------------------- */

    let viewportWidth = window.innerWidth;

    function updateSize() {

        const parent = canvas.parentElement;

        const width = parent.clientWidth;
        const height = parent.clientHeight;

        viewportWidth = window.innerWidth;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;

        camera.fov = viewportWidth <= 768 ? 48 : 40;

        camera.updateProjectionMatrix();
    }

    updateSize();

    window.addEventListener('resize', updateSize);


    /* --------------------------------------
       EARTH ANIMATION STATES
    -------------------------------------- */

    const STATE = {
        INTRO: 'intro',
        GLOBAL: 'global',
        ZOOMING_IN: 'zooming-in',
        REGION: 'region',
        ZOOMING_OUT: 'zooming-out'
    };

    let currentState = STATE.INTRO;

    let targetCameraZ = 5.5;
    let targetRotationY = 0;

    let userInteracted = false;

    let returnTimer = null;

    const GLOBAL_ZOOM = 5.5;
    const REGION_ZOOM = 3.15;

    const SOUTHWEST_LONGITUDE = -81.8;


    /* --------------------------------------
       SMOOTH ANIMATION HELPER
    -------------------------------------- */

    function smoothStep(value) {

        return value * value * (3 - 2 * value);
    }


    /* --------------------------------------
       SHOW REGION INFORMATION
    -------------------------------------- */

    function showRegion() {

        if (regionLabel) {
            regionLabel.classList.add('visible');
        }

        if (mapCard) {
            mapCard.classList.add('visible');
        }

        if (hint) {
            hint.classList.add('hint-visible');
        }

        if (hero) {
            hero.classList.add('region-focused');
        }

        if (earthControlText) {
            earthControlText.textContent = 'VIEW GLOBAL EARTH';
        }
    }


    /* --------------------------------------
       HIDE REGION INFORMATION
    -------------------------------------- */

    function hideRegion() {

        if (regionLabel) {
            regionLabel.classList.remove('visible');
        }

        if (mapCard) {
            mapCard.classList.remove('visible');
        }

        if (hint) {
            hint.classList.remove('hint-visible');
        }

        if (hero) {
            hero.classList.remove('region-focused');
        }

        if (earthControlText) {
            earthControlText.textContent = 'EXPLORE SOUTHWEST CHAPTER';
        }
    }


    /* --------------------------------------
       ZOOM INTO SOUTHWEST FLORIDA
    -------------------------------------- */

    function zoomToRegion() {

        clearTimeout(returnTimer);

        currentState = STATE.ZOOMING_IN;

        hideRegion();

        targetCameraZ = REGION_ZOOM;

        targetRotationY = THREE.MathUtils.degToRad(
            SOUTHWEST_LONGITUDE
        );

    }


    /* --------------------------------------
       RETURN TO GLOBAL EARTH
    -------------------------------------- */

    function showGlobalEarth() {

        clearTimeout(returnTimer);

        userInteracted = true;

        currentState = STATE.ZOOMING_OUT;

        hideRegion();

        targetCameraZ = GLOBAL_ZOOM;

        targetRotationY = 0;

    }


    /* --------------------------------------
       START AUTOMATIC REGION ZOOM
    -------------------------------------- */

    function startRegionSequence() {

        currentState = STATE.INTRO;

        hideRegion();

        targetCameraZ = GLOBAL_ZOOM;

        targetRotationY = 0;

        earthGroup.rotation.y = 0;

        /*
           Allow the visitor to see the
           rotating Earth before zooming in.
        */

        setTimeout(() => {

            if (currentState !== STATE.INTRO) {
                return;
            }

            zoomToRegion();

        }, 5000);

    }


    /* --------------------------------------
       EARTH CLICK INTERACTION
    -------------------------------------- */

    function handleEarthClick() {

        if (
            currentState === STATE.REGION ||
            currentState === STATE.ZOOMING_IN
        ) {

            showGlobalEarth();

        } else {

            zoomToRegion();

        }

    }

    canvas.addEventListener(
        'click',
        handleEarthClick
    );


    /* --------------------------------------
       CONTROL BUTTON
    -------------------------------------- */

    if (earthControl) {

        earthControl.addEventListener('click', (event) => {

            event.stopPropagation();

            if (
                currentState === STATE.REGION ||
                currentState === STATE.ZOOMING_IN
            ) {

                showGlobalEarth();

            } else {

                zoomToRegion();

            }

        });

    }


    /* --------------------------------------
       AUTOMATIC RETURN TO REGION
    -------------------------------------- */

    function scheduleRegionReturn() {

        clearTimeout(returnTimer);

        returnTimer = setTimeout(() => {

            if (currentState === STATE.GLOBAL) {

                zoomToRegion();

            }

        }, 10000);

    }


    /* --------------------------------------
       ANIMATION LOOP
    -------------------------------------- */

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        /*
           Slow rotation while showing
           the entire Earth.
        */

        if (
            currentState === STATE.INTRO ||
            currentState === STATE.GLOBAL
        ) {

            earthGroup.rotation.y += 0.0015;

        }

        clouds.rotation.y += 0.00025;

        /*
           Smooth camera movement.
        */

        camera.position.z += (
            targetCameraZ - camera.position.z
        ) * 0.025;


        /*
           Smooth Earth orientation.
        */

        let rotationDifference =
            targetRotationY - earthGroup.rotation.y;

        rotationDifference = Math.atan2(
            Math.sin(rotationDifference),
            Math.cos(rotationDifference)
        );

        if (
            currentState === STATE.ZOOMING_IN ||
            currentState === STATE.ZOOMING_OUT
        ) {

            earthGroup.rotation.y +=
                rotationDifference * 0.025;

        }


        /*
           Complete zoom-in animation.
        */

        if (
            currentState === STATE.ZOOMING_IN &&
            Math.abs(camera.position.z - REGION_ZOOM) < 0.025 &&
            Math.abs(rotationDifference) < 0.01
        ) {

            currentState = STATE.REGION;

            showRegion();

        }


        /*
           Complete zoom-out animation.
        */

        if (
            currentState === STATE.ZOOMING_OUT &&
            Math.abs(camera.position.z - GLOBAL_ZOOM) < 0.025
        ) {

            currentState = STATE.GLOBAL;

            scheduleRegionReturn();

        }


        /*
           Gentle star field movement.
        */

        stars.rotation.y = elapsed * 0.002;

        renderer.render(scene, camera);

    }


    /* --------------------------------------
       START EXPERIENCE
    -------------------------------------- */

    animate();

    startRegionSequence();


    /* --------------------------------------
       CLEANUP ON PAGE EXIT
    -------------------------------------- */

    window.addEventListener('beforeunload', () => {

        clearTimeout(returnTimer);

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

    });

}
