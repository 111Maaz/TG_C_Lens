"use client";
import React, { useEffect, useRef } from "react";

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: ColorRGB;
  TRANSPARENT?: boolean;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: ColorRGB;
}

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
  };
}

const SplashCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);
  const pointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const gl = useRef<WebGLRenderingContext | null>(null);
  const config = useRef<WebGLConfig | null>(null);
  const isAnimating = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL context
    gl.current = canvas.getContext('webgl', {
      alpha: true,
      preserveDrawingBuffer: false,
      premultipliedAlpha: false,
      antialias: false,
    });

    if (!gl.current) {
      console.error('WebGL not supported');
      return;
    }

    // Initialize config and shaders
    config.current = initWebGLConfig(gl.current);
    
    // Set initial canvas size
    resizeCanvas();

    // Initialize framebuffers
    const framebuffers = initFramebuffers();

    // Start animation loop immediately
    lastTime.current = performance.now();
    updateFrame();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchStart);

    // Cleanup function
    return () => {
      isAnimating.current = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const initFramebuffers = () => {
    if (!gl.current || !config.current) return null;

    const { width, height } = gl.current.canvas;
    
    // Create framebuffers for fluid simulation
    const dye = createDoubleFBO(width, height);
    const velocity = createDoubleFBO(width, height);
    const divergence = createFBO(width, height, gl.current.RGBA16F);
    const pressure = createDoubleFBO(width, height, gl.current.RGBA16F);

    return { dye, velocity, divergence, pressure };
  };

  const updateFrame = () => {
    if (!isAnimating.current || !gl.current || !config.current) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;

    // Update fluid simulation
    const { width, height } = gl.current.canvas;
    
    // Simulate fluid dynamics
    gl.current.viewport(0, 0, width, height);
    
    // Add forces based on pointer position
    addForces(pointerPos.current.x, pointerPos.current.y);
    
    // Update velocity field
    updateVelocity(deltaTime);
    
    // Solve pressure
    solvePressure();
    
    // Update dye concentration
    updateDye(deltaTime);
    
    // Render final result
    render();

    // Continue animation loop
    animationFrameId.current = requestAnimationFrame(updateFrame);
  };

  const addForces = (x: number, y: number) => {
    if (!gl.current || !config.current) return;

    const force = 2000;
    const dx = x - pointerPos.current.x;
    const dy = y - pointerPos.current.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > 0) {
      const velocityX = (dx / length) * force;
      const velocityY = (dy / length) * force;
      
      // Apply force to velocity field
      applyForce(velocityX, velocityY, x, y);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    pointerPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    pointerPos.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    pointerPos.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const resizeCanvas = () => {
    if (!canvasRef.current || !gl.current) return;

    const { width, height } = canvasRef.current.getBoundingClientRect();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Update framebuffers for new size
    initFramebuffers();
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: 'difference' }}
    />
  );
};

export default SplashCursor;

// Helper functions for WebGL setup and fluid simulation
const initWebGLConfig = (gl: WebGLRenderingContext) => {
  // Initialize shaders and programs
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  
  // Create and link program
  const program = gl.createProgram();
  if (!program || !vertexShader || !fragmentShader) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  return {
    program,
    uniforms: {
      // Add your uniform locations here
      uVelocity: gl.getUniformLocation(program, 'uVelocity'),
      uPressure: gl.getUniformLocation(program, 'uPressure'),
      uDye: gl.getUniformLocation(program, 'uDye'),
      uDeltaTime: gl.getUniformLocation(program, 'uDeltaTime'),
    },
  };
};

const createFBO = (
  width: number,
  height: number,
  internalFormat: number = WebGLRenderingContext.RGBA,
  format: number = WebGLRenderingContext.RGBA,
  type: number = WebGLRenderingContext.UNSIGNED_BYTE,
  param: number = WebGLRenderingContext.NEAREST
) => {
  if (!gl.current) return null;

  const texture = gl.current.createTexture();
  gl.current.bindTexture(gl.current.TEXTURE_2D, texture);
  gl.current.texParameteri(gl.current.TEXTURE_2D, gl.current.TEXTURE_MIN_FILTER, param);
  gl.current.texParameteri(gl.current.TEXTURE_2D, gl.current.TEXTURE_MAG_FILTER, param);
  gl.current.texParameteri(gl.current.TEXTURE_2D, gl.current.TEXTURE_WRAP_S, gl.current.CLAMP_TO_EDGE);
  gl.current.texParameteri(gl.current.TEXTURE_2D, gl.current.TEXTURE_WRAP_T, gl.current.CLAMP_TO_EDGE);
  gl.current.texImage2D(gl.current.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

  const fbo = gl.current.createFramebuffer();
  gl.current.bindFramebuffer(gl.current.FRAMEBUFFER, fbo);
  gl.current.framebufferTexture2D(gl.current.FRAMEBUFFER, gl.current.COLOR_ATTACHMENT0, gl.current.TEXTURE_2D, texture, 0);

  return { texture, fbo };
};

const createDoubleFBO = (width: number, height: number, internalFormat?: number) => {
  let fbo1 = createFBO(width, height, internalFormat);
  let fbo2 = createFBO(width, height, internalFormat);
  return {
    read: fbo1,
    write: fbo2,
    swap: () => {
      const temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    },
  };
};

// Shader source code
const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uPressure;
  uniform sampler2D uDye;
  uniform float uDeltaTime;

  void main() {
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    float pressure = texture2D(uPressure, vUv).x;
    vec4 color = texture2D(uDye, vUv);
    
    // Simple fluid visualization
    gl_FragColor = vec4(color.rgb + velocity * 0.5 + pressure * 0.2, 1.0);
  }
`;

const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}; 