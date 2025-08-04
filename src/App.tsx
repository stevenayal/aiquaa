import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Article from './pages/Article';
import About from './pages/About';
import Contact from './pages/Contact';
import Unite from './pages/Unite';
import Labs from './pages/Labs';
import JsonValidator from './components/Labs/JsonValidator';
import DataGenerator from './components/Labs/DataGenerator';
import Checklist from './components/Labs/Checklist';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unite" element={<Unite />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/json-validator" element={<JsonValidator />} />
            <Route path="/labs/data-generator" element={<DataGenerator />} />
            <Route path="/labs/checklist" element={<Checklist />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;
