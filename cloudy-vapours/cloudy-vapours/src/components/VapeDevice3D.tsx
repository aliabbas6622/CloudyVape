import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function VapeModel() {
  const groupRef = useRef<THREE.Group>(null!);

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <RoundedBox args={[1.15, 3.3, 0.52]} radius={0.18} smoothness={10} position={[0, -0.1, 0]}>
        <meshPhysicalMaterial
          color="#BAD7E1"
          metalness={0.45}
          roughness={0.1}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Gradient stripe band */}
      <RoundedBox args={[1.17, 0.07, 0.54]} radius={0.02} smoothness={6} position={[0, -0.45, 0]}>
        <meshPhysicalMaterial color="#619BB6" metalness={0.9} roughness={0.05} emissive="#619BB6" emissiveIntensity={0.15} />
      </RoundedBox>

      {/* Mouthpiece lower */}
      <RoundedBox args={[0.52, 0.75, 0.4]} radius={0.1} smoothness={8} position={[0, 1.9, 0]}>
        <meshPhysicalMaterial color="#619BB6" metalness={0.65} roughness={0.08} clearcoat={0.8} clearcoatRoughness={0.06} />
      </RoundedBox>

      {/* Mouthpiece tip */}
      <mesh position={[0, 2.48, 0]}>
        <cylinderGeometry args={[0.13, 0.19, 0.32, 32]} />
        <meshPhysicalMaterial color="#4a7d96" metalness={0.8} roughness={0.05} clearcoat={1} />
      </mesh>

      {/* Screen recess */}
      <RoundedBox args={[0.7, 1.1, 0.05]} radius={0.06} smoothness={6} position={[0, 0.36, 0.29]}>
        <meshStandardMaterial color="#071218" roughness={0.05} metalness={0.2} />
      </RoundedBox>

      {/* Screen glow surface */}
      <RoundedBox args={[0.58, 0.96, 0.04]} radius={0.04} smoothness={6} position={[0, 0.36, 0.32]}>
        <meshStandardMaterial
          color="#d4edf5"
          emissive="#619BB6"
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Side fire button */}
      <RoundedBox args={[0.075, 0.32, 0.2]} radius={0.035} smoothness={6} position={[0.615, 0.12, 0]}>
        <meshPhysicalMaterial color="#4a7d96" metalness={0.88} roughness={0.06} clearcoat={0.9} />
      </RoundedBox>

      {/* Tiny bottom port */}
      <RoundedBox args={[0.24, 0.07, 0.44]} radius={0.025} smoothness={4} position={[0, -1.72, 0]}>
        <meshStandardMaterial color="#0a1a28" roughness={0.6} />
      </RoundedBox>

      {/* Lens / camera dot */}
      <mesh position={[0, 1.12, 0.28]}>
        <circleGeometry args={[0.07, 24]} />
        <meshPhysicalMaterial color="#071218" metalness={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
}

export default function VapeDevice3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 7], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} color="#e8f4f8" />
      <directionalLight position={[6, 10, 6]} intensity={2.0} color="#ffffff" castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.7} color="#BAD7E1" />
      <pointLight position={[0, 5, 3]} intensity={0.9} color="#619BB6" />
      <pointLight position={[3, -2, 4]} intensity={0.4} color="#ffffff" />
      <Environment preset="studio" />
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.7}>
        <VapeModel />
      </Float>
    </Canvas>
  );
}
