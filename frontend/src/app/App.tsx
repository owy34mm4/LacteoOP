import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/Shell';
import '../styles/styles.css';
import '../styles/shell.css';

const App: React.FC = () => (
  <div className="lo-app">
    <AppSidebar />
    <div className="lo-main">
      <Outlet />
    </div>
  </div>
);

export default App;
