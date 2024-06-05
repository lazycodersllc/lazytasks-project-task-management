import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile/Profile';
import ResetPassword from './components/Profile/ResetPassword';
import Settings from './components/Settings/Settings';
import Workspace from './components/Settings/Workspace';
import Projects from './components/Settings/Projects';
import ProjectDetails from './components/Elements/Project/ProjectDetails'; 
import { Provider } from 'react-redux';
import store from './store';
import { useSelector } from 'react-redux';
import ProfileEdit from "./components/Profile/ProfileEdit";
import Login from "./components/Login";
import ProtectedRoute from "./route/ProtectedRoute";
import PublicRoute from "./route/PublicRoute";
import MyTask from "./components/MyTask";

const AppRoutes = () => {

  return ( 
      <HashRouter>
          <Routes>

              <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-task" element={<MyTask />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<ProfileEdit />} />
                  <Route path="/resetpassword" element={<ResetPassword />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route path="/project" element={<Projects />} />
                  <Route path="/project/task/list/:id" element={<ProjectDetails />} />
                  <Route path="/project/task/board/:id" element={<ProjectDetails />} />
              </Route>
              <Route path="/" element={<PublicRoute />}>
                  <Route path="/" element={<Login />} />
                  <Route path="/lazy-login" element={<Login />} />
              </Route>

              {/*<Route path="/project/project-details" element={<ProjectDetails />} />*/}
              {/*<Route path="/project/project-board" element={<ProjectDetails />} />*/}
          </Routes>
      </HashRouter>
  );
};

export default AppRoutes;
