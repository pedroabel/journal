/**
 * Copiar texto, com escada de degradação.
 *
 * A API moderna falha em contextos previsíveis — permissão negada, WebView do
 * celular, página fora de foco — e falhar em silêncio numa ação cujo único
 * retorno é o "Copiado ✓" seria mentir para quem clicou. Por isso o
 * `textarea` invisível continua aqui, e por isso a função devolve booleano em
 * vez de lançar: quem chama precisa saber se deve acender o ✓.
 */
export async function copiar(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}
