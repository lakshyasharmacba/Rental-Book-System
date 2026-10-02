import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <Header />
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};
