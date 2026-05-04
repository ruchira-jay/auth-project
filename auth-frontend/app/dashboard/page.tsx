'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, getUsers, createUser, deleteUser } from '@/lib/api';

type User = { _id: string; name: string; email: string; role: string };

const roleConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  super_admin: { bg: 'rgba(204,255,51,0.12)', color: '#ccff33', border: 'rgba(204,255,51,0.35)', label: 'Super Admin' },
  admin:       { bg: 'rgba(112,224,0,0.12)',  color: '#70e000', border: 'rgba(112,224,0,0.35)',  label: 'Admin' },
  user:        { bg: 'rgba(56,176,0,0.12)',   color: '#38b000', border: 'rgba(56,176,0,0.35)',   label: 'User' },
};

function RoleBadge({ role }: { role: string }) {
  const c = roleConfig[role] ?? roleConfig.user;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setMe(data);
        if (data.role === 'super_admin' || data.role === 'admin') {
          getUsers().then(setUsers).catch((e: Error) => setError(e.message));
        }
        import('animejs').then(({ animate, stagger, createTimeline }) => {
          const tl = createTimeline({ defaults: { easing: 'easeOutExpo' } });
          tl.add(headerRef.current!, { opacity: [0,1], translateY: [-24,0], duration: 600 })
            .add(bodyRef.current!, { opacity: [0,1], translateY: [24,0], duration: 600 }, 150)
            .add('.dash-card', { opacity: [0,1], translateY: [20,0], delay: stagger(100), duration: 500 }, 250);
          setTimeout(() => {
            animate('.table-row', { opacity: [0,1], translateX: [-16,0], delay: stagger(50), duration: 350, easing: 'easeOutQuad' });
          }, 700);
        });
      })
      .catch(() => router.push('/login'));
  }, [router]);

  function logout() {
    import('animejs').then(({ animate }) => {
      animate('body', { opacity: [1,0], duration: 300, easing: 'easeInQuad', onComplete: () => { localStorage.clear(); router.push('/login'); } });
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    try {
      await createUser(form);
      setFormSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '', role: 'user' });
      const updated = await getUsers();
      setUsers(updated);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this user?')) return;
    try {
      const row = document.getElementById(`row-${id}`);
      if (row) {
        await new Promise<void>((res) =>
          import('animejs').then(({ animate }) =>
            animate(row, { opacity: [1,0], translateX: [0,24], duration: 280, easing: 'easeInQuad', onComplete: () => res() })
          )
        );
      }
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  if (!me) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
      <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'3px solid rgba(112,224,0,0.15)', borderTop:'3px solid #70e000', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'rgba(158,240,26,0.5)', fontSize:'0.875rem' }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', padding:'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* ── Header ── */}
        <div ref={headerRef} style={{ opacity:0, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg,#38b000,#ccff33)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(112,224,0,0.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#002a14" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="#002a14" strokeWidth="2.2"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize:'1.1rem', fontWeight:800, color:'#ccff33', lineHeight:1.2 }}>{me.name}</h1>
              <p style={{ fontSize:'0.78rem', color:'rgba(158,240,26,0.5)' }}>{me.email}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <RoleBadge role={me.role} />
            <button onClick={logout} style={{ background:'rgba(220,38,38,0.12)', border:'1.5px solid rgba(220,38,38,0.35)', color:'#fca5a5', padding:'0.4rem 1rem', borderRadius:'0.5rem', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, transition:'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(220,38,38,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(220,38,38,0.12)'}>
              Logout
            </button>
          </div>
        </div>

        <div ref={bodyRef} style={{ opacity:0, display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* ── Profile (user only) ── */}
          {me.role === 'user' && (
            <div className="card dash-card" style={{ padding:'1.75rem', opacity:0 }}>
              <h2 style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(158,240,26,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1.25rem' }}>My Profile</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.875rem' }}>
                {[{ label:'Name', value:me.name }, { label:'Email', value:me.email }].map(({ label, value }) => (
                  <div key={label} style={{ background:'rgba(0,20,8,0.5)', border:'1px solid rgba(112,224,0,0.15)', borderRadius:'0.6rem', padding:'0.875rem 1rem' }}>
                    <p style={{ fontSize:'0.72rem', color:'rgba(158,240,26,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>{label}</p>
                    <p style={{ fontWeight:600, color:'#e8f5e9', fontSize:'0.95rem' }}>{value}</p>
                  </div>
                ))}
                <div style={{ background:'rgba(0,20,8,0.5)', border:'1px solid rgba(112,224,0,0.15)', borderRadius:'0.6rem', padding:'0.875rem 1rem' }}>
                  <p style={{ fontSize:'0.72rem', color:'rgba(158,240,26,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Role</p>
                  <RoleBadge role={me.role} />
                </div>
              </div>
            </div>
          )}

          {/* ── Create User (super_admin) ── */}
          {me.role === 'super_admin' && (
            <div className="card dash-card" style={{ padding:'1.75rem', opacity:0 }}>
              <h2 style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(158,240,26,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1.25rem' }}>Create User</h2>
              {formError && <div style={{ background:'rgba(220,38,38,0.12)', border:'1.5px solid rgba(220,38,38,0.35)', borderRadius:'0.6rem', padding:'0.7rem 1rem', marginBottom:'1rem', color:'#fca5a5', fontSize:'0.875rem' }}>⚠ {formError}</div>}
              {formSuccess && <div style={{ background:'rgba(56,176,0,0.12)', border:'1.5px solid rgba(56,176,0,0.35)', borderRadius:'0.6rem', padding:'0.7rem 1rem', marginBottom:'1rem', color:'#86efac', fontSize:'0.875rem' }}>✓ {formSuccess}</div>}
              <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.875rem' }}>
                {[
                  { ph:'Full Name',  type:'text',     key:'name' },
                  { ph:'Email',      type:'email',    key:'email' },
                  { ph:'Password',   type:'password', key:'password' },
                ].map(({ ph, type, key }) => (
                  <input key={key} type={type} placeholder={ph} value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field" required />
                ))}
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field" style={{ cursor:'pointer' }}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button type="submit" className="btn-primary" style={{ gridColumn:'1 / -1' }}>Create User →</button>
              </form>
            </div>
          )}

          {/* ── Users Table ── */}
          {(me.role === 'super_admin' || me.role === 'admin') && (
            <div className="card dash-card" style={{ padding:'1.75rem', opacity:0, overflowX:'auto' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
                <h2 style={{ fontSize:'0.78rem', fontWeight:700, color:'rgba(158,240,26,0.6)', textTransform:'uppercase', letterSpacing:'0.08em' }}>All Users</h2>
                <span style={{ background:'rgba(112,224,0,0.12)', color:'#70e000', border:'1px solid rgba(112,224,0,0.25)', padding:'0.1rem 0.6rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 }}>{users.length}</span>
              </div>
              {error && <div style={{ background:'rgba(220,38,38,0.12)', border:'1.5px solid rgba(220,38,38,0.35)', borderRadius:'0.6rem', padding:'0.7rem 1rem', marginBottom:'1rem', color:'#fca5a5', fontSize:'0.875rem' }}>⚠ {error}</div>}
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem', minWidth:'460px' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(112,224,0,0.15)' }}>
                    {['Name','Email','Role',...(me.role==='super_admin'?['']:[''])].filter((_,i) => i < 3 || me.role==='super_admin').map((h,i) => (
                      <th key={i} style={{ padding:'0.6rem 0.75rem', textAlign:'left', fontSize:'0.72rem', fontWeight:700, color:'rgba(158,240,26,0.45)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                        {['Name','Email','Role','Action'][i]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} id={`row-${u._id}`} className="table-row"
                      style={{ borderBottom:'1px solid rgba(112,224,0,0.07)', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(56,176,0,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.8rem 0.75rem', fontWeight:600, color:'#e8f5e9' }}>{u.name}</td>
                      <td style={{ padding:'0.8rem 0.75rem', color:'rgba(232,245,233,0.6)' }}>{u.email}</td>
                      <td style={{ padding:'0.8rem 0.75rem' }}><RoleBadge role={u.role} /></td>
                      {me.role === 'super_admin' && (
                        <td style={{ padding:'0.8rem 0.75rem' }}>
                          <button onClick={() => handleDelete(u._id)}
                            style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', color:'#fca5a5', padding:'0.25rem 0.7rem', borderRadius:'0.4rem', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, transition:'background .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(220,38,38,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(220,38,38,0.1)'}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p style={{ textAlign:'center', color:'rgba(158,240,26,0.3)', padding:'2rem', fontSize:'0.875rem' }}>No users found</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
