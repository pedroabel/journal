'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewId } from '@/lib/plan';
import {
  adopt, emptyState, load, save, stamp, stampAll,
  type JournalState,
} from '@/lib/state';

/**
 * Estado do diário, com persistência local.
 *
 * O primeiro render é sempre o estado vazio — no servidor não existe
 * localStorage, e divergir dele quebraria a hidratação. O conteúdo real entra
 * logo depois, no efeito, e `ready` diz quando isso aconteceu.
 */
export function useJournal() {
  const [state, setState] = useState<JournalState>(emptyState);
  const [ready, setReady] = useState(false);
  const [status, setStatusText] = useState('');
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = load();
    if (stored) setState(stored);
    setReady(true);
  }, []);

  const flash = useCallback((msg: string) => {
    setStatusText(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatusText(''), 1600);
  }, []);

  /** Aplica uma mutação e persiste. O callback recebe um rascunho já clonado. */
  const mutate = useCallback(
    (fn: (draft: JournalState) => void) => {
      setState((prev) => {
        const draft: JournalState = JSON.parse(JSON.stringify(prev));
        fn(draft);
        flash(save(draft) ? 'salvo ✓' : 'não foi possível salvar');
        return draft;
      });
    },
    [flash]
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
    (group: 'tracks' | 'checks' | 'ms' | 'reduced', key: string) => {
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

  const setView = useCallback((view: ViewId) => {
    mutate((d) => { d.view = view; });
  }, [mutate]);

  const reset = useCallback(() => {
    mutate((d) => {
      stampAll(d); // carimba antes de apagar: a remoção precisa propagar
      d.day = {}; d.tracks = {}; d.checks = {}; d.ms = {}; d.reduced = {}; d.monthly = {};
    });
  }, [mutate]);

  const importBackup = useCallback((raw: unknown) => {
    mutate((d) => {
      const next = adopt(raw, d.view);
      Object.assign(d, next);
      stampAll(d); // o backup restaurado vence o que estiver em outro aparelho
    });
  }, [mutate]);

  return {
    state, ready, status, flash,
    toggleTask, toggleFlag, setMonthly, setView, reset, importBackup,
  };
}

export type Journal = ReturnType<typeof useJournal>;
