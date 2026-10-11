/** Copia texto al portapapeles con fallback para contextos no seguros (http). */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // cae al fallback
  }
  try {
    // Dentro de un modal Radix el foco vive en el dialog: anexar ahí para
    // que focus/select/execCommand operen en el mismo árbol.
    const target =
      document.querySelector('[role="dialog"]') || document.body;
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    target.appendChild(ta);
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, texto.length);
    const ok = document.execCommand('copy');
    target.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
