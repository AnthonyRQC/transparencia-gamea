import { Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface BandejaFiltrosProps {
  search: string;
  setSearch: (value: string) => void;
  filterTipo: string;
  setFilterTipo: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export default function BandejaFiltros({ search, setSearch, filterTipo, setFilterTipo, sortBy, setSortBy }: BandejaFiltrosProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative w-full sm:flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por N° de denuncia o denunciante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="corrupcion">Corrupción</SelectItem>
            <SelectItem value="negacion">Negación</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plazo">Plazo</SelectItem>
            <SelectItem value="fecha">Fecha</SelectItem>
            <SelectItem value="investigador">Investigador</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
