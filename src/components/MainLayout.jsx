import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="page-wrapper">
          {children}
        </div>
        <Footer />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-container {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: var(--transition);
        }

        .page-wrapper {
          padding: 2.5rem;
          flex: 1;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}} />
    </div>
  );
};

export default MainLayout;
