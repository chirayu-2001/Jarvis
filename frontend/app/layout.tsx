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
      <body className="bg-[#090a0f] text-[#f3f4f8] min-h-screen flex flex-col antialiased">
        <Header />
        <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-1">
          {children}
        </main>
        <JarvisSidebar />
      </body>
    </html>
  );
}
