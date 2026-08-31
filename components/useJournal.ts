'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewId } from '@/lib/plan';
import { canonical, merge } from '@/lib/merge';
import { adopt, emptyState, load, save, stamp, type JournalState } from '@/lib/state';

/**
 * Estado do diário: local primeiro, servidor logo atrás.
 *
 * O primeiro render é sempre o estado vazio — no servidor não existe
 * localStorage, e divergir dele quebraria a hidratação. O conteúdo real entra
 * logo depois, no efeito, e `ready` diz quando isso aconteceu.
 *
 * A gravação continua sendo no localStorage, síncrona: é o que faz marcar um
 * hábito ser instantâneo e funcionar sem rede. A sincronização é um segundo
 * movimento, sempre em segundo plano — nada na interface espera por ela.
 */

const SYNC_DEBOUNCE_MS = 1500;
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function useJournal() {
  const [state, setState] = useState<JournalState>(emptyState);
  const [ready, setReady] = useState(false);
  const [status, setStatusText] = useState('');
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * O estado mais recente, fora do ciclo de render: a sincronização pode
   * disparar entre um render e outro e precisa enviar o que existe agora, não
   * o que existia quando o efeito foi criado.
   */
  const stateRef = useRef(state);
  stateRef.current = state;

  const dirty = useRef(false);   // há alteração local ainda não confirmada
  const running = useRef(false); // já existe um POST em voo
  const again = useRef(false);   // ...e chegou outro pedido enquanto isso
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setStatusText(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatusText(''), 1600);
  }, []);

  /**
   * Envia o estado local e adota a resposta.
   *
   * O detalhe que não pode mudar: a resposta é FUNDIDA com o estado atual, não
   * colocada no lugar dele. Entre o envio e a volta o usuário pode ter marcado
   * outra coisa, e substituir engoliria essa marcação. Fundindo, ela tem
   * carimbo mais novo e sobrevive.
   */
  const syncNow = useCallback(async () => {
    if (running.current) {
      again.current = true; // não empilha requisição; refaz ao terminar
      return;
    }
    running.current = true;
    const hadChanges = dirty.current;
    dirty.current = false;

    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateRef.current),
        cache: 'no-store',
      });

      // Sessão expirada: o `proxy.ts` responde 401 em vez de redirecionar API.
      if (res.status === 401) {
        window.location.assign('/login');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));

      const doc: unknown = await res.json();
      setState((prev) => {
        const next = merge(prev, adopt(doc, prev.view));
        if (canonical(next) === canonical(prev)) return prev;
        stateRef.current = next;
        save(next);
        flash('sincronizado ✓');
        return next;
      });
    } catch {
      // Offline não precisa de fila: o localStorage já é a fila, e o próximo
      // gatilho reenvia o estado inteiro.
      dirty.current = dirty.current || hadChanges;
      if (hadChanges) flash('sem conexão — sobe depois');
    } finally {
      running.current = false;
      if (again.current) {
        again.current = false;
        void syncNow();
      }
    }
  }, [flash]);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => void syncNow(), SYNC_DEBOUNCE_MS);
  }, [syncNow]);

  useEffect(() => {
    const stored = load();
    if (stored) {
      stateRef.current = stored; // antes do primeiro envio, que é logo abaixo
      setState(stored);
    }
    setReady(true);
    void syncNow();

    // Quatro gatilhos, nenhum deles uma verificação agressiva: o que muda o
    // estado do outro lado é o usuário abrir o site em outro aparelho.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncNow();
    };
    const onOnline = () => void syncNow();
    const tick = setInterval(onVisible, SYNC_INTERVAL_MS);

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [syncNow]);

  /**
   * Aplica uma mutação e persiste. O callback recebe um rascunho já clonado.
   * `local` marca o que não deve viajar entre aparelhos.
   */
  const mutate = useCallback(
    (fn: (draft: JournalState) => void, options?: { local?: boolean }) => {
      setState((prev) => {
        const draft: JournalState = JSON.parse(JSON.stringify(prev));
        fn(draft);
        stateRef.current = draft;
        flash(save(draft) ? 'salvo ✓' : 'não foi possível salvar');
        if (!options?.local) {
          dirty.current = true;
          scheduleSync();
        }
        return draft;
      });
    },
    [flash, scheduleSync]
  );

  const toggleTask = useCallback((dstr: string, key: string) => {
    mutate((d) => {
      const day = (d.day[dstr] ||= {});
      if (day[key]) {
        delete day[key];
        if (!Object.keys(day).length) delete d.day[dstr];
      } else {
        day[key] = true;
      }
      stamp(d, 'day', dstr, key);
    });
  }, [mutate]);

  const toggleFlag = useCallback(
    (group: 'units' | 'tracks' | 'checks' | 'ms' | 'reduced', key: string) => {
      mutate((d) => {
        if (d[group][key]) delete d[group][key];
        else d[group][key] = true;
        stamp(d, group, key);
      });
    },
    [mutate]
  );

  const setMonthly = useCallback((mk: string, qid: string, answer: string) => {
    mutate((d) => {
      (d.monthly[mk] ||= {})[qid] = answer;
      stamp(d, 'monthly', mk, qid);
    });
  }, [mutate]);

  // Qual view está aberta é preferência de aparelho: a aba do notebook não
  // deve mandar na do celular, e trocar de aba não é motivo para ir à rede.
  const setView = useCallback((view: ViewId) => {
    mutate((d) => { d.view = view; }, { local: true });
  }, [mutate]);

  return { state, ready, status, toggleTask, toggleFlag, setMonthly, setView };
}

export type Journal = ReturnType<typeof useJournal>;
