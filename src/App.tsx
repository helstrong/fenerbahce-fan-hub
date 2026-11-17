import { Fragment } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ErrorView, LoadingView, WarningBanner } from './components/StatusView'
import { useData } from './data/DataContext'
import { useSport } from './data/SportContext'
import Fixtures from './pages/Fixtures'
import Club from './pages/Club'
import Home from './pages/Home'
import News from './pages/News'
import Opponent from './pages/Opponent'
import Squad from './pages/Squad'
import Standings from './pages/Standings'

export default function App() {
  const { state, refresh } = useData()
  const { sport } = useSport()
  const data = state.data

  return (
    <Layout live={!!data?.live} onRefresh={refresh} refreshing={state.status === 'loading'} badge={data?.club?.badge}>
      {state.status === 'loading' && !data && <LoadingView />}
      {state.status === 'error' && <ErrorView message={state.error} onRetry={refresh} />}
      {data && (
        // Keyed by sport so each screen starts fresh after a switch — a squad
        // filter of "Goalkeeper" or an expanded table row means nothing in the
        // other sport.
        <Fragment key={sport}>
          <WarningBanner warnings={data.warnings} />
          <Routes>
            <Route path="/" element={<Home data={data} />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/opponent/:teamId" element={<Opponent />} />
            <Route path="/squad" element={<Squad data={data} />} />
            <Route path="/club" element={<Club data={data} />} />
            <Route path="/news" element={<News data={data} />} />
          </Routes>
        </Fragment>
      )}
    </Layout>
  )
}
