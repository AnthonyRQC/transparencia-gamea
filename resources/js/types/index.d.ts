export interface User {
    id: number;
    name: string;
    username: string;
    email: string | null;
    email_verified_at?: string | null;
    rol: string;
    iniciales: string | null;
    color: string | null;
    activo: boolean;
    telefono: string | null;
    preferencias: Record<string, any> | null;
    permisos: string[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    categorias: Record<string, string>;
};
