import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorView, LoadingView, WarningBanner } from './components/StatusView'
import { useData } from './data/DataContext'
import Fixtures from './pages/Fixtures'
import Home from './pages/Home'
import News from './pages/News'
import Squad from './pages/Squad'
import Standings from './pages/Standings'

export default function App() {
  const { state, refresh } = useData()
  const data = state.data

  return (
    <Layout live={!!data?.live} onRefresh={refresh} refreshing={state.status === 'loading'}>
      {state.status === 'loading' && !data && <LoadingView />}
      {state.status === 'error' && <ErrorView message={state.error} onRetry={refresh} />}
      {data && (
        <>
          <WarningBanner warnings={data.warnings} />
          <Routes>
            <Route path="/" element={<Home data={data} />} />
            <Route path="/fixtures" element={<Fixtures data={data} />} />
            <Route path="/standings" element={<Standings data={data} />} />
            <Route path="/squad" element={<Squad data={data} />} />
            <Route path="/news" element={<News data={data} />} />
          </Routes>
        </>
      )}
    </Layout>
  )
}
