import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import QueryToolPageB  from './pages/QueryToolPageB'
import ChartsPage      from './pages/ChartsPage'
import DataEntryPage   from './pages/DataEntryPage'
import LoginPage       from './pages/LoginPage'
import AdminPage       from './pages/AdminPage'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<ProtectedRoute><Navigate to='/query-tool' replace /></ProtectedRoute>} />
        <Route path='/query-tool'   element={<ProtectedRoute><QueryToolPageB /></ProtectedRoute>} />
        <Route path='/query-tool-b' element={<ProtectedRoute><QueryToolPageB /></ProtectedRoute>} />
        <Route path='/charts'       element={<ProtectedRoute><ChartsPage /></ProtectedRoute>} />
        <Route path='/data-entry'   element={<ProtectedRoute><DataEntryPage /></ProtectedRoute>} />
        <Route path='/admin'        element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
