import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: [{
      id: 0,
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      languages_spoken: "",
      safety_score: 0,
      temp: 0,
      urban: 0,
      hotel_price: 0,
      preferred_airport: ""
    }],
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    userLI: (state, action) => {
      state.value = action.payload;
      state.isAuthenticated = true;
    },
    userLO: state => {
      state.value = [{
        id: 0,
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        languages_spoken: "",
        safety_score: 0,
        temp: 0,
        urban: 0,
        hotel_price: 0,
        preferred_airport: ""
      }];
      state.isAuthenticated = false;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
})

// Action creators are generated for each case reducer function
export const { userLI, userLO, setToken, setError, setLoading } = userSlice.actions

export default userSlice.reducer