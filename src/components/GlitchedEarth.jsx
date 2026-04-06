import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Helper to convert lat/lng to sphere point
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  
  return new THREE.Vector3(x, y, z);
}

export default function GlitchedEarth() {
  const mountRef = useRef(null);
  const [geoData, setGeoData] = useState(null);

  // Fetch Kenya GeoJSON
  useEffect(() => {
    fetch('/world.json')
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!mountRef.current || !geoData) return;
    
    const container = mountRef.current;
    
    // Keep canvas elements cleared out for strict mode
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    // Adjust WebGL Camera FOV to act organically like a zoom lens
    const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5.5;
    camera.position.x = 0;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radius = 1.6;
    
    // --- 1. GLOBE OUTLINES ---
    const worldPositions = [];
    const kenyaPositions = [];

    const addPolygon = (ring, isKenya) => {
      // GeoJSON coordinates come in as [longitude, latitude]
      let lastP = null;
      for (let i = 0; i < ring.length - 1; i++) {
          if (isKenya) {
            // Scale Kenya geometrically outwards from its center (~Lat 0, Lng 38) to drastically enlarge it!
            const scaledLat = 0.0 + (ring[i][1] - 0.0) * 2.2;
            const scaledLng = 38.0 + (ring[i][0] - 38.0) * 2.2;
            const p1 = latLngToVector3(scaledLat, scaledLng, radius * 1.15); // Push it outward to hover
            if (!lastP || p1.distanceTo(lastP) > 0.02) { 
              kenyaPositions.push(p1.x, p1.y, p1.z); 
              lastP = p1;
            }
          } else {
            const p1 = latLngToVector3(ring[i][1], ring[i][0], radius);
            const p2 = latLngToVector3(ring[i+1][1], ring[i+1][0], radius);
            worldPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
          }
      }
    };

    geoData.features.forEach(feature => {
      const isKenya = feature.properties.name === 'Kenya' || feature.properties.ADMIN === 'Kenya';
      if (feature.geometry && feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates.forEach(ring => addPolygon(ring, isKenya));
      } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(poly => poly.forEach(ring => addPolygon(ring, isKenya)));
      }
    });

    const worldLineGeom = new THREE.BufferGeometry();
    worldLineGeom.setAttribute('position', new THREE.Float32BufferAttribute(worldPositions, 3));
    const worldLineMat = new THREE.LineBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const worldLines = new THREE.LineSegments(worldLineGeom, worldLineMat);

    const kenyaPointGeom = new THREE.BufferGeometry();
    kenyaPointGeom.setAttribute('position', new THREE.Float32BufferAttribute(kenyaPositions, 3));
    
    // Shader to make Kenya's individual beads act as their own soft glowing outwards aura
    const kenyaMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          // Massively increased point size to allow the bead AND its outward glow to fit
          gl_PointSize = 15.0 * (1.0 / -mvPosition.z); 
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPos;
        void main() {
          // Because Kenya is scaled physically by 2.2x AND pushed out by 1.15x
          // The physical height bounds expand on the sphere.
          float normY = clamp((vPos.y + 0.33) / 0.68, 0.0, 1.0);
          
          vec3 blackColor = vec3(0.04, 0.04, 0.04); 
          vec3 redColor = vec3(0.95, 0.05, 0.05);
          vec3 greenColor = vec3(0.05, 0.85, 0.1);
          vec3 whiteColor = vec3(1.0, 1.0, 1.0);
          
          vec3 kenyaColor = vec3(1.0);
          if (normY < 0.25) kenyaColor = greenColor;
          else if (normY < 0.35) kenyaColor = whiteColor;
          else if (normY < 0.65) kenyaColor = redColor;
          else if (normY < 0.75) kenyaColor = whiteColor;
          else kenyaColor = blackColor;

          float pulse = 0.5 + 0.5 * sin(time * 3.0 + vPos.x * 10.0 - vPos.y * 5.0);
          vec3 finalColor = mix(kenyaColor * 1.5, whiteColor * 0.8, pulse * 0.4); 

          vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
          float dist = dot(circCoord, circCoord);
          if (dist > 1.0) discard;

          // Solid bead core
          float alpha = 1.0;
          // Soft ambient outer glow for the bead stretching outwards
          if (dist > 0.15) {
             alpha = exp(-(dist - 0.15) * 5.0) * 0.95;
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const kenyaPoints = new THREE.Points(kenyaPointGeom, kenyaMaterial);

    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = -Math.PI / 2.5; 
    earthGroup.rotation.x = 0.1;
    
    earthGroup.add(worldLines);
    earthGroup.add(kenyaPoints);

    // GLOBAL ATMOSPHERE GLOW REMOVED

    scene.add(earthGroup);


    // --- 2. ORBITAL RINGS & FLIGHT PLANES REMOVED ---
    const planesData = [];
    const lineMaterials = [];

    // --- 3. AMBIENT DUST ---
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 800;
    const posArray = new Float32Array(dustCount * 3);
    for(let i=0; i<dustCount*3; i++) posArray[i] = (Math.random() - 0.5) * 10;
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const dustMaterial = new THREE.PointsMaterial({ size: 0.015, color: 0x00ffff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // --- 4. TWINKLING STARS & COMETS ---
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const sPosArray = new Float32Array(starsCount * 3);
    const blinkArray = new Float32Array(starsCount);

    for(let i=0; i<starsCount*3; i+=3) {
      sPosArray[i] = (Math.random() - 0.5) * 60;
      sPosArray[i+1] = (Math.random() - 0.5) * 60;
      sPosArray[i+2] = -15 - Math.random() * 20; 
      blinkArray[i/3] = Math.random();
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(sPosArray, 3));
    starsGeometry.setAttribute('blinkOffset', new THREE.BufferAttribute(blinkArray, 1));

    const starsMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float blinkOffset;
        varying float vBlink;
        void main() {
          vBlink = blinkOffset;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.5 + blinkOffset * 2.0) * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying float vBlink;
        void main() {
          vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
          if (dot(circCoord, circCoord) > 1.0) discard;
          float alpha = 0.4 + 0.6 * sin(time * 2.0 + vBlink * 10.0);
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.7);
        }
      `,
      uniforms: { time: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Traveling Comets
    const lineVertexShader = `
      attribute float progress;
      varying float vProgress;
      void main() {
        vProgress = progress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const comets = [];
    const cometsGroup = new THREE.Group();
    for(let i=0; i<4; i++) {
      const g = new THREE.BufferGeometry();
      const pos = new Float32Array([0,0,0, -2,1,0]); // tail length angle
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pArr = new Float32Array([0, 1]); 
      g.setAttribute('progress', new THREE.BufferAttribute(pArr, 1));
      
      const m = new THREE.ShaderMaterial({
        vertexShader: lineVertexShader,
        fragmentShader: `
          varying float vProgress;
          void main() {
             float alpha = 1.0 - vProgress;
             gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.5);
          }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const comet = new THREE.Line(g, m);
      comet.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*30, -15 - Math.random()*10);
      comet.userData = { speed: Math.random() * 0.3 + 0.2, dir: new THREE.Vector3(1, -0.5, 0).normalize() };
      cometsGroup.add(comet);
      comets.push(comet);
    }
    scene.add(cometsGroup);

    // --- MOUSE PARALLAX ---
    let mouseX=0, mouseY=0, targetY=0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', onMouseMove);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      kenyaMaterial.uniforms.time.value = elapsedTime;
      lineMaterials.forEach(m => m.uniforms.time.value = elapsedTime);
      starsMaterial.uniforms.time.value = elapsedTime;

      // Animate planes flying entirely closed orbits synced with trailing shaders
      planesData.forEach(pd => {
          let t = (elapsedTime * pd.speed) % 1.0;
          if (t < 0) t += 1.0;
          
          pd.mesh.visible = true;
          const pos = pd.curve.getPoint(t);
          pd.mesh.position.copy(pos);
          
          let nextT = (t + 0.01) % 1.0;
          pd.mesh.lookAt(pd.curve.getPoint(nextT));
      });

      comets.forEach(c => {
        c.position.addScaledVector(c.userData.dir, c.userData.speed);
        if (c.position.x > 30 || c.position.y < -20) {
           c.position.set(-30 - Math.random()*20, 20 + Math.random()*20, -15 - Math.random()*10);
        }
      });

      targetY = mouseY * 1.2;
      
      // Overhauled Parallax Math driving deep smooth interaction
      earthGroup.rotation.y += 0.002;
      earthGroup.rotation.x += 0.1 * (targetY - earthGroup.rotation.x);
      
      camera.position.x += (mouseX * 4.0 - camera.position.x) * 0.06;
      camera.position.y += (-mouseY * 4.0 - camera.position.y) * 0.06;
      camera.lookAt(scene.position);
      
      dust.rotation.y = elapsedTime * 0.02;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      worldLineGeom.dispose();
      worldLineMat.dispose();
      kenyaPointGeom.dispose();
      if(typeof kenyaMaterial !== 'undefined' && kenyaMaterial.dispose) kenyaMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      renderer.dispose();
    };
  }, [geoData]); // re-run setup once geoData loads

  return (
    <div id="canvas-container" style={{ position: 'fixed', top:0, left:0, width: '100%', height: '100%', zIndex: -1 }}>
      <div ref={mountRef} />
    </div>
  );
}
