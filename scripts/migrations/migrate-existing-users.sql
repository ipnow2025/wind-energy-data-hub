-- Migrate existing hardcoded users to database
INSERT INTO users (id, username, password, role) VALUES
  ('admin', 'admin', 'jinyoung1977!', 'admin'),
  ('kier', 'KIER', 'kier1977!', 'guest'),
  ('motir', 'MOTIR', 'motir2753@', 'guest'),
  ('kpx', 'KPX', 'kpx1948#', 'guest'),
  ('mcee', 'MCEE', 'mcee8531!', 'guest'),
  ('unison', 'UNISON', 'no1windturbine@', 'guest'),
  ('koen', 'KOEN', 'betterworld86$', 'guest'),
  ('dxlabz', 'DXLABZ', 'digitaltwin134!', 'guest'),
  ('vgen', 'VGEN', 'vgen46581!', 'guest'),
  ('iae', 'IAE', 'iae76921@', 'guest')
ON CONFLICT (id) DO NOTHING;
