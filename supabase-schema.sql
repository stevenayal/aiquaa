-- Script SQL para crear las tablas en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar Row Level Security (RLS)
ALTER TABLE IF EXISTS usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) DEFAULT 'comunidad',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  temas_qa TEXT NOT NULL,
  herramientas TEXT NOT NULL,
  participacion VARCHAR(100),
  formato VARCHAR(100),
  sugerencias TEXT,
  session_id VARCHAR(255),
  user_agent TEXT,
  ip VARCHAR(45),
  pais VARCHAR(100),
  otros_temas TEXT,
  otras_herramientas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad para usuarios
CREATE POLICY "Usuarios son visibles para todos" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden ser creados por cualquiera" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden ser actualizados por sí mismos" ON usuarios
  FOR UPDATE USING (auth.uid()::text = email);

-- Políticas de seguridad para feedbacks
CREATE POLICY "Feedbacks son visibles para todos" ON feedbacks
  FOR SELECT USING (true);

CREATE POLICY "Feedbacks pueden ser creados por cualquiera" ON feedbacks
  FOR INSERT WITH CHECK (true);

-- Políticas de seguridad para comments
CREATE POLICY "Comments son visibles para todos" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Comments pueden ser creados por cualquiera" ON comments
  FOR INSERT WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en comments
CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_feedbacks_creado_en ON feedbacks(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Comentarios para documentar las tablas
COMMENT ON TABLE usuarios IS 'Tabla de usuarios de la comunidad Aiquaa';
COMMENT ON TABLE feedbacks IS 'Tabla de feedback de la comunidad sobre temas de QA';
COMMENT ON TABLE comments IS 'Tabla de comentarios de la comunidad';

-- Datos de ejemplo (opcional)
INSERT INTO usuarios (nombre, email, rol) VALUES 
  ('Steven Ayala', 'steven@aiquaa.com', 'admin'),
  ('Usuario Ejemplo', 'usuario@ejemplo.com', 'comunidad')
ON CONFLICT (email) DO NOTHING; 