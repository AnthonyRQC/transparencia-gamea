import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Feriados() {
    useEffect(() => {
        router.visit(route('admin.catalogos'), { preserveState: false });
    }, []);

    return null;
}
