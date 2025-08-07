import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import GoogleAnalytics from './components/GoogleAnalytics';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Article from './pages/Article';
import About from './pages/About';
import Contact from './pages/Contact';
import Unite from './pages/Unite';
import Labs from './pages/Labs';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Feedback from './pages/Feedback';
import FeedbackAdmin from './pages/FeedbackAdmin';
import JsonValidator from './components/Labs/JsonValidator';
import DataGenerator from './components/Labs/DataGenerator';
import Checklist from './components/Labs/Checklist';
import Base64Converter from './components/Labs/Base64Converter';
import JwtDecoder from './components/Labs/JwtDecoder';
import YamlValidator from './components/Labs/YamlValidator';
import CronTabValidator from './components/Labs/CronTabValidator';
import SqlObjectGenerator from './components/Labs/SqlObjectGenerator';
import QARoute from './pages/QARoute';
import Stats from './pages/Stats';
import ToolRecommender from './pages/ToolRecommender';
// import TesterZone from './pages/TesterZone';
// import Community from './pages/Community';
import ApiTest from './pages/ApiTest';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <GoogleAnalytics />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/article/:slug" element={<Article />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unite" element={<Unite />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/feedback/admin" element={<FeedbackAdmin />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/labs/yaml-validator" element={<YamlValidator />} />
              <Route path="/labs/crontab-validator" element={<CronTabValidator />} />
              <Route path="/labs/sql-generator" element={<SqlObjectGenerator />} />
              <Route path="/labs/json-validator" element={<JsonValidator />} />
              <Route path="/labs/data-generator" element={<DataGenerator />} />
              <Route path="/labs/checklist" element={<Checklist />} />
              <Route path="/labs/base64-decoder" element={<Base64Converter />} />
              <Route path="/labs/jwt-decoder" element={<JwtDecoder />} />
              <Route path="/ruta-qa" element={<QARoute />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/herramientas-recomendadas" element={<ToolRecommender />} />
              {/* TesterZone temporarily hidden until functionality is complete
              <Route path="/zona-tester" element={<TesterZone />} />
              */}
              {/* Comunidad temporarily hidden until backend integration is improved
              <Route path="/comunidad" element={<Community />} />
              */}
              <Route path="/api-test" element={<ApiTest />} />
              <Route path="/herramientas" element={<Navigate to="/labs" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
