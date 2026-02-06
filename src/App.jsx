import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import InstallBanner from './components/InstallBanner'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Videos from './pages/Videos'
import Booking from './pages/Booking'
import Grades from './pages/Grades'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Exams from './pages/Exams'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVideos from './pages/admin/AdminVideos'
import AdminMessages from './pages/admin/AdminMessages'
import AdminAccount from './pages/admin/AdminAccount'
import AdminExams from './pages/admin/AdminExams'

const titles = {
  '/': 'الرئيسية',
  '/videos': 'فيديوهات الشرح',
  '/booking': 'حجوزات الطلبة',
  '/grades': 'الدرجات والغياب',
  '/exams': 'الامتحانات',
  '/dashboard': 'لوحة التحكم',
  '/profile': 'الملف الشخصي',
}

function AppLayout() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InstallBanner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="account" element={<AdminAccount />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
