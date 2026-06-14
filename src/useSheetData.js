import { useState, useEffect } from 'react'

// Reads two sheets: "Comparativa" and "Productos"
// Expects VITE_SHEETS_API_KEY and VITE_SHEET_ID env vars

const SHEET_ID = import.meta.env.VITE_SHEET_ID
const API_KEY = import.meta.env.VITE_SHEETS_API_KEY

async function fetchSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error leyendo "${sheetName}": ${res.status}`)
  const json = await res.json()
  const [headers, ...rows] = json.values
  return rows.map(row =>
    Object.fromEntries(headers.map((h, i) => [h.trim(), row[i] ?? '']))
  )
}

function parseComparativa(rows) {
  return rows.map(r => ({
    id:            r['CANONICAL_ID'] || '',
    marca:         r['Marca'] || '',
    familia:       r['Familia'] || '',
    producto:      r['Producto'] || '',
    provMasBarato: r['Prov. + barato'] || '',
    precioMin:     parseFloat(r['Precio min']) || null,
    provMasCaro:   r['Prov. + caro'] || '',
    precioMax:     parseFloat(r['Precio max']) || null,
    difUSD:        parseFloat(r['Dif USD']) || 0,
    difPct:        parseFloat(r['Dif %']) || 0,
    ventaSugerida: parseFloat(r['Venta sugerida']) || null,
    margenUSD:     parseFloat(r['Margen USD']) || null,
    margenPct:     parseFloat(r['Margen %']) || null,
    arbitraje:     (parseFloat(r['Dif %']) || 0) > 0,
    nOfertas:      parseInt(r['#Ofertas c/precio']) || 0,
    estado:        r['Estado'] || '',
  })).filter(r => r.nOfertas > 0 && r.id)
}

export function useSheetData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchSheet('Comparativa')
      setData(parseComparativa(rows))
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { data, loading, error, lastUpdated, refresh: load }
}
