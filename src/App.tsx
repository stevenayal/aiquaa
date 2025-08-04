import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
// import Blog from './pages/Blog';
// import Article from './pages/Article';
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

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Blog temporarily hidden until content is ready
            <Route path="/blog" element={<Blog />} />
            */}
            {/* Article temporarily hidden until blog is ready
            <Route path="/article/:slug" element={<Article />} />
            */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unite" element={<Unite />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/admin" element={<FeedbackAdmin />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/labs/json-validator" element={<JsonValidator />} />
            <Route path="/labs/data-generator" element={<DataGenerator />} />
            <Route path="/labs/checklist" element={<Checklist />} />
            <Route path="/labs/base64-decoder" element={<Base64Converter />} />
            <Route path="/labs/jwt-decoder" element={<JwtDecoder />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;
