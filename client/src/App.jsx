import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
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
import ThankYou from './pages/ThankYou';
import KhataKit from './pages/KhataKit';
import CSLocker from './pages/CSLocker';
import WorkspacePreferencesModal from './components/WorkspacePreferencesModal';
import { ArticleProvider } from './context/ArticleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showFirstTimeModal, setShowFirstTimeModal] = React.useState(false);

  // Check if newly logged-in user hasn't chosen preferences yet
  React.useEffect(() => {
    if (isAuthenticated && user && user.hasChosenPreferences === false) {
      setShowFirstTimeModal(true);
    } else {
      setShowFirstTimeModal(false);
    }
  }, [isAuthenticated, user]);

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isAnantSubdomain = hostname === 'anant.cscorp.in' || hostname.startsWith('anant.');
  const isAnkitSubdomain = hostname === 'ankit.cscorp.in' || hostname.startsWith('ankit.');
  const isDocsSubdomain = hostname === 'docs.cscorp.in' || hostname.startsWith('docs.');
  const isConnectSubdomain = hostname === 'connect.cscorp.in' || hostname === 'courses.cscorp.in' || hostname.startsWith('connect.') || hostname.startsWith('courses.');
  const isArticlesSubdomain = hostname === 'articles.cscorp.in' || hostname === 'blog.cscorp.in' || hostname.startsWith('articles.') || hostname.startsWith('blog.');
  const isKhataKitSubdomain = hostname === 'khatakit.cscorp.in' || hostname.startsWith('khatakit.');
  const isCSLockerSubdomain = hostname === 'cslocker.cscorp.in' || hostname === 'locker.cscorp.in' || hostname.startsWith('cslocker.') || hostname.startsWith('locker.');

  const isThankYouPage = location.pathname === '/thankyou' || location.pathname === '/thank-you';

  // Smart landing based on user preferences:
  // If user only enabled ['khatakit'] and visits '/', take them straight to /khatakit
  const userModules = Array.isArray(user?.enabledModules) ? user.enabledModules : [];
  const onlyKhataKit = userModules.length === 1 && userModules[0] === 'khatakit';
  const onlyCSLocker = userModules.length === 1 && userModules[0] === 'cslocker';

  const getSubdomainHome = () => {
    if (isAnantSubdomain) return <AnantPortfolio />;
    if (isAnkitSubdomain) return <Home />;
    if (isDocsSubdomain) return <Docs />;
    if (isConnectSubdomain) return <Courses />;
    if (isArticlesSubdomain) return <Articles />;
    if (isKhataKitSubdomain) return <KhataKit />;
    if (isCSLockerSubdomain) return <CSLocker />;

    if (onlyKhataKit) return <KhataKit />;
    if (onlyCSLocker) return <CSLocker />;
    return <ChaudharySons />;
  };

  return (
    <div className="app">
      {!isThankYouPage && <Navbar />}
      <main className={`content ${isThankYouPage ? 'thankyou-clean-layout' : ''}`}>
        <Routes>
          {/* Dynamic Root based on Subdomain or User Preference */}
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
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/thank-you" element={<Navigate to="/thankyou" replace />} />
          <Route path="/khatakit" element={<KhataKit />} />
          <Route path="/cslocker" element={<CSLocker />} />
        </Routes>
      </main>
      {!isThankYouPage && <Footer />}

      {/* First-time Onboarding Modal for New Accounts */}
      <WorkspacePreferencesModal
        isOpen={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
        isFirstTime={true}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <ArticleProvider>
            <AppRoutes />
          </ArticleProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
