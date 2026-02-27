# App Custode

Frontend React responsive, detached dal backend. Gli endpoint API puntano a un server separato.

## Setup

```bash
npm install
cp .env.example .env
# Modifica .env e imposta VITE_API_URL con l'URL del server API
```

## Scripts

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run preview` - Anteprima build di produzione

## Configurazione

### API Backend

Crea un file `.env` copiando `.env.example`:

```
VITE_API_URL=http://localhost:3001
```

Le chiamate API usano `apiFetch()` da `@/lib/api`.

### Responsive

Breakpoints (Tailwind): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

Hooks disponibili: `useIsMobile()`, `useIsTablet()`, `useIsDesktop()`, `useMediaQuery(query)`.

## shadcn/ui

- **Style**: Mira (radix-mira)
- **Theme**: Blue
- **Base color**: Gray

```bash
npx shadcn@latest add [component-name]
```
# APP-CUSTODE
