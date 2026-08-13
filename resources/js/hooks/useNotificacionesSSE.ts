import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

export interface NotificacionSSE {
    id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    ticket: string | null;
    destino_url: string;
    leida: boolean;
    fecha_leida: string | null;
    fecha: string;
    icono: string;
    color: string;
}

interface SSEPayload {
    no_leidas: number;
    recientes: NotificacionSSE[];
    previo: number;
}

interface UseNotificacionesSSEOptions {
    /** Datos iniciales de Inertia para pre-poblar el estado */
    initialNoLeidas: number;
    initialRecientes: NotificacionSSE[];
    /** Si es false, el hook no se conecta (usuario no autenticado) */
    enabled: boolean;
}

interface NotificacionesState {
    noLeidas: number;
    recientes: NotificacionSSE[];
}

const MAX_TOAST_FULL = 3;   // 1-3 notificaciones → mostrar individualmente
const MAX_TOAST_SOME = 5;   // 4-5 → mostrar 2 + resumen
const TOAST_DELAY_MS = 900; // delay entre toasts secuenciales

function mostrarToastsNotificacion(
    nuevas: NotificacionSSE[],
    totalNuevas: number,
) {
    if (totalNuevas <= 0) return;

    if (totalNuevas > MAX_TOAST_SOME) {
        // Muchas notificaciones → un solo toast resumen
        toast.info(`Tienes ${totalNuevas} notificaciones sin leer`, {
            description: 'Haz clic en la campana para verlas',
            duration: 5000,
            position: 'top-center',
        });
        return;
    }

    // Determinar cuáles mostrar individualmente
    const toastear = totalNuevas <= MAX_TOAST_FULL
        ? nuevas.slice(0, totalNuevas)
        : nuevas.slice(0, 2); // mostrar 2 + resumen

    const restantes = totalNuevas - toastear.length;

    toastear.forEach((notif, index) => {
        setTimeout(() => {
            const mensajeCorto = notif.mensaje.length > 90
                ? notif.mensaje.slice(0, 87) + '...'
                : notif.mensaje;

            toast(notif.titulo, {
                description: mensajeCorto,
                duration: 5500,
                position: 'top-center',
                action: notif.destino_url ? {
                    label: 'Ver',
                    onClick: () => router.visit(notif.destino_url),
                } : undefined,
                // Usar el color institucional del tipo de notificación
                style: notif.color ? { borderLeft: `4px solid ${notif.color}` } : undefined,
            });
        }, index * TOAST_DELAY_MS);
    });

    // Si había más que no se mostraron individualmente
    if (restantes > 0) {
        setTimeout(() => {
            toast.info(`...y ${restantes} notificación${restantes > 1 ? 'es' : ''} más`, {
                description: 'Revisa el panel de notificaciones',
                duration: 5000,
                position: 'top-center',
            });
        }, toastear.length * TOAST_DELAY_MS);
    }
}

export function useNotificacionesSSE({
    initialNoLeidas,
    initialRecientes,
    enabled,
}: UseNotificacionesSSEOptions): NotificacionesState {
    const [state, setState] = useState<NotificacionesState>({
        noLeidas: initialNoLeidas,
        recientes: initialRecientes,
    });

    // Ref para saber si es la primera conexión (no queremos toasts al cargar)
    const isFirstEventRef = useRef(true);
    const eventSourceRef  = useRef<EventSource | null>(null);
    const reconnectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        if (!enabled) return;

        // Cerrar conexión anterior si existe
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Usar Ziggy route() para generar la URL correcta basada en APP_URL del backend.
        // Esto funciona independientemente de cómo acceda el usuario (IP, dominio, subdir).
        const sseUrl = route('notifications.stream');
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.addEventListener('notificaciones', (e: MessageEvent) => {
            try {
                const payload: SSEPayload = JSON.parse(e.data);
                const { no_leidas, recientes, previo } = payload;

                setState({ noLeidas: no_leidas, recientes });

                // No mostrar toasts en el evento inicial (previo === -1)
                if (!isFirstEventRef.current && previo !== -1 && no_leidas > previo) {
                    const cantidadNuevas = no_leidas - previo;
                    // Tomar solo las nuevas (las primeras del array, que son las más recientes)
                    const nuevas = recientes.slice(0, cantidadNuevas);
                    mostrarToastsNotificacion(nuevas, cantidadNuevas);
                }

                isFirstEventRef.current = false;
            } catch {
                // JSON inválido, ignorar
            }
        });

        // El backend envía este evento cuando alcanza MAX_DURATION — reconectar
        es.addEventListener('reconnect', () => {
            es.close();
            // Reconectar después de un breve delay
            reconnectTimer.current = setTimeout(connect, 2000);
        });

        es.onerror = () => {
            // EventSource reconecta automáticamente, pero si el error persiste
            // (ej. sesión expirada), dejamos de intentar.
            // El navegador ya maneja la reconexión con retry automático.
        };
    }, [enabled]);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
        };
    }, [connect]);

    return state;
}
