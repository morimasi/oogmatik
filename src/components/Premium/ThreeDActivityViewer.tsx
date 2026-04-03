import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ShapeProps {
  type: 'Küp' | 'Küre' | 'Piramit' | 'Silindir';
  position: [number, number, number];
  color: string;
  label: string;
}

const GeometricShape: React.FC<ShapeProps> = ({ type, position, color, label }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'Küp': return <boxGeometry args={[1, 1, 1]} />;
      case 'Küre': return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'Piramit': return <coneGeometry args={[0.8, 1.5, 4]} />;
      case 'Silindir': return <cylinderGeometry args={[0.6, 0.6, 1.5, 32]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={meshRef}
          scale={clicked ? 1.2 : 1}
          onClick={(e) => { e.stopPropagation(); setClick(!clicked); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
          onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
        >
          {getGeometry()}
          <meshStandardMaterial 
            color={hovered ? '#fbbf24' : color} 
            metalness={0.1}
            roughness={0.2}
            envMapIntensity={1}
          />
        </mesh>
      </Float>
      
      {/* Label Text */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.25}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/lexend/v17/wlpygwvFAVdoq2_9fzc.woff"
      >
        {label}
      </Text>
    </group>
  );
};

export const ThreeDActivityViewer: React.FC<{ items?: ShapeProps[] }> = ({ items }) => {
  // Default activity items if none provided
  const defaultItems: ShapeProps[] = [
    { type: 'Küp', position: [-2, 0, 0], color: '#ef4444', label: '1. Şekil: Küp' },
    { type: 'Küre', position: [0, 0, 0], color: '#3b82f6', label: '2. Şekil: Küre' },
    { type: 'Piramit', position: [2, 0, 0], color: '#10b981', label: '3. Şekil: Piramit' },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className="w-full h-full min-h-[400px] rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] border-4 border-white shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50">
        <h3 className="font-lexend font-bold text-slate-800 text-sm">✨ Premium 3D Uzamsal Algı</h3>
        <p className="font-lexend text-xs text-slate-500">Şekillere tıklayın veya çevirin</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Environment preset="city" />
        
        {displayItems.map((item, idx) => (
          <GeometricShape key={idx} {...item} />
        ))}
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls enableZoom={true} autoRotate={true} autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};
