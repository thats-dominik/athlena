"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

export default function Greek3D() {
  const { scene } = useGLTF("/greek-statue.glb"); // Lade das 3D-Modell

  return (
    <div className="w-full h-[600px]"> {/* Erhöhte Höhe für mehr Platz */}
      <Canvas 
        camera={{ position: [0, 2, 5], fov: 35, near: 0.1, far: 1000 }}
        gl={{ alpha: true }} // 🔥 Transparenter Hintergrund
      >
        <ambientLight intensity={1.2} /> {/* Allgemeines Licht verstärkt */}
        <directionalLight position={[-2, 4, 2]} intensity={2.2} /> {/* Stärkeres Licht von links */}
        <directionalLight position={[2, 5, 2]} intensity={1.9} /> {/* Standardlicht */}
        <Suspense fallback={null}>
        <primitive object={scene} scale={1} position={[1.6, -2.5, 0]} />
        </Suspense>
        <OrbitControls 
            makeDefault 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={1} 
            disableTouch={true} 
            target={[0.02, 0, 0.2]} // Mittelpunkt genau auf die Statue setzen
            />
      </Canvas>
    </div>
  );
}