// Static background blobs — no JS animation for better mobile performance
export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="blob-1 absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="blob-2 absolute top-1/4 -right-20 w-80 h-80 bg-emerald-600/15 rounded-full blur-[100px]" />
      <div className="blob-3 absolute bottom-0 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]" />
    </div>
  );
}
