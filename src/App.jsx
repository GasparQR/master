import { useState, useMemo } from 'react'
import { useSheetData } from './useSheetData.js'

const PROV_COLORS = {
  ZENTEK:   { bg: '#1e3a5f', text: '#93c5fd', border: '#2563eb' },
  IMPO_CBA: { bg: '#4a1532', text: '#f9a8d4', border: '#9d174d' },
}
const MARCA_COLORS = {
  Apple: '#818cf8', Samsung: '#fbbf24', Xiaomi: '#34d399',
  Motorola: '#f87171', Gaming: '#c084fc', DYSON: '#2dd4bf',
}
const SORT_OPTIONS = [
  { key: 'margenPct_desc', label: 'Margen % ↓' },
  { key: 'difPct_desc',    label: 'Arbitraje ↓' },
  { key: 'precioMin_asc',  label: 'Precio ↑' },
  { key: 'precioMin_desc', label: 'Precio ↓' },
  { key: 'nOfertas_desc',  label: 'Más cotizados' },
]

function ProvBadge({ prov }) {
  if (!prov) return null
  const c = PROV_COLORS[prov] || { bg: '#1e293b', text: '#94a3b8', border: '#334155' }
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {prov}
    </span>
  )
}

function MargenPill({ pct }) {
  const color = pct >= 15 ? '#10b981' : pct >= 8 ? '#f59e0b' : '#64748b'
  return <span style={{ color, fontWeight: 700, fontSize: 12 }}>{pct.toFixed(1)}%</span>
}

function ArbitrajeBadge({ pct }) {
  if (!pct) return null
  const color = pct >= 20 ? '#ef4444' : pct >= 10 ? '#f59e0b' : '#6366f1'
  return <span style={{ background: color, color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700 }}>▲{pct.toFixed(1)}%</span>
}

function ProductCard({ r, onClick, selected }) {
  return (
    <div onClick={() => onClick(r)} style={{
      background: selected ? '#1e3a5f' : '#1e293b',
      border: selected ? '1px solid #6366f1' : '1px solid #334155',
      borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 3 }}>{r.producto}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: MARCA_COLORS[r.marca] || '#94a3b8', fontSize: 11, fontWeight: 600 }}>{r.marca}</span>
            <span style={{ color: '#475569', fontSize: 11 }}>{r.familia}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
            ${r.precioMin?.toLocaleString()}
          </div>
          <MargenPill pct={r.margenPct || 0} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <ProvBadge prov={r.provMasBarato} />
        {r.arbitraje && <ArbitrajeBadge pct={r.difPct} />}
        {r.nOfertas >= 3 && <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600 }}>📊 {r.nOfertas} cotiz.</span>}
      </div>
    </div>
  )
}

function DetailDrawer({ r, onClose }) {
  if (!r) return null
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#0f172a', borderTop: '2px solid #6366f1',
      borderRadius: '16px 16px 0 0', zIndex: 100,
      maxHeight: '70vh', overflowY: 'auto', padding: '0 0 100px 0',
    }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>{r.id}</div>
          <button onClick={onClose} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', fontSize: 16, cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>✕</button>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 12 }}>{r.producto}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Precio mínimo',   value: `$${r.precioMin?.toLocaleString()}`,    sub: <ProvBadge prov={r.provMasBarato} /> },
            { label: 'Precio máximo',   value: `$${r.precioMax?.toLocaleString()}`,    sub: <ProvBadge prov={r.provMasCaro} /> },
            { label: 'Venta sugerida',  value: `$${r.ventaSugerida?.toLocaleString()}`, sub: null },
            { label: 'Margen',          value: `$${r.margenUSD}`,                      sub: <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>{r.margenPct?.toFixed(1)}%</span> },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: '#1e293b', borderRadius: 8, padding: 10 }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 3 }}>{value}</div>
              {sub}
            </div>
          ))}
        </div>
        {r.arbitraje && (
          <div style={{ background: '#1a2744', border: '1px solid #2563eb', borderRadius: 8, padding: 12, fontSize: 13, color: '#bfdbfe', lineHeight: 1.5 }}>
            💡 <strong style={{ color: '#93c5fd' }}>Arbitraje:</strong> diferencia de <strong>${r.difUSD}</strong> ({r.difPct?.toFixed(1)}%) entre proveedores.
            Comprá en <strong>{r.provMasBarato}</strong> a ${r.precioMin?.toLocaleString()}.
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <div style={{ color: '#64748b', fontSize: 14 }}>Cargando catálogo desde Google Sheets...</div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 40 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ color: '#f87171', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>{message}</div>
      <button onClick={onRetry} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Reintentar
      </button>
    </div>
  )
}

export default function App() {
  const { data, loading, error, lastUpdated, refresh } = useSheetData()

  const [search, setSearch]             = useState('')
  const [marcaFilter, setMarcaFilter]   = useState('Todas')
  const [soloArbitraje, setSoloArbitraje] = useState(false)
  const [sortKey, setSortKey]           = useState('margenPct_desc')
  const [selected, setSelected]         = useState(null)
  const [tab, setTab]                   = useState('catalogo')
  const [showFilters, setShowFilters]   = useState(false)

  const marcas = useMemo(() =>
    ['Todas', ...Array.from(new Set((data || []).map(d => d.marca))).sort()],
    [data]
  )

  const filtered = useMemo(() => {
    if (!data) return []
    let rows = data
    if (marcaFilter !== 'Todas') rows = rows.filter(r => r.marca === marcaFilter)
    if (soloArbitraje) rows = rows.filter(r => r.arbitraje)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.producto.toLowerCase().includes(q) ||
        r.familia.toLowerCase().includes(q) ||
        r.marca.toLowerCase().includes(q)
      )
    }
    const [field, dir] = sortKey.split('_')
    return [...rows].sort((a, b) => dir === 'desc' ? b[field] - a[field] : a[field] - b[field])
  }, [data, marcaFilter, soloArbitraje, search, sortKey])

  const topMargen    = useMemo(() => [...(data || [])].sort((a, b) => b.margenPct - a.margenPct).slice(0, 8), [data])
  const topArbitraje = useMemo(() => [...(data || [])].filter(d => d.arbitraje).sort((a, b) => b.difPct - a.difPct).slice(0, 8), [data])

  const provStats = useMemo(() =>
    ['ZENTEK', 'IMPO_CBA'].map(prov => {
      const prods = (data || []).filter(d => d.provMasBarato === prov)
      const avg  = prods.length ? prods.reduce((s, p) => s + (p.margenPct || 0), 0) / prods.length : 0
      const avgP = prods.length ? prods.reduce((s, p) => s + (p.precioMin || 0), 0) / prods.length : 0
      return {
        prov, count: prods.length,
        avgMargen: avg.toFixed(1), avgPrecio: avgP.toFixed(0),
        familias: [...new Set(prods.map(p => p.familia))],
        top: [...prods].sort((a, b) => b.margenPct - a.margenPct).slice(0, 5),
      }
    }),
    [data]
  )

  const handleSelect = r => setSelected(selected?.id === r.id ? null : r)

  const s = {
    root:     { fontFamily: "'Inter','Segoe UI',sans-serif", background: '#0f172a', minHeight: '100vh', color: '#e2e8f0', paddingBottom: 80 },
    header:   { background: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 },
    filterBtn:{ padding: '7px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
    card:     { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '12px 14px', marginBottom: 8 },
    tabBar:   { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', zIndex: 60 },
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>📦 CatálogoMVP</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              {loading ? 'Actualizando...' : error ? 'Error de conexión' : `${data?.length || 0} productos · ${lastUpdated ? 'actualizado ' + lastUpdated.toLocaleTimeString() : ''}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={refresh} title="Actualizar datos" style={{ ...s.filterBtn, fontSize: 16, padding: '6px 10px' }}>🔄</button>
            {tab === 'catalogo' && (
              <button onClick={() => setShowFilters(f => !f)} style={{ ...s.filterBtn, background: showFilters ? '#334155' : '#1e293b' }}>
                {showFilters ? '✕' : '⚙ Filtros'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <LoadingScreen />}
      {!loading && error && <ErrorScreen message={error} onRetry={refresh} />}

      {!loading && !error && (
        <>
          {/* Catálogo */}
          {tab === 'catalogo' && (
            <>
              <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Buscar producto..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
                />
              </div>

              {showFilters && (
                <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {marcas.map(m => (
                      <button key={m} onClick={() => setMarcaFilter(m)} style={{
                        ...s.filterBtn,
                        background: marcaFilter === m ? '#334155' : '#1e293b',
                        color: marcaFilter === m ? '#f1f5f9' : '#94a3b8',
                        border: marcaFilter === m ? '1px solid #6366f1' : '1px solid #334155',
                      }}>{m}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value)}
                      style={{ ...s.filterBtn, flex: 1, color: '#e2e8f0' }}>
                      {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={soloArbitraje} onChange={e => setSoloArbitraje(e.target.checked)} />
                      Solo arbitraje
                    </label>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{filtered.length} resultados</div>
                </div>
              )}

              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(r => (
                  <ProductCard key={r.id} r={r} onClick={handleSelect} selected={selected?.id === r.id} />
                ))}
              </div>
            </>
          )}

          {/* Oportunidades */}
          {tab === 'oportunidades' && (
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, paddingTop: 16, marginBottom: 10 }}>💰 Top margen %</div>
              {topMargen.map((r, i) => (
                <div key={r.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#475569', fontSize: 11, marginRight: 4 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.producto}</span>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{r.margenPct.toFixed(1)}%</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ProvBadge prov={r.provMasBarato} />
                    <span style={{ color: '#475569', fontSize: 12 }}>${r.precioMin?.toLocaleString()} → ${r.ventaSugerida?.toLocaleString()}</span>
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, paddingTop: 8, marginBottom: 10 }}>⚡ Mayor spread entre proveedores</div>
              {topArbitraje.map((r, i) => (
                <div key={r.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#475569', fontSize: 11, marginRight: 4 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{r.producto}</span>
                    </div>
                    <ArbitrajeBadge pct={r.difPct} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ProvBadge prov={r.provMasBarato} />
                    <span style={{ color: '#34d399', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>${r.precioMin}</span>
                    <span style={{ color: '#475569' }}>→</span>
                    <ProvBadge prov={r.provMasCaro} />
                    <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>${r.precioMax}</span>
                    <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>+${r.difUSD}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Proveedores */}
          {tab === 'proveedores' && (
            <div style={{ padding: '0 16px' }}>
              {provStats.map(({ prov, count, avgMargen, avgPrecio, familias, top }) => {
                const c = PROV_COLORS[prov] || { bg: '#1e293b', text: '#94a3b8', border: '#334155' }
                return (
                  <div key={prov} style={{ marginTop: 16 }}>
                    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c.text, marginBottom: 8 }}>{prov}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[{ label: 'SKUs + barato', v: count }, { label: 'Precio prom.', v: `$${Number(avgPrecio).toLocaleString()}` }, { label: 'Margen prom.', v: `${avgMargen}%` }].map(({ label, v }) => (
                          <div key={label} style={{ background: '#0f172a', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{v}</div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>Familias</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {familias.map(f => <span key={f} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{f}</span>)}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>Top margen</div>
                    {top.map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e293b', fontSize: 13 }}>
                        <span style={{ color: '#e2e8f0', flex: 1, marginRight: 8, lineHeight: 1.3 }}>{r.producto}</span>
                        <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>{r.margenPct.toFixed(1)}%</span>
                      </div>
                    ))}
                    <div style={{ height: 16 }} />
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Detail drawer */}
      {selected && <DetailDrawer r={selected} onClose={() => setSelected(null)} />}
      {selected && <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}

      {/* Bottom tab bar */}
      <div style={s.tabBar}>
        {[
          { key: 'catalogo',      icon: '📋', label: 'Catálogo' },
          { key: 'oportunidades', icon: '🔥', label: 'Oportunidades' },
          { key: 'proveedores',   icon: '🏪', label: 'Proveedores' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => { setTab(key); setSelected(null) }} style={{
            flex: 1, padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: tab === key ? '#6366f1' : '#64748b',
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === key ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
