import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './loginSlice'
import userReducer from './userSlice'

export default configureStore({
  reducer: {
    login: loginReducer,
    user: userReducer
  }
})