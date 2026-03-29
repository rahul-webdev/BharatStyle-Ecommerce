import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface User {
  id: string;
  mobile: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  address?: Address;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  otpSent: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  otpSent: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sendOtp: (state, action: PayloadAction<string>) => {
      state.otpSent = true;
      state.user = { mobile: action.payload, id: "" };
    },
    verifyOtp: (state) => {
      state.isLoggedIn = true;
      state.otpSent = false;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.otpSent = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { sendOtp, verifyOtp, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
