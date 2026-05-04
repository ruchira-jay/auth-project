'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: { pause: () => void } | null = null;
    import('animejs').then(({ animate, stagger, createTimeline }) => {
      // spawn particles
      if (particlesRef.current) {
        for (let i = 0; i < 22; i++) {
          const p = document.createElement('div');
          const size = Math.random() * 5 + 2;
          p.className = 'particle';
          p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;background:rgba(${Math.random()>.5?'112,224,0':'204,255,51'},${Math.random()*.35+.08});`;
          particlesRef.current.appendChild(p);
        }
        anim = animate('.particle', {
          translateY: () => `${(Math.random()-.5)*100}px`,
          translateX: () => `${(Math.random()-.5)*100}px`,
          opacity: [0.05, 0.5],
          scale: [0.7, 1.3],
          duration: () => Math.random()*3500+2000,
          delay: stagger(100),
          loop: true, direction: 'alternate', easing: 'easeInOutSine',
        }) as { pause: () => void };
      }
      // entrance
      const tl = createTimeline({ defaults: { easing: 'easeOutExpo' } });
      tl.add(cardRef.current!, { opacity: [0,1], translateY: [50,0], scale: [0.96,1], duration: 750 })
        .add('.form-field', { opacity: [0,1], translateY: [16,0], delay: stagger(80), duration: 450 }, 300);
    });
    return () => anim?.pause();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      import('animejs').then(({ animate }) => {
        animate(cardRef.current!, {
          opacity: [1, 0], translateY: [0, -30], scale: [1, 0.95],
          duration: 450, easing: 'easeInExpo',
          onComplete: () => router.push('/dashboard'),
        });
      });
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Login failed');
      import('animejs').then(({ animate }) => {
        animate(cardRef.current!, { translateX: [-10,10,-7,7,-4,4,0], duration: 450, easing: 'easeInOutSine' });
      });
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

      {/* bg orbs */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'480px', height:'480px', background:'radial-gradient(circle, rgba(56,176,0,0.18) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-5%', width:'560px', height:'560px', background:'radial-gradient(circle, rgba(112,224,0,0.12) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', top:'40%', right:'20%', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(204,255,51,0.06) 0%, transparent 65%)', borderRadius:'50%' }} />
      </div>

      <div ref={particlesRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }} />

      {/* card */}
      <div ref={cardRef} className="card" style={{ width:'100%', maxWidth:'420px', padding:'2.5rem', position:'relative', zIndex:10, opacity:0 }}>

        {/* brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'60px', height:'60px', borderRadius:'16px', background:'linear-gradient(135deg, #38b000, #ccff33)', marginBottom:'1.25rem', boxShadow:'0 4px 20px rgba(112,224,0,0.4)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#002a14" strokeWidth="2.2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#002a14" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="glow-text" style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1.2 }}>Sign In</h1>
          <p style={{ color:'rgba(158,240,26,0.55)', fontSize:'0.875rem', marginTop:'0.4rem' }}>Welcome back — enter your credentials</p>
        </div>

        {error && (
          <div className="form-field" style={{ background:'rgba(220,38,38,0.12)', border:'1.5px solid rgba(220,38,38,0.4)', borderRadius:'0.6rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', color:'#fca5a5', fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          <div className="form-field" style={{ opacity:0 }}>
            <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'rgba(158,240,26,0.75)', marginBottom:'0.5rem', letterSpacing:'0.07em', textTransform:'uppercase' }}>
              Email Address
            </label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>

          <div className="form-field" style={{ opacity:0 }}>
            <label style={{ display:'block', fontSize:'0.78rem', fontWeight:700, color:'rgba(158,240,26,0.75)', marginBottom:'0.5rem', letterSpacing:'0.07em', textTransform:'uppercase' }}>
              Password
            </label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>

          <div className="form-field" style={{ opacity:0, marginTop:'0.25rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </div>
        </form>

        <hr className="divider" />

        <p className="form-field" style={{ textAlign:'center', fontSize:'0.875rem', color:'rgba(158,240,26,0.45)', opacity:0 }}>
          No account?{' '}
          <Link href="/register" style={{ color:'var(--chartreuse)', fontWeight:700, textDecoration:'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
