# 🚀 Deploy en Vercel - Guía Rápida

## Requisitos previos

1. Tener cuenta en [Vercel](https://vercel.com)
2. Tener el proyecto en GitHub
3. Node.js instalado

## Opción 1: Deploy desde la Web (Recomendado)

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
    - **Root Directory**: `frontend`
    - **Framework Preset**: Angular (detectado automáticamente)
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist/entrenemos-simple/browser`
5. Click en "Deploy"

## Opción 2: Deploy desde CLI

1. Instala Vercel CLI:

```bash
npm i -g vercel
```

2. Navega a la carpeta del frontend:

```bash
cd frontend
```

3. Ejecuta el deploy:

```bash
vercel
```

4. Sigue las instrucciones:

    - ¿Quieres modificar la configuración? **No** (ya tenemos vercel.json)
    - ¿En qué directorio está tu código? **.** (directorio actual)
    - ¿Quieres override la configuración? **No**

5. Para producción:

```bash
vercel --prod
```

## ⚠️ Importante: Configurar URL del Backend

**IMPORTANTE**: El frontend está configurado para conectarse a `http://localhost:8080/api`.

Necesitas:

1. Desplegar el backend en algún servicio (Railway, Render, etc.)
2. Actualizar `frontend/src/services/api.config.ts` con la URL del backend desplegado

**Ejemplo**:

```typescript
export const API_BASE_URL = "https://tu-backend.railway.app/api";
```

Luego haz commit y push para que se actualice el deploy.

## Variables de Entorno (Opcional)

Si quieres usar variables de entorno en Vercel:

1. En el dashboard de Vercel → Settings → Environment Variables
2. Agrega: `NG_APP_API_URL` = `https://tu-backend-url.com/api`
3. Luego actualiza `api.config.ts` para usar la variable

## Ver el deploy

Después del deploy, Vercel te dará una URL como:
`https://entrenemos-simple.vercel.app`

## Actualizaciones automáticas

Si conectaste tu repo de GitHub, cada push a `main` hará un nuevo deploy automáticamente.

## Troubleshooting

**Error: No se encuentra el directorio de build**

-   Verifica que `outputDirectory` en `vercel.json` coincida con el output real
-   Revisa que el build se ejecute correctamente: `npm run build`

**Error: Página en blanco**

-   Verifica los rewrites en `vercel.json` (ya configurado)
-   Revisa la consola del navegador para errores

**El backend no funciona**

-   Verifica la URL en `api.config.ts`
-   Asegúrate de que el backend tenga CORS configurado para la URL de Vercel
