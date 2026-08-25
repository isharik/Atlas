import { useEffect, useRef } from 'react';

/**
 * Ambient volumetric fog (raw WebGL fragment shader, ported from the NOVAFALL source
 * and recoloured to Prosper's emerald atmosphere). Purely decorative background layer.
 */
export function FogCanvas({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `
      precision mediump float;
      uniform float t; uniform vec2 r;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/r; uv.x*=r.x/r.y;
        float f=fbm(uv*2.2+vec2(t*.04,-t*.02));
        f=fbm(uv*2.5+f+vec2(-t*.03,t*.015));
        float fog=smoothstep(.35,.95,f);
        vec3 col=mix(vec3(.02,.05,.035),vec3(.13,.42,.30),fog);
        col+=vec3(.22,.78,.52)*pow(fog,4.)*.4;
        col+=vec3(.55,.44,.18)*pow(fog,7.)*.25; // faint gold flecks
        float vig=1.-length(gl_FragCoord.xy/r-.5)*.9;
        gl_FragColor=vec4(col*fog*vig,1.);
      }`;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, 't');
    const uR = gl.getUniformLocation(prog, 'r');

    const resize = () => {
      const d = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.max(1, canvas.clientWidth * d);
      canvas.height = Math.max(1, canvas.clientHeight * d);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    let raf = 0;
    let frame = 0;
    const loop = (ts: number) => {
      // reduced-motion: render one static frame, then stop the animation
      if (!reduce || frame === 0) {
        gl.uniform1f(uT, reduce ? 3.0 : ts * 0.001);
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        frame++;
      }
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}
