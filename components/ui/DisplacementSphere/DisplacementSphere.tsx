"use client"

import { useTheme } from 'next-themes';
import { useReducedMotion, useSpring, motion, cubicBezier } from 'framer-motion';
import { useInViewport, useWindowSize } from '@/hooks';
import { startTransition, useEffect, useRef } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  IUniform,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhongMaterial,
  Object3DEventMap,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  UniformsUtils,
  Vector2,
  WebGLRenderer,
} from 'three';
import { media } from '@/utils/style';
import { throttle } from '@/utils/throttle';
import { cleanRenderer, cleanScene, removeLights } from '@/utils/three';
import { useMediaQuery } from '@/hooks';

import fragmentShader from './displacementSphereFragment.glsl';
import vertexShader from './displacementSphereVertex.glsl';
import { DISPLACEMENT_SPHERE_LOAD_DURATION } from '@/utils/timing';

const springConfig = {
  stiffness: 30,
  damping: 20,
  mass: 2,
};

const parallaxFactor = 0.45;

const DisplacementSphere: React.FC = (props) => {
  const { resolvedTheme: theme } = useTheme();
  const start = useRef(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef<Vector2>();
  const renderer = useRef<WebGLRenderer>();
  const camera = useRef<PerspectiveCamera>();
  const scene = useRef<Scene>();
  const lights = useRef<(DirectionalLight | AmbientLight)[]>();
  const uniforms = useRef<{ [uniform: string]: IUniform<any>; }>();
  const material = useRef<MeshPhongMaterial>();
  const geometry = useRef<SphereGeometry>();
  const sphere = useRef<Mesh<SphereGeometry, MeshPhongMaterial, Object3DEventMap>>();
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();
  const rotationX = useSpring(0, springConfig);
  const rotationY = useSpring(0, springConfig);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    mouse.current = new Vector2(0.8, 0.5);
    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current ?? undefined,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });
    renderer.current.setSize(innerWidth, innerHeight);
    renderer.current.setPixelRatio(1);
    renderer.current.outputColorSpace = LinearSRGBColorSpace;

    camera.current = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
    camera.current.position.z = 52;

    scene.current = new Scene();

    material.current = new MeshPhongMaterial();
    material.current.onBeforeCompile = shader => {
      uniforms.current = UniformsUtils.merge([
        shader.uniforms,
        // @ts-ignore
        { time: { type: 'f', value: 0 } },
      ]);

      shader.uniforms = uniforms.current;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };

    startTransition(() => {
      geometry.current = new SphereGeometry(32, 128, 128);
      sphere.current = new Mesh(geometry.current, material.current);
      sphere.current.position.z = 0;
      // @ts-ignore
      sphere.current.modifier = Math.random();
      scene.current?.add(sphere.current);
    });

    return () => {
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
    };
  }, []);

  useEffect(() => {
    const dirLight = new DirectionalLight(0xffffff, theme === 'light' ? 1.8 : 2.0);
    const ambientLight = new AmbientLight(0xffffff, theme === 'light' ? 2.7 : 0.4);

    dirLight.position.z = 200;
    dirLight.position.x = 100;
    dirLight.position.y = 100;

    lights.current = [dirLight, ambientLight];
    lights.current.forEach(light => scene.current?.add(light));

    return () => {
      removeLights(lights.current);
    };
  }, [theme]);

  useEffect(() => {
    const { width, height } = windowSize;

    const adjustedHeight = height + height * 0.3;
    renderer.current?.setSize(width, adjustedHeight);
    if (camera.current)
      camera.current.aspect = width / adjustedHeight;
    camera.current?.updateProjectionMatrix();

    // Render a single frame on resize when not animating
    if (reduceMotion) {
      // @ts-ignore
      renderer.current?.render(scene.current, camera.current);
    }
    if (sphere.current) {
      if (width <= media.mobile) {
        sphere.current.position.x = 14;
        sphere.current.position.y = 10;
      } else if (width <= media.tablet) {
        sphere.current.position.x = 18;
        sphere.current.position.y = 14;
      } else {
        sphere.current.position.x = 22;
        sphere.current.position.y = 16;
      }
    }
  }, [reduceMotion, windowSize]);

  useEffect(() => {
    const onMouseMove = throttle((event: any) => {
      const position = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      rotationX.set(position.y / 2);
      rotationY.set(position.x / 2);
    }, 100);

    if (!isMobile && !reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY, isMobile]);

  useEffect(() => {
    let animation: number;

    const animate = () => {
      animation = requestAnimationFrame(animate);

      if (uniforms.current !== undefined) {
        uniforms.current.time.value = 0.00005 * (Date.now() - start.current);
      }
      if (sphere.current) {
        sphere.current.rotation.z += 0.001;
        sphere.current.rotation.x = rotationX.get();
        sphere.current.rotation.y = rotationY.get();
        // @ts-ignore
        renderer.current?.render(scene.current, camera.current);
      }
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      if (sphere.current) {
        // @ts-ignore
        renderer.current?.render(scene.current, camera.current);
      }
    }

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  // for using Parallax Effect only when not in mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!canvasRef.current) return;
      canvasRef.current.style.transform = `translateY(${window.scrollY * parallaxFactor}px)`;
    }
    if (!isMobile) {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <motion.canvas
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: cubicBezier(0.4, 0.0, 0.2, 1), duration: DISPLACEMENT_SPHERE_LOAD_DURATION }}
      className="bg-background transition-colors-400 absolute inset-0"
      aria-hidden
      ref={canvasRef}
      {...props}
    />
  );
};

export default DisplacementSphere;
