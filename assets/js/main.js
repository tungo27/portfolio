// Main JavaScript for 3D Portfolio

// Initialize Custom Cursor
const cursor = document.querySelector(".cursor");
const cursorFollower = document.querySelector(".cursor-follower");
const links = document.querySelectorAll("a");
const buttons = document.querySelectorAll("button");

document.addEventListener("mousemove", function(e) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    
    setTimeout(function() {
        cursorFollower.style.left = e.clientX + "px";
        cursorFollower.style.top = e.clientY + "px";
    }, 100);
});

links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
        cursor.classList.add("link-hover");
        cursorFollower.classList.add("link-hover");
    });
    
    link.addEventListener("mouseleave", () => {
        cursor.classList.remove("link-hover");
        cursorFollower.classList.remove("link-hover");
    });
});

buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
        cursor.classList.add("link-hover");
        cursorFollower.classList.add("link-hover");
    });
    
    button.addEventListener("mouseleave", () => {
        cursor.classList.remove("link-hover");
        cursorFollower.classList.remove("link-hover");
    });
});

// Initial Setup
const experience = document.querySelector('.experience');
const loadingContainer = document.querySelector('.loading-container');
const canvas = document.querySelector('.webgl');

// Initialize Three.js scene
let scene, camera, renderer, controls;
let particles, clock;
let scrollY = window.scrollY;
let currentSection = 0;

// Models & Objects
let sphere, torusKnot, icosahedron;
let projectModels = [];

// Scroll Animation Observer
const observerOptions = {
    rootMargin: '0px',
    threshold: 0.25
};

// Init function
function init() {
    // Create Scene
    scene = new THREE.Scene();
    
    // Create Camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 5);
    scene.add(camera);
    
    // Create Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    
    // Initialize clock
    clock = new THREE.Clock();
    
    // Add Lights
    addLights();
    
    // Add Background Particles
    createParticles();
    
    // Create 3D Objects
    createObjects();
    
    // Initialize VanillaTilt for project cards
    initVanillaTilt();
    
    // Set up scroll animations
    setupScrollAnimations();
    
    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    
    // Mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Navigation scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Form labels animation
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.nextElementSibling.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.nextElementSibling.classList.remove('active');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            }
        });
    });
    
    // Animate
    animate();
    
    // Show content after loading
    setTimeout(() => {
        loadingContainer.style.opacity = '0';
        experience.style.opacity = '1';
        
        setTimeout(() => {
            loadingContainer.style.display = 'none';
        }, 500);
    }, 2500);
}

function initVanillaTilt() {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elements = document.querySelectorAll('.section-header, .glass-card, .project-card, .skill-tag');
    elements.forEach(el => {
        observer.observe(el);
        el.classList.add('fadeInUp');
        el.style.opacity = '0';
    });
}

function addLights() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Point Lights
    const pointLight1 = new THREE.PointLight(0x9b59ff, 1, 100);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff59b7, 1, 100);
    pointLight2.position.set(5, -5, 5);
    scene.add(pointLight2);
    
    // Add Light for Glassmorphism effect
    const pointLight3 = new THREE.PointLight(0x59ffe5, 1, 50);
    pointLight3.position.set(0, 0, 10);
    scene.add(pointLight3);
}

function createParticles() {
    // Particle geometry
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 3000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorChoices = [
        new THREE.Color(0x9b59ff),
        new THREE.Color(0xff59b7),
        new THREE.Color(0x59ffe5),
        new THREE.Color(0xbc85ff)
    ];
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        const r = 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * (Math.random() * 0.5 + 0.5);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * (Math.random() * 0.5 + 0.5);
        positions[i * 3 + 2] = r * Math.cos(phi) * (Math.random() * 0.5 + 0.5);
        
        // Color
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
        size: Math.random() * 0.15 + 0.05,
        sizeAttenuation: true,
        transparent: true,
        vertexColors: true,
        opacity: 0.8,
        depthWrite: false,
    });
    
    // Create particle system
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function createObjects() {
    // Create sphere for about section
    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b59ff,
        metalness: 0.3,
        roughness: 0.4,
        wireframe: true
    });
    
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, -3);
    scene.add(sphere);
    
    // Create objects for project section
    // Project 1 - Torus
    const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0x9b59ff,
        shininess: 100
    });
    
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-5, -10, -3);
    scene.add(torus);
    projectModels.push(torus);
    
    // Project 2 - Torus Knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16);
    const torusKnotMaterial = new THREE.MeshPhongMaterial({
        color: 0xff59b7,
        shininess: 100
    });
    
    torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(0, -10, -3);
    scene.add(torusKnot);
    projectModels.push(torusKnot);
    
    // Project 3 - Icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(1, 0);
    const icosahedronMaterial = new THREE.MeshPhongMaterial({
        color: 0x59ffe5,
        shininess: 100,
        wireframe: true
    });
    
    icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(5, -10, -3);
    scene.add(icosahedron);
    projectModels.push(icosahedron);
}

function onWindowResize() {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onScroll() {
    scrollY = window.scrollY;
    
    // Determine current section
    const sections = document.querySelectorAll('section');
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop - 100 && scrollY < sectionTop + sectionHeight - 100) {
            currentSection = i;
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach((link, index) => {
                if (index === currentSection) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            break;
        }
    }
}

function updateCamera() {
    // Move camera based on current section
    let targetPosition = new THREE.Vector3();
    
    if (currentSection === 0) { // Hero
        targetPosition.set(0, 0, 5);
    } else if (currentSection === 1) { // About
        targetPosition.set(2, 0, 5);
    } else if (currentSection === 2) { // Projects
        targetPosition.set(0, -10, 5);
    } else if (currentSection === 3) { // Contact
        targetPosition.set(0, -20, 5);
    }
    
    // Smooth camera movement
    camera.position.x += (targetPosition.x - camera.position.x) * 0.05;
    camera.position.y += (targetPosition.y - camera.position.y) * 0.05;
    camera.position.z += (targetPosition.z - camera.position.z) * 0.05;
}

function updateObjects() {
    const elapsedTime = clock.getElapsedTime();
    
    // Animate sphere
    sphere.rotation.y = 0.15 * elapsedTime;
    sphere.rotation.z = 0.12 * elapsedTime;
    sphere.scale.x = 1 + 0.1 * Math.sin(elapsedTime * 0.5);
    sphere.scale.y = 1 + 0.1 * Math.sin(elapsedTime * 0.5);
    sphere.scale.z = 1 + 0.1 * Math.sin(elapsedTime * 0.5);
    
    // Animate project models
    projectModels.forEach((model, index) => {
        model.rotation.x = 0.1 * elapsedTime;
        model.rotation.y = 0.15 * elapsedTime;
        
        // Add some hover effect
        model.position.y = -10 + Math.sin(elapsedTime * 0.5 + index) * 0.3;
        
        // Pulse effect
        model.scale.x = 1 + 0.1 * Math.sin(elapsedTime * 0.8 + index);
        model.scale.y = 1 + 0.1 * Math.sin(elapsedTime * 0.8 + index);
        model.scale.z = 1 + 0.1 * Math.sin(elapsedTime * 0.8 + index);
    });
    
    // Animate particles
    particles.rotation.x = elapsedTime * 0.02;
    particles.rotation.y = elapsedTime * 0.01;
    
    // Make particles move with mouse
    if (window.mouseX && window.mouseY) {
        particles.rotation.y = elapsedTime * 0.01 + window.mouseX * 0.0005;
        particles.rotation.x = elapsedTime * 0.02 + window.mouseY * 0.0005;
    }
    
    // Wave effect for particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Apply sine wave movement
        positions[i + 2] = z + Math.sin(elapsedTime * 0.5 + x * 0.1 + y * 0.1) * 0.1;
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update objects
    updateObjects();
    
    // Update camera position based on scroll
    updateCamera();
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
}

// Track mouse position for particle effects
window.addEventListener('mousemove', (e) => {
    window.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    window.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Initialize on window load
window.addEventListener('load', init);

// Handle project model displays
function initProjectModels() {
    const modelContainers = document.querySelectorAll('.project-model');
    
    modelContainers.forEach((container, index) => {
        const geometry = index === 0 ? 
            new THREE.TorusGeometry(1, 0.3, 16, 100) : 
            index === 1 ? 
                new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16) : 
                new THREE.IcosahedronGeometry(1, 0);
        
        const material = new THREE.MeshPhongMaterial({
            color: index === 0 ? 0x9b59ff : index === 1 ? 0xff59b7 : 0x59ffe5,
            shininess: 100,
            wireframe: index === 2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        modelContainers[index].appendChild(mesh);
    });
}