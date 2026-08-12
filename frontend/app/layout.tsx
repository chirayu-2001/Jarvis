import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { JarvisSidebar } from '@/components/layout/JarvisSidebar';

export const metadata = {
  title: 'Jarvis OS — Personal Continuity Engine',
  description: 'AI-powered personal operating system bringing context, momentum, and continuity back to your trajectories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0d0d] text-[#f0e6d3] min-h-screen flex flex-col antialiased">
        <Header />
        <main className="w-full px-6 lg:px-10 py-6 flex-1">
          {children}
        </main>
        <JarvisSidebar />
      </body>
    </html>
  );
}
