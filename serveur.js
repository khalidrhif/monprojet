import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dossier = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(dossier, '.env')
});

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL manque dans .env');
  process.exit(1);
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 15000,
  query_timeout: 20000
});

pool.on('error', () => {
  console.error('❌ Une connexion Neon a été interrompue.');
});

const app = express();

app.disable('x-powered-by');

// On expose uniquement la page et le dossier des images.
// Le fichier .env reste inaccessible depuis ces routes.
app.get('/', (req, res) => {
  res.sendFile(path.join(dossier, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(dossier, 'index.html'));
});

app.use(
  '/images',
  express.static(path.join(dossier, 'images'), {
    dotfiles: 'deny',
    index: false
  })
);

// Recherche dans les fiches approuvées uniquement.
app.get('/api/commerces', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const mot = typeof req.query.mot === 'string'
    ? req.query.mot.trim()
    : '';

  const ville = typeof req.query.ville === 'string'
    ? req.query.ville.trim()
    : 'Repentigny';

  if (mot.length > 150 || ville.length > 100) {
    return res.status(400).json({
      erreur: 'La recherche est trop longue.'
    });
  }

  try {
    const resultat = await pool.query(
      `
        SELECT
          nom, slug, categorie, adresse, telephone,
          description, ville, "codePostal",
          "siteWeb", source, attribution, licence
        FROM public."Commerce"
        WHERE "aVerifier" = false
          AND (
            $1 = ''
            OR nom ILIKE $2
            OR categorie ILIKE $2
          )
          AND (
            $3 = ''
            OR ville ILIKE $4
          )
        ORDER BY nom, adresse
        LIMIT 50
      `,
      [
        mot,
        `%${mot}%`,
        ville,
        `%${ville}%`
      ]
    );

    res.json({
      commerces: resultat.rows
    });
  } catch {
    console.error('❌ La recherche dans Neon a échoué.');

    res.status(500).json({
      erreur: 'Recherche indisponible. Réessayez plus tard.'
    });
  }
});

async function demarrer() {
  try {
    await pool.query('SELECT 1');

    const serveur = app.listen(3000, '127.0.0.1', () => {
      console.log('✅ Connexion à Neon réussie.');
      console.log('🌐 Site : http://127.0.0.1:3000');
    });

    serveur.on('error', async error => {
      console.error(
        error.code === 'EADDRINUSE'
          ? '❌ Le port 3000 est déjà utilisé.'
          : '❌ Impossible de démarrer le serveur.'
      );

      await pool.end();
      process.exitCode = 1;
    });
  } catch {
    console.error(
      '❌ Connexion à Neon impossible. Vérifie ton fichier .env.'
    );

    await pool.end();
    process.exitCode = 1;
  }
}

demarrer();