import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
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
import { CartProvider } from './context/CartContext'
import { JobsProvider } from './context/JobsContext'

function App() {
  return (
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
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/machine/:id" element={<MachineDetail />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/list-service" element={<PostJob />} />
              </Routes>
            </PageTransition>
          </main>
          <Footer />
        </div>
      </JobsProvider>
    </CartProvider>
  )
}

export default App