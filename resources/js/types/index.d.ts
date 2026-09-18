export interface User {
    id: number;
    name: string;
    username: string;
    nombres?: string | null;
    apellidos?: string | null;
    ci?: string | null;
    email: string | null;
    email_verified_at?: string | null;
    rol: string;
    iniciales: string | null;
    color: string | null;
    activo: boolean;
    telefono: string | null;
    debe_cambiar_password?: boolean;
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
    dependencias: Array<{ id: number; nombre: string; parent_id?: number | null }>;
    clasificaciones: Array<{ id: number; clave: string; nombre: string }>;
    medios_notificacion: Array<{ id: number; clave: string; nombre: string }>;
};

/** Props compartidas por el middleware (guest o autenticado). Sprint 12.3. */
export interface SharedPageProps extends Record<string, unknown> {
    auth: {
        user: Pick<User, 'id' | 'name' | 'username' | 'rol' | 'iniciales' | 'color' | 'permisos'> | null;
    };
    logo_url?: string;
    utlcc_logo_url?: string;
    jacha_url?: string;
    notificaciones?: {
        no_leidas: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recientes: any[];
    };
    simFecha?: string | null;
    devTiempo?: { visible?: boolean; simFecha?: string | null };
    success?: string | null;
    ticket?: string | null;
    token?: string | null;
    credencialTemporal?: { username: string; password: string; nombre: string } | null;
}
