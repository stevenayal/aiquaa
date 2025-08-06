-- =====================================================
-- INSERTS PARA EJECUTAR EN EL DASHBOARD DE SUPABASE
-- =====================================================

-- LIMPIAR DATOS EXISTENTES (OPCIONAL - DESCOMENTAR SI NECESITAS)
-- DELETE FROM "Comment";
-- DELETE FROM "Feedback";

-- =====================================================
-- INSERTAR COMENTARIOS DE PRUEBA
-- =====================================================

INSERT INTO "Comment" (name, message, isAnonymous, userAgent, ip, "createdAt", "updatedAt") VALUES
('María González', '¡Excelente iniciativa! Me encantaría participar en los talleres de automatización. Cypress es mi herramienta favorita.', false, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', NOW(), NOW()),
('Carlos López', 'Muy buena idea crear esta comunidad. Necesitamos más contenido sobre testing de APIs en Paraguay.', false, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.101', NOW(), NOW()),
('Ana Silva', 'Me interesa mucho el tema de seguridad en testing. ¿Habrá talleres sobre OWASP?', false, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.102', NOW(), NOW()),
('Tester Anónimo', 'Quiero mantener mi privacidad pero quiero decir que esta iniciativa es genial. Selenium FTW!', true, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.103', NOW(), NOW()),
('Roberto Fernández', '¿Habrá contenido sobre performance testing? JMeter es esencial en mi trabajo.', false, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.104', NOW(), NOW()),
('Laura Martínez', 'Me encantaría escribir artículos sobre testing. Tengo experiencia con Playwright y quiero compartirla.', false, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.105', NOW(), NOW()),
('Juan Pérez', 'Excelente proyecto. Necesitamos más casos reales de Paraguay. ¿Habrá ejemplos de empresas locales?', false, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.106', NOW(), NOW()),
('Sofia Rodríguez', 'Me interesa mucho el grupo de Discord. ¿Ya está creado? Quiero conectar con otros testers.', false, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.107', NOW(), NOW()),
('Miguel Torres', 'GitHub Actions para CI/CD en testing es mi especialidad. Me gustaría dar charlas sobre esto.', false, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.108', NOW(), NOW()),
('Carmen Vega', 'Los videos cortos serían perfectos para aprender. ¿Habrá tutoriales paso a paso?', false, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.109', NOW(), NOW());

-- =====================================================
-- INSERTAR FEEDBACK DE PRUEBA
-- =====================================================

INSERT INTO "Feedback" ("temasQA", "herramientas", "participacion", "formato", "sugerencias", "sessionId", "userAgent", "ip", "pais", "otrosTemas", "otrasHerramientas", "creadoEn") VALUES
('["automatizacion", "api"]', '["cypress", "postman"]', 'taller', 'videos', 'Me gustaría ver más contenido sobre testing de microservicios', 'session_001', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.110', 'Paraguay', 'Testing de microservicios', 'Katalon Studio', NOW()),
('["manual", "performance"]', '["selenium", "jmeter"]', 'charlas', 'blog', 'Sería genial tener casos de estudio de empresas paraguayas', 'session_002', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.111', 'Paraguay', 'Testing de accesibilidad', 'Appium', NOW()),
('["seguridad", "paraguay"]', '["postman", "gh-actions"]', 'discord', 'infografias', '¿Podrían crear una guía de mejores prácticas para testing en Paraguay?', 'session_003', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.112', 'Paraguay', 'Testing de blockchain', 'Burp Suite', NOW()),
('["automatizacion", "manual"]', '["playwright", "cypress"]', 'articulos', 'plantillas', 'Me encantaría tener plantillas de test cases descargables', 'session_004', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.113', 'Paraguay', 'Testing de IA/ML', 'TestCafe', NOW()),
('["api", "performance"]', '["postman", "jmeter"]', 'red', 'videos', 'Necesito aprender más sobre testing de APIs REST y GraphQL', 'session_005', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.114', 'Paraguay', 'Testing de WebSockets', 'SoapUI', NOW()),
('["seguridad", "automatizacion"]', '["selenium", "gh-actions"]', 'taller', 'blog', '¿Habrá talleres sobre integración continua en testing?', 'session_006', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.115', 'Paraguay', 'Testing de aplicaciones móviles', 'Detox', NOW()),
('["manual", "paraguay"]', '["postman", "cypress"]', 'charlas', 'infografias', 'Me interesa conocer las herramientas más usadas en Paraguay', 'session_007', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.116', 'Paraguay', 'Testing de UX/UI', 'Figma', NOW()),
('["performance", "api"]', '["jmeter", "postman"]', 'discord', 'plantillas', 'Quiero templates para reportes de performance testing', 'session_008', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.117', 'Paraguay', 'Testing de bases de datos', 'DBUnit', NOW()),
('["automatizacion", "seguridad"]', '["playwright", "gh-actions"]', 'articulos', 'videos', 'Me gustaría escribir sobre testing de aplicaciones web modernas', 'session_009', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.118', 'Paraguay', 'Testing de aplicaciones cloud', 'AWS Device Farm', NOW()),
('["manual", "performance"]', '["selenium", "jmeter"]', 'red', 'blog', '¿Podrían crear contenido sobre testing en metodologías ágiles?', 'session_010', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.119', 'Paraguay', 'Testing de chatbots', 'Botium', NOW());

-- =====================================================
-- VERIFICAR LOS DATOS INSERTADOS
-- =====================================================

-- Ver comentarios insertados
SELECT 
    id,
    name,
    message,
    isAnonymous,
    "createdAt"
FROM "Comment" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Ver feedback insertado
SELECT 
    id,
    "temasQA",
    "herramientas",
    "participacion",
    "formato",
    "sugerencias",
    "creadoEn"
FROM "Feedback" 
ORDER BY "creadoEn" DESC 
LIMIT 10;

-- Contar total de registros
SELECT 
    'Comments' as table_name,
    COUNT(*) as total_records
FROM "Comment"
UNION ALL
SELECT 
    'Feedback' as table_name,
    COUNT(*) as total_records
FROM "Feedback"; 