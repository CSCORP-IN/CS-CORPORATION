import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isAnantSubdomain = hostname === 'anant.cscorp.in' || hostname.startsWith('anant.');
  const isAnkitSubdomain = hostname === 'ankit.cscorp.in' || hostname.startsWith('ankit.');
  const isDocsSubdomain = hostname === 'docs.cscorp.in' || hostname.startsWith('docs.');
  const isConnectSubdomain = hostname === 'connect.cscorp.in' || hostname === 'courses.cscorp.in' || hostname.startsWith('connect.') || hostname.startsWith('courses.');
  const isArticlesSubdomain = hostname === 'articles.cscorp.in' || hostname === 'blog.cscorp.in' || hostname.startsWith('articles.') || hostname.startsWith('blog.');

  const getSubdomainHome = () => {
    if (isAnantSubdomain) return <AnantPortfolio />;
    if (isAnkitSubdomain) return <Home />;
    if (isDocsSubdomain) return <Docs />;
    if (isConnectSubdomain) return <Courses />;
    if (isArticlesSubdomain) return <Articles />;
    return <ChaudharySons />;
  };

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ArticleProvider>
            <div className="app">
              <Navbar />
              <main className="content">
                <Routes>
                  {/* Dynamic Root based on Subdomain (ankit., anant., docs., connect., articles.cscorp.in) */}
                  <Route path="/" element={getSubdomainHome()} />
                  <Route path="/chaudhary-and-sons" element={<ChaudharySons />} />
                  <Route path="/ankit-chaudhary" element={<Home />} />
                  <Route path="/ankit" element={<Navigate to="/ankit-chaudhary" replace />} />
                  <Route path="/anant-chaudhary" element={<AnantPortfolio />} />
                  <Route path="/anant" element={<Navigate to="/anant-chaudhary" replace />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/connect" element={<Navigate to="/courses" replace />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
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
