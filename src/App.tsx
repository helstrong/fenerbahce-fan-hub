import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Fixtures from './pages/Fixtures'
import Standings from './pages/Standings'
import Squad from './pages/Squad'
import News from './pages/News'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </Layout>
  )
}
