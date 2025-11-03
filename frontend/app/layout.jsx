import './globals.css';
import AuthProvider from './context/AuthContext';

export const metadata = {
  title: 'Time & Date Ultimate',
  description: 'World clocks, events, planners, timers, sunrise/sunset and more',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
