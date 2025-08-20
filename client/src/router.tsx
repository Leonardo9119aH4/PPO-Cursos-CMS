import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/home";
import SignIn from "./pages/signin/signin";
import SignUp from "./pages/signup/signup";
import Profile from "./pages/profile/profile";
import Courses from "./pages/courses/courses";
import NewCourse from './pages/newCourse/newCourse';
import CourseEditor from './pages/courseEditor/courseEditor';
import MyCourses from "./pages/myCourses/myCourses";
import NewLevel from "./pages/newLevel/newLevel";
import TheoryEditor from "./pages/theoryEditor/theoryEditor";
import QuizEditor from "./pages/quizEditor/quizEditor";
import PlayLevels from "./pages/playLevels/playLevels";

function MainRoutes(){
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/newCourse" element={<NewCourse />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/mycourses" element={<MyCourses />} />
            <Route path="/courseEditor/:courseId" element={<CourseEditor />} />
            <Route path="/newLevel/:courseId" element={<NewLevel />} />
            <Route path="/theoryEditor/:courseId/:order" element={<TheoryEditor />} />
            <Route path="/quizEditor/:courseId/:order" element={<QuizEditor />} />
            <Route path="/playLevels/:courseId" element={<PlayLevels/>} />
        </Routes>
    )
}

export default MainRoutes;