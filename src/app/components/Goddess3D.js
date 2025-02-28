"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

export default function Goddess3D() {
  const { scene } = useGLTF("/goddess_model.glb"); // 🔥 3D-Modell laden

  return (
    <div className="w-full h-[400px]"> 
      <Canvas 
        camera={{ position: [0, 1.5, 5], fov: 35, near: 0.1, far: 6000 }} 
        gl={{ alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[-2, 4, 2]} intensity={2.2} />
        <directionalLight position={[2, 5, 2]} intensity={1.5} />
        <Suspense fallback={null}>
            <primitive object={scene} scale={1.6} position={[0, -1.5, -0.3]} />
        </Suspense>
        <OrbitControls 
          makeDefault 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.6} 
          disableTouch={true} 
          target={[0, -1.5, 0]}
        />
      </Canvas>
    </div>
  );
}