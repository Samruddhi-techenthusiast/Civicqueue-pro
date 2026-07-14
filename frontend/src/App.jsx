import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'

import store from './store'
import { useAppDispatch, useUI } from './hooks'
import { fetchMe } from './store/slices/authSlice'
import { connectSocket } from './services/socket'

import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute, { GuestRoute } from './components/layout/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import CitizenDashboard from './pages/citizen/CitizenDashboard'
import QueueBookingPage from './pages/citizen/QueueBookingPage'
import LiveQueueTracking from './pages/citizen/LiveQueueTracking'
import AppointmentHistory from './pages/citizen/AppointmentHistory'
import NotificationsPanel from './pages/citizen/NotificationsPanel'

import StaffDashboard from './pages/admin/StaffDashboard'
import StaffAppointments from './pages/admin/StaffAppointments'

import AdminDashboard from './pages/admin/AdminDashboard'
import DepartmentManagement from './pages/admin/DepartmentManagement'
import UserManagement from './pages/admin/UserManagement'
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'
import StaffPerformance from './pages/admin/StaffPerformance'

import QRVerificationPage from './pages/shared/QRVerificationPage'

import { ROLES } from './constants'


function AppInit({ children }) {

  const dispatch = useAppDispatch()
  const { theme } = useUI()


  useEffect(() => {

    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark'
    )


    const token = localStorage.getItem('accessToken')

    if(token){
      connectSocket(token)
      dispatch(fetchMe())
    }

  }, [theme])


  return children
}



function AppRoutes(){

return (

<Routes>


<Route path="/" element={<LandingPage/>}/>


<Route 
path="/login" 
element={
<GuestRoute>
<LoginPage/>
</GuestRoute>
}
/>


<Route 
path="/register" 
element={
<GuestRoute>
<RegisterPage/>
</GuestRoute>
}
/>



<Route 
element={
<ProtectedRoute 
roles={[
ROLES.CITIZEN,
ROLES.STAFF,
ROLES.ADMIN,
ROLES.SUPER_ADMIN
]}
>
<DashboardLayout/>
</ProtectedRoute>
}
>


<Route 
path="/dashboard"
element={
<ProtectedRoute roles={[ROLES.CITIZEN]}>
<CitizenDashboard/>
</ProtectedRoute>
}
/>


<Route 
path="/queue"
element={
<ProtectedRoute roles={[ROLES.CITIZEN]}>
<QueueBookingPage/>
</ProtectedRoute>
}
/>


<Route 
path="/track"
element={<LiveQueueTracking/>}
/>


<Route 
path="/appointments"
element={
<ProtectedRoute roles={[ROLES.CITIZEN]}>
<AppointmentHistory/>
</ProtectedRoute>
}
/>


<Route 
path="/notifications"
element={<NotificationsPanel/>}
/>


<Route 
path="/verify"
element={<QRVerificationPage/>}
/>


</Route>





<Route 
element={
<ProtectedRoute
roles={[
ROLES.STAFF,
ROLES.ADMIN,
ROLES.SUPER_ADMIN
]}
>
<DashboardLayout/>
</ProtectedRoute>
}
>


<Route 
path="/staff"
element={<StaffDashboard/>}
/>


<Route 
path="/staff/queue"
element={<StaffDashboard/>}
/>


<Route
path="/staff/appointments"
element={<StaffAppointments/>}
/>


</Route>





<Route 
element={
<ProtectedRoute
roles={[
ROLES.ADMIN,
ROLES.SUPER_ADMIN
]}
>
<DashboardLayout/>
</ProtectedRoute>
}
>


<Route 
path="/admin"
element={<AdminDashboard/>}
/>


<Route 
path="/admin/departments"
element={<DepartmentManagement/>}
/>


<Route
path="/admin/users"
element={<UserManagement/>}
/>


<Route
path="/admin/analytics"
element={<AnalyticsDashboard/>}
/>


<Route
path="/admin/staff-performance"
element={<StaffPerformance/>}
/>


</Route>




<Route 
path="*" 
element={<Navigate to="/" replace/>}
/>


</Routes>

)

}





export default function App(){

return (

<Provider store={store}>

<BrowserRouter>


<AppInit>

<AppRoutes/>


<Toaster
position="top-right"
gutter={8}
/>


</AppInit>


</BrowserRouter>


</Provider>

)

}