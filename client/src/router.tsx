import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import SignIn from "./pages/signin";

function MainRoutes(){
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
        </Routes>
    )
}

export default MainRoutes;