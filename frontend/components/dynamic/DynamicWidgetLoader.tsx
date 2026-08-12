import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

interface Props {
  widgetName: string;
}

export const DynamicWidgetLoader: React.FC<Props> = ({ widgetName }) => {
  // We use Next.js dynamic import. Note: This requires the file to exist at build time
  // or it might fail if we are generating it dynamically. However, Next.js dev server
  // hot-reloads dynamically generated files in the watched directories!
  
  // Remove extension if provided by the LLM
  const cleanName = widgetName.replace(/\.tsx?$/, '');
  
  const DynamicComponent = dynamic(() => import(`../sandbox/${cleanName}`).catch(err => {
    return () => (
      <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded text-xs font-mono">
        Failed to load widget "{cleanName}": {err.message}
      </div>
    );
  }), {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#3d2e1e] bg-[#1e1812] rounded text-[#b89b6a]">
        <Loader2 className="w-5 h-5 animate-spin mb-2" />
        <span className="text-xs font-mono">Compiling {cleanName}...</span>
      </div>
    ),
    ssr: false // Important: sandboxed components might rely on browser APIs
  });

  return (
    <div className="dynamic-widget-wrapper my-4">
      <Suspense fallback={<div className="animate-pulse h-32 bg-[#1e1812] rounded border border-[#3d2e1e]" />}>
        <DynamicComponent />
      </Suspense>
    </div>
  );
};
