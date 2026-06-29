-- Migration Supabase pour Royal Ministry of All Nations
-- Exécuter ce script dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- Table des services dominicaux
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  adultes_hommes INTEGER NOT NULL DEFAULT 0,
  adultes_femmes INTEGER NOT NULL DEFAULT 0,
  enfants_garcons INTEGER NOT NULL DEFAULT 0,
  enfants_filles INTEGER NOT NULL DEFAULT 0,
  dirigeant TEXT NOT NULL DEFAULT '',
  predicateur TEXT NOT NULL DEFAULT '',
  theme_message TEXT NOT NULL DEFAULT '',
  texte_biblique TEXT NOT NULL DEFAULT '',
  resume_message TEXT,
  offrandes NUMERIC DEFAULT 0,
  dimes NUMERIC DEFAULT 0,
  autres_dons NUMERIC DEFAULT 0,
  devise TEXT NOT NULL DEFAULT 'FCFA',
  note_finances TEXT,
  saisi_par TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des annonces
CREATE TABLE IF NOT EXISTS annonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  departement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des départements
CREATE TABLE IF NOT EXISTS departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  responsable TEXT NOT NULL DEFAULT '',
  contact_responsable TEXT,
  description TEXT,
  nombre_membres INTEGER DEFAULT 0,
  activites TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des liens Zoom
CREATE TABLE IF NOT EXISTS zoom_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  url TEXT NOT NULL,
  meeting_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed des 4 départements
INSERT INTO departements (cle, nom) VALUES
  ('enfants', 'Enfants'),
  ('jeunes', 'Jeunes'),
  ('femmes', 'Femmes'),
  ('groupe_musical', 'Groupe Musical')
ON CONFLICT (cle) DO NOTHING;

-- Seed admin par défaut (mot de passe: admin)
-- SHA-256 de "admin"
INSERT INTO app_users (username, password_hash, nom, role) VALUES
  ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Administrateur', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed lien Zoom par défaut
INSERT INTO zoom_links (titre, url, meeting_id) VALUES
  ('Culte dominical', 'https://us02web.zoom.us/j/84214624356?pwd=UkU0SDJJQ1lXOWtGR29BUjlJWWJ5Zz09', '842 1462 4356');

-- Activer Row Level Security (lecture publique, écriture authentifiée via anon key)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE departements ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoom_links ENABLE ROW LEVEL SECURITY;

-- Policies : accès complet via anon key (l'auth est gérée côté app)
CREATE POLICY "Allow all on services" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on annonces" ON annonces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on departements" ON departements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on zoom_links" ON zoom_links FOR ALL USING (true) WITH CHECK (true);
