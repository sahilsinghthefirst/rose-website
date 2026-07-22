"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

type RobotStageProps = {
  active: boolean;
  dark: boolean;
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

type JointProps = {
  dark: boolean;
  radius?: number;
  ringMaterials: MutableRefObject<THREE.MeshStandardMaterial[]>;
};

const rose = "#d94b68";

function Joint({ dark, radius = 0.62, ringMaterials }: JointProps) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.46, 64]} />
        <meshPhysicalMaterial
          color={dark ? "#6f747a" : "#c8cdd2"}
          metalness={0.9}
          roughness={0.19}
          clearcoat={0.7}
          clearcoatRoughness={0.22}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[radius + 0.055, 0.038, 14, 72]} />
        <meshStandardMaterial
          ref={(material) => {
            if (material && !ringMaterials.current.includes(material)) ringMaterials.current.push(material);
          }}
          color={rose}
          emissive={rose}
          emissiveIntensity={0.08}
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh position={[0, 0, 0.25]}>
        <circleGeometry args={[radius * 0.68, 48]} />
        <meshPhysicalMaterial
          color={dark ? "#24262a" : "#f4f5f3"}
          metalness={0.42}
          roughness={0.28}
          clearcoat={0.6}
        />
      </mesh>
    </group>
  );
}

function ArmSegment({ dark, length, width = 0.84 }: { dark: boolean; length: number; width?: number }) {
  return (
    <RoundedBox
      args={[width, length, width * 0.92]}
      radius={0.26}
      smoothness={8}
      position={[0, length / 2, 0]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={dark ? "#d8dad7" : "#f0f1ef"}
        metalness={0.34}
        roughness={0.2}
        clearcoat={0.86}
        clearcoatRoughness={0.18}
      />
    </RoundedBox>
  );
}

function RobotArm({ dark, progress, pointer, reducedMotion }: RobotStageProps) {
  const root = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const gripper = useRef<THREE.Group>(null);
  const ringMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const lookTarget = useRef(new THREE.Vector3());
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    if (!root.current || !shoulder.current || !elbow.current || !wrist.current || !gripper.current) return;

    const p = reducedMotion ? 0 : THREE.MathUtils.clamp(progress.current, 0, 1);
    const compact = size.width < 900;
    const phaseA = THREE.MathUtils.smoothstep(p, 0.08, 0.34);
    const phaseB = THREE.MathUtils.smoothstep(p, 0.35, 0.68);
    const phaseC = THREE.MathUtils.smoothstep(p, 0.67, 0.96);
    const explode = phaseB * (1 - phaseC * 0.62);
    const damp = (current: number, target: number, speed = 4.2) =>
      THREE.MathUtils.damp(current, target, speed, delta);

    let stageX = 1.82;
    if (p >= 0.24 && p < 0.5) stageX = THREE.MathUtils.lerp(1.82, -1.38, (p - 0.24) / 0.26);
    if (p >= 0.5 && p < 0.76) stageX = THREE.MathUtils.lerp(-1.38, 1.2, (p - 0.5) / 0.26);
    if (p >= 0.76) stageX = THREE.MathUtils.lerp(1.2, 0.2, (p - 0.76) / 0.24);
    if (compact) stageX = 0;

    const pointerX = reducedMotion ? 0 : pointer.current.x;
    const pointerY = reducedMotion ? 0 : pointer.current.y;
    root.current.position.x = damp(root.current.position.x, stageX + pointerX * 0.12);
    root.current.position.y = damp(root.current.position.y, compact ? -2.5 : -2.18 + phaseC * 0.22);
    root.current.rotation.x = damp(root.current.rotation.x, compact ? -0.02 : 0.04 + pointerY * 0.045);
    root.current.rotation.y = damp(root.current.rotation.y, 0.28 - phaseA * 0.72 + phaseC * 0.5 + pointerX * 0.12);
    root.current.rotation.z = damp(root.current.rotation.z, phaseB * 0.05);

    const targetScale = compact ? 0.72 : 0.94 + phaseA * 0.12 + phaseB * 0.14 - phaseC * 0.05;
    const scale = damp(root.current.scale.x, targetScale);
    root.current.scale.setScalar(scale);

    shoulder.current.rotation.z = damp(shoulder.current.rotation.z, -0.72 + phaseA * 0.42 + phaseC * 0.18);
    elbow.current.rotation.z = damp(elbow.current.rotation.z, 1.32 - phaseA * 0.52 + phaseC * 0.36);
    wrist.current.rotation.z = damp(wrist.current.rotation.z, -0.58 + phaseA * 0.28 - phaseC * 0.32);
    gripper.current.rotation.z = damp(gripper.current.rotation.z, phaseC * 0.25);

    elbow.current.position.y = damp(elbow.current.position.y, 2.86 + explode * 0.72);
    elbow.current.position.x = damp(elbow.current.position.x, explode * 0.16);
    wrist.current.position.y = damp(wrist.current.position.y, 2.34 + explode * 0.58);
    wrist.current.position.x = damp(wrist.current.position.x, -explode * 0.12);
    gripper.current.position.y = damp(gripper.current.position.y, 0.72 + explode * 0.42);

    const ringOpacity = 0.24 + Math.max(phaseA, phaseB) * 0.7;
    ringMaterials.current.forEach((material) => {
      material.opacity = damp(material.opacity, ringOpacity, 5.2);
      material.emissiveIntensity = damp(material.emissiveIntensity, phaseB * 0.28, 4.4);
    });

    camera.position.x = damp(camera.position.x, pointerX * 0.2 + phaseB * 0.34);
    camera.position.y = damp(camera.position.y, 0.18 - phaseA * 0.12 + pointerY * 0.14);
    camera.position.z = damp(camera.position.z, compact ? 9.3 : 8.5 - phaseA * 0.62 + phaseB * 0.4);
    lookTarget.current.set(compact ? 0 : stageX * 0.12, 0.1 + phaseC * 0.18, 0);
    camera.lookAt(lookTarget.current);
  });

  return (
    <group ref={root} position={[1.82, -2.18, 0]} scale={0.94}>
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.98, 1.14, 0.42, 72]} />
        <meshPhysicalMaterial
          color={dark ? "#484b50" : "#d8dbde"}
          metalness={0.82}
          roughness={0.24}
          clearcoat={0.68}
        />
      </mesh>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.76, 0.88, 0.38, 72]} />
        <meshPhysicalMaterial
          color={dark ? "#d2d4d1" : "#f2f3f1"}
          metalness={0.35}
          roughness={0.22}
          clearcoat={0.82}
        />
      </mesh>

      <group ref={shoulder} position={[0, 0.38, 0]} rotation={[0, 0, -0.72]}>
        <Joint dark={dark} radius={0.72} ringMaterials={ringMaterials} />
        <ArmSegment dark={dark} length={2.86} width={0.92} />

        <group ref={elbow} position={[0, 2.86, 0]} rotation={[0, 0, 1.32]}>
          <Joint dark={dark} radius={0.65} ringMaterials={ringMaterials} />
          <ArmSegment dark={dark} length={2.34} width={0.78} />

          <group ref={wrist} position={[0, 2.34, 0]} rotation={[0, 0, -0.58]}>
            <Joint dark={dark} radius={0.5} ringMaterials={ringMaterials} />
            <RoundedBox args={[0.64, 0.76, 0.64]} radius={0.2} smoothness={8} position={[0, 0.38, 0]} castShadow>
              <meshPhysicalMaterial
                color={dark ? "#d8dad7" : "#eff0ee"}
                metalness={0.38}
                roughness={0.2}
                clearcoat={0.8}
              />
            </RoundedBox>

            <group ref={gripper} position={[0, 0.72, 0]}>
              <RoundedBox args={[0.72, 0.46, 0.58]} radius={0.14} smoothness={6} position={[0, 0.2, 0]} castShadow>
                <meshStandardMaterial color={dark ? "#4e5156" : "#c2c6ca"} metalness={0.82} roughness={0.24} />
              </RoundedBox>
              <RoundedBox args={[0.18, 0.78, 0.24]} radius={0.07} smoothness={5} position={[-0.22, 0.74, 0]} castShadow>
                <meshStandardMaterial color={dark ? "#27292d" : "#50545a"} metalness={0.76} roughness={0.28} />
              </RoundedBox>
              <RoundedBox args={[0.18, 0.78, 0.24]} radius={0.07} smoothness={5} position={[0.22, 0.74, 0]} castShadow>
                <meshStandardMaterial color={dark ? "#27292d" : "#50545a"} metalness={0.76} roughness={0.28} />
              </RoundedBox>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Scene(props: RobotStageProps) {
  return (
    <>
      <ambientLight intensity={props.dark ? 1.15 : 1.55} />
      <directionalLight position={[5, 8, 7]} intensity={props.dark ? 4.2 : 3.5} color="#fff8f5" castShadow />
      <directionalLight position={[-5, 2, 5]} intensity={props.dark ? 2.4 : 1.45} color="#e8edf2" />
      <pointLight position={[0, -1, 4]} intensity={1.1} color={rose} />
      <RobotArm {...props} />
      <ContactShadows
        position={[0, -2.32, 0]}
        scale={9}
        blur={2.8}
        far={4.5}
        opacity={props.dark ? 0.38 : 0.24}
        color={props.dark ? "#050506" : "#71747a"}
        resolution={512}
      />
    </>
  );
}

export function RobotStage(props: RobotStageProps) {
  return (
    <Canvas
      className="robot-canvas"
      dpr={[1, 1.5]}
      frameloop={props.active ? "always" : "never"}
      camera={{ position: [0, 0.18, 8.5], fov: 34, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      fallback={
        <img
          className="robot-fallback"
          src="/concepts/robotic-arm-placeholder.png"
          alt="Concept rendering of the ROSE robotic arm"
        />
      }
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
