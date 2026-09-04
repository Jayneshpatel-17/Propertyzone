// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
// import './App.css'
import Login from './Login.jsx'
import Guest from './guest.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registration from './registration';
import Home from './home.jsx'
import SellerHome from './sellerhome.jsx'
import Dashboard from './dashboard.jsx'
import Sell from './sell.jsx'
import EditProfile from './editprofile.jsx'
import EditProfileSeller from './editprofileseller.jsx'
import Aboutus from './aboutus.jsx'
import UserAboutus from './useraboutus.jsx'
import Contactus from './contactus.jsx'
import Booking from './booking.jsx'
import UserBooking from './userbooking.jsx'
import Help from './help.jsx'
import Help1 from './help1.jsx'
import Reviews from './reviews.jsx'
import Details from './details.jsx'
import SellerDetails from './sellerdetails.jsx'
import Rent from './rent.jsx'
import Property from './property.jsx'
import EditProperty from './EditProperty.jsx'
import ProtectedRoute from "./ProtectedRoute.jsx";
import ForgotPassword from './forgotpassword.jsx';
import ResetPassword from './resetpassword.jsx';

// export default App

import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // const [message, setMessage] = useState("");

  // useEffect(() => {
  //   axios
  //     .get("http://127.0.0.1:8000/propertyzone/")
  //     .then((response) => {
  //       setMessage(response.data.message);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, []);

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Guest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
        path="/home"
        element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        } />
        <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        }
    />
        <Route path="/dashboard/home" element={<SellerHome />} />
    <Route
        path="/details/:id"
        element={
            <ProtectedRoute>
                <Details />
            </ProtectedRoute>
        } />
    <Route
        path="/sellerdetails/:id"
        element={
            <ProtectedRoute>
                <SellerDetails />
            </ProtectedRoute>
        } />
    <Route path="/editprofile" element={<EditProfile />} />
    <Route path="/editprofileseller" element={<EditProfileSeller />} />
    <Route path="/dashboard/aboutus" element={<Aboutus />} />
    <Route path="/aboutus" element={<UserAboutus />} />
    
      <Route path="/dashboard/sell" element={<Sell />} />
      <Route path="/dashboard/rent" element={<Rent />} />
      <Route path="/dashboard/reviews" element={<Reviews />} />
      <Route path="/dashboard/help" element={<Help />} />
      <Route path="/help" element={<Help1 />} />
      <Route path="/dashboard/contact" element={<Contactus />} />
      <Route path="/dashboard/booking" element={<Booking />} />
      <Route path="/booking" element={<UserBooking />} />
      <Route path="/dashboard/property" element={
        <ProtectedRoute>
        <Property />
        </ProtectedRoute>} />
      <Route
          path="/edit/:id"
          element={<EditProperty />}
      />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
