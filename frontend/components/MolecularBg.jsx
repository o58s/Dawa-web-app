// Animated molecular graph background — floating nodes connected by edges
// Uses canvas for perf; subtle crimson glows on a warm paper ground.
const MolecularBg = ({ density = 40, accent = '#c0263a' }) => {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const nodes = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed nodes
    for (let i = 0; i < density; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.2 + Math.random() * 2.2,
        hot: Math.random() < 0.18, // some nodes are "active" (red)
      });
    }

    let mouse = { x: -9999, y: -9999 };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Update
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // subtle mouse attraction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          n.vx += (dx / d) * 0.004;
          n.vy += (dy / d) * 0.004;
        }
        // damping
        n.vx *= 0.995;
        n.vy *= 0.995;
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.35;
            const isHot = a.hot && b.hot;
            ctx.strokeStyle = isHot
              ? `rgba(192, 38, 58, ${alpha * 0.9})`
              : `rgba(26, 22, 20, ${alpha * 0.18})`;
            ctx.lineWidth = isHot ? 0.8 : 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        if (n.hot) {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
          grad.addColorStop(0, 'rgba(192, 38, 58, 0.55)');
          grad.addColorStop(1, 'rgba(192, 38, 58, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = accent;
        } else {
          ctx.fillStyle = 'rgba(26, 22, 20, 0.35)';
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [density, accent]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

Object.assign(window, { MolecularBg });
