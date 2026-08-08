// ⚠ LANDMINE: Diese Middleware sperrt die GESAMTE Seite hinter Basic Auth.
// Vor dem echten Launch loeschen — sonst bekommen auch Suchmaschinen 401.
// Sie greift nur, solange kein _worker.js im Build-Output liegt (siehe Build-Befehl
// in den Pages-Settings: `npm run build && rm -rf dist/analog/public/_worker.js`).
export const onRequest = async ({ request, env, next }) => {
  const expected = 'Basic ' + btoa(`${env.SITE_USER}:${env.SITE_PASS}`);

  if (request.headers.get('Authorization') !== expected) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="portfolio", charset="UTF-8"' },
    });
  }

  return next();
};
