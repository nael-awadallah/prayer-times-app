import './globals.css';

export const metadata = {
  title: 'Prayer Times App',
  description: 'Prayer Times Countdown with City Selection',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
