import { createSlice } from '@reduxjs/toolkit'

export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    value: false
  },
  reducers: {
    userLogin: state => {
      state.value = true
    },
    userLogout: state => {
      state.value = false
    },
  }
})

// Action creators are generated for each case reducer function
export const { userLogin, userLogout } = loginSlice.actions

export default loginSlice.reducer