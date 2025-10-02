import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Materials from './pages/Materials'
import Machinery from './pages/Machinery'
import Jobs from './pages/Jobs'
import Moulds from './pages/Moulds'
import ProductDetail from './pages/ProductDetail'
import MachineDetail from './pages/MachineDetail'
import JobDetail from './pages/JobDetail'
import Cart from './pages/Cart'
import PostJob from './pages/PostJob'
import About from './pages/About'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Chat from './pages/Chat'
import News from './pages/News'
import Forum from './pages/Forum'
import Login from './pages/Login'
import Account from './pages/Account'
import Admin from './pages/Admin'
import { CartProvider } from './context/CartContext'
import { JobsProvider } from './context/JobsContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserActivityProvider } from './contexts/UserActivityContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { AdminProvider } from './contexts/AdminContext'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserActivityProvider>
          <AdminProvider>
            <CartProvider>
              <JobsProvider>
              <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/machinery" element={<Machinery />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/moulds" element={<Moulds />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/news" element={<News />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/login" element={<Login />} />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/machine/:id" element={<MachineDetail />} />
                <Route path="/job/:id" element={<JobDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/post-job" element={
                  <ProtectedRoute>
                    <PostJob />
                  </ProtectedRoute>
                } />
                <Route path="/list-service" element={
                  <ProtectedRoute>
                    <PostJob />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={<Admin />} />
                </Routes>
              </PageTransition>
            </main>
                <Footer />
              </div>
              </JobsProvider>
            </CartProvider>
          </AdminProvider>
        </UserActivityProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App