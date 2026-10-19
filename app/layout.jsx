import './globals.css';

export const metadata = {
  title: 'Smart Parking Lot Slot Allocator | DSA Project UET Lahore',
  description: 'Intelligent parking slot allocation system utilizing Indexed Min-Heap, Hash Map, and Queue data structures. Submitted to Sir Sultan by Ayan Mazhar, Ghania Qadeer, Iman Ali, and Sameer Mahmood.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23722F37%22/><text y=%22.9em%22 x=%2220%22 font-size=%2280%22 fill=%22white%22 font-family=%22sans-serif%22 font-weight=%22bold%22>P</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
