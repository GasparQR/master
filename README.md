<<<<<<< HEAD
# CatálogoMVP — Guía de setup completa

App de inteligencia de compras conectada a Google Sheets. React + Vite, deploy en Vercel.

---

## PASO 1 — Preparar el Google Sheet

### 1a. Hacer el Sheet público (solo lectura)
1. Abrí tu Google Sheet
2. Clic en **Compartir** (arriba a la derecha)
3. Abajo donde dice "Acceso general", cambiá a **"Cualquier persona con el enlace"** → **Lector**
4. Copiá el ID del sheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/  →ESTE_ES_EL_ID←  /edit
   ```

### 1b. Verificar nombres de hojas
El hook lee la hoja llamada exactamente **`Comparativa`**.
Confirmá que esa hoja exista y tenga estas columnas:
```
CANONICAL_ID | Marca | Familia | Producto | Prov. + barato | Precio min |
Prov. + caro | Precio max | Dif USD | Dif % | Venta sugerida |
Margen USD | Margen % | #Ofertas c/precio | Estado
```

---

## PASO 2 — Crear API Key en Google Cloud

1. Ir a https://console.cloud.google.com
2. Crear proyecto nuevo (o usar uno existente)
3. Buscar **"Google Sheets API"** → habilitarla
4. Ir a **APIs y servicios → Credenciales → Crear credenciales → Clave de API**
5. Copiar la key generada
6. (Recomendado) Restringir la key:
   - **Restricciones de API**: Google Sheets API
   - **Restricciones de aplicación**: HTTP referrers → agregar tu dominio de Vercel (ej: `catalogo-mvp.vercel.app/*`) y `localhost:5173/*`

---

## PASO 3 — Setup local

```bash
# Clonar / entrar a la carpeta
cd catalogo-mvp

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Editá `.env` con tus valores reales:
```
VITE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
VITE_SHEETS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

```bash
# Levantar en desarrollo
npm run dev
# → http://localhost:5173
```

---

## PASO 4 — Subir a GitHub

```bash
# Inicializar repo (si no existe)
git init
git add .
git commit -m "feat: catalogo mvp inicial"

# Crear repo en github.com → New repository → catalogo-mvp
# Luego conectar:
git remote add origin https://github.com/TU_USUARIO/catalogo-mvp.git
git branch -M main
git push -u origin main
```

> **Importante:** `.env` está en `.gitignore` y NUNCA se sube. Las keys van solo en Vercel.

---

## PASO 5 — Deploy en Vercel

### 5a. Importar el proyecto
1. Ir a https://vercel.com → **Add New Project**
2. Conectar con GitHub → seleccionar `catalogo-mvp`
3. Framework preset: **Vite** (lo detecta automático)
4. **No hacer deploy todavía** — primero configurar las env vars

### 5b. Agregar variables de entorno en Vercel
En la pantalla de configuración del proyecto, o en **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_SHEET_ID` | tu_sheet_id |
| `VITE_SHEETS_API_KEY` | tu_api_key |

### 5c. Deploy
Clic en **Deploy**. En ~1 minuto tenés la app en `https://catalogo-mvp.vercel.app`.

---

## Actualizaciones futuras

Cada vez que hagas `git push`, Vercel redeploya automáticamente.

Los datos del Sheet se cargan en tiempo real cada vez que alguien abre la app (o toca 🔄).

---

## Troubleshooting

**"Error leyendo Comparativa: 403"**
→ El sheet no está público. Revisá el Paso 1a.

**"Error leyendo Comparativa: 400"**
→ El nombre de la hoja no coincide. Verificá que se llame exactamente `Comparativa`.

**La app carga pero muestra 0 productos**
→ Las columnas del sheet no coinciden con los nombres esperados. Revisá la sección 1b.

**API key inválida (403 con mensaje de API key)**
→ La key no tiene permisos para Sheets API, o tiene restricciones de dominio que bloquean localhost.
=======
# master
>>>>>>> 4dbd47dbbd41111226a00de0d3485f92e7d1a23c
