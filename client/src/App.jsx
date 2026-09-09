import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Courses from './pages/Courses';
import Docs from './pages/Docs';
import ChaudharySons from './pages/ChaudharySons';
import AnantPortfolio from './pages/AnantPortfolio';
import Resume from './pages/Resume';
import Post from './pages/Post';
import Admin from './pages/Admin';
import EditArticle from './pages/EditArticle';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { ArticleProvider } from './context/ArticleContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const isAnantSubdomain = typeof window !== 'undefined' && 
    (window.location.hostname === 'anant.cscorp.in' || window.location.hostname.startsWith('anant.'));

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ArticleProvider>
            <div className="app">
              <Navbar />
              <main className="content">
                <Routes>
                  <Route path="/" element={isAnantSubdomain ? <AnantPortfolio /> : <Home />} />
                  <Route path="/chaudhary-and-sons" element={<ChaudharySons />} />
                  <Route path="/anant-chaudhary" element={<AnantPortfolio />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/resume" element={<Resume />} />
                  <Route path="/post" element={<Post />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/edit/:id" element={<EditArticle />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ArticleProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
