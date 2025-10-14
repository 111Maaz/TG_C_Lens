import React, { useEffect, useRef } from 'react';

interface Program {
  program: WebGLProgram;
  uniforms: { [key: string]: WebGLUniformLocation | null };
  attributes: { [key: string]: number };
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap: () => void;
}

const SplashCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programsRef = useRef<{ [key: string]: Program }>({});
  const fbosRef = useRef<{
    velocity: DoubleFBO;
    pressure: DoubleFBO;
    dye: DoubleFBO;
    divergence: FBO;
  }>();
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastUpdateTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    // Initialize WebGL
    const gl = canvas.getContext('webgl', {
      alpha: false,
      preserveDrawingBuffer: false,
      antialias: false
    });
    if (!gl) return;
    glRef.current = gl;

    // Enable extensions
    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    // Create programs
    const programs = {
      advection: createProgram(gl, VERTEX_SHADER, ADVECTION_SHADER),
      divergence: createProgram(gl, VERTEX_SHADER, DIVERGENCE_SHADER),
      pressure: createProgram(gl, VERTEX_SHADER, PRESSURE_SHADER),
      gradient: createProgram(gl, VERTEX_SHADER, GRADIENT_SHADER),
      splat: createProgram(gl, VERTEX_SHADER, SPLAT_SHADER),
      display: createProgram(gl, VERTEX_SHADER, DISPLAY_SHADER)
    };
    programsRef.current = programs;

    // Create framebuffers
    const simRes = { width: canvas.width >> 1, height: canvas.height >> 1 };
    const dyeRes = { width: canvas.width, height: canvas.height };

    fbosRef.current = {
      velocity: createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.FLOAT),
      pressure: createDoubleFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.FLOAT),
      dye: createDoubleFBO(gl, dyeRes.width, dyeRes.height, gl.RGB, gl.FLOAT),
      divergence: createFBO(gl, simRes.width, simRes.height, gl.RGBA, gl.FLOAT)
    };

    // Create vertex buffer
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: rect.height - (e.clientY - rect.top)
      };
    };

    // Animation loop
    const update = () => {
      const gl = glRef.current;
      const fbos = fbosRef.current;
      if (!gl || !fbos) return;

      const now = Date.now();
      const dt = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.016);
      lastUpdateTimeRef.current = now;

      // Apply forces
      const dx = mouseRef.current.x - lastMouseRef.current.x;
      const dy = mouseRef.current.y - lastMouseRef.current.y;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        applyForce(gl, mouseRef.current.x, mouseRef.current.y, dx, dy);
      }
      lastMouseRef.current = { ...mouseRef.current };

      // Update simulation
      step(gl, dt);

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(update);
    };

    // Start animation
    update();

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Helper functions
  const createProgram = (gl: WebGLRenderingContext, vertSource: string, fragSource: string): Program => {
    const program = gl.createProgram()!;
    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource)!;
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource)!;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
    }

    const uniforms: { [key: string]: WebGLUniformLocation | null } = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
    }

    const attributes: { [key: string]: number } = {
      position: gl.getAttribLocation(program, 'position')
    };

    return { program, uniforms, attributes };
  };

  const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
    }

    return shader;
  };

  const createFBO = (
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number
  ): FBO => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, internalFormat, format, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    return { texture, fbo };
  };

  const createDoubleFBO = (
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    internalFormat: number,
    format: number
  ): DoubleFBO => {
    let fbo1 = createFBO(gl, width, height, internalFormat, format);
    let fbo2 = createFBO(gl, width, height, internalFormat, format);

    return {
      read: fbo1,
      write: fbo2,
      swap: () => {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  };

  const applyForce = (gl: WebGLRenderingContext, x: number, y: number, dx: number, dy: number) => {
    const fbos = fbosRef.current;
    const programs = programsRef.current;
    if (!fbos || !programs.splat) return;

    gl.useProgram(programs.splat.program);
    gl.uniform2f(programs.splat.uniforms.point, x / gl.canvas.width, y / gl.canvas.height);
    gl.uniform3f(programs.splat.uniforms.color, dx, dy, 1.0);
    gl.uniform1f(programs.splat.uniforms.radius, 0.25);

    // Apply force to velocity
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.velocity.write.fbo);
    gl.uniform1i(programs.splat.uniforms.uTarget, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.velocity.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.velocity.swap();

    // Add dye
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.dye.write.fbo);
    gl.uniform1i(programs.splat.uniforms.uTarget, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.dye.read.texture);
    gl.uniform3f(programs.splat.uniforms.color, 0.5, 0.2, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.dye.swap();
  };

  const step = (gl: WebGLRenderingContext, dt: number) => {
    const fbos = fbosRef.current;
    const programs = programsRef.current;
    if (!fbos || !programs) return;

    // Advect velocity
    gl.useProgram(programs.advection.program);
    gl.uniform2f(programs.advection.uniforms.texelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);
    gl.uniform1f(programs.advection.uniforms.dt, dt);
    gl.uniform1f(programs.advection.uniforms.dissipation, 0.98);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.velocity.write.fbo);
    gl.uniform1i(programs.advection.uniforms.uVelocity, 0);
    gl.uniform1i(programs.advection.uniforms.uSource, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.velocity.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.velocity.swap();

    // Compute divergence
    gl.useProgram(programs.divergence.program);
    gl.uniform2f(programs.divergence.uniforms.texelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.divergence.fbo);
    gl.uniform1i(programs.divergence.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.velocity.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Solve pressure
    gl.useProgram(programs.pressure.program);
    gl.uniform2f(programs.pressure.uniforms.texelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.pressure.write.fbo);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.divergence.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.pressure.swap();

    // Apply pressure gradient
    gl.useProgram(programs.gradient.program);
    gl.uniform2f(programs.gradient.uniforms.texelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.velocity.write.fbo);
    gl.uniform1i(programs.gradient.uniforms.uPressure, 0);
    gl.uniform1i(programs.gradient.uniforms.uVelocity, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.pressure.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fbos.velocity.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.velocity.swap();

    // Advect dye
    gl.useProgram(programs.advection.program);
    gl.uniform2f(programs.advection.uniforms.texelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);
    gl.uniform1f(programs.advection.uniforms.dt, dt);
    gl.uniform1f(programs.advection.uniforms.dissipation, 0.98);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.dye.write.fbo);
    gl.uniform1i(programs.advection.uniforms.uVelocity, 0);
    gl.uniform1i(programs.advection.uniforms.uSource, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.velocity.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fbos.dye.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    fbos.dye.swap();

    // Display result
    gl.useProgram(programs.display.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.uniform1i(programs.display.uniforms.uTexture, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.dye.read.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-50"
      style={{ mixBlendMode: 'difference' }}
    />
  );
};

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;

  void main () {
    vUv = position * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const ADVECTION_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;

  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = dissipation * texture2D(uSource, coord);
  }
`;

const DIVERGENCE_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const PRESSURE_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;

  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const SPLAT_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float radius;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;

  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const DISPLAY_SHADER = `
  precision highp float;
  precision highp sampler2D;

  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main () {
    vec3 color = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default SplashCursor; 