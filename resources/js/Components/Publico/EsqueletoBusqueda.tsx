export default function EsqueletoBusqueda() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded-lg w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="h-3 bg-muted rounded w-20" />
            <div className="h-2 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}
