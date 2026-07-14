import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import queueReducer from './slices/queueSlice'
import { departmentSlice, notificationSlice, uiSlice } from './slices/otherSlices'

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    queue:         queueReducer,
    departments:   departmentSlice.reducer,
    notifications: notificationSlice.reducer,
    ui:            uiSlice.reducer,
  },
})

export default store
