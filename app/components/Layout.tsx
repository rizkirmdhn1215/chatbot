import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-600 mt-8">
        <p>Powered by Hugging Face</p>
      </footer>
    </div>
  );
};

export default Layout; 