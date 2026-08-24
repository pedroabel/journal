'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setMsg('verificando…');

    let res: Response;
    try {
      res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch {
      setMsg('sem conexão');
      setBusy(false);
      return;
    }

    if (res.ok) {
      setPassword('');
      router.replace('/');
      router.refresh();
      return;
    }

    setMsg(res.status === 429 ? 'tentativas demais — espere alguns minutos' : 'senha incorreta');
    setBusy(false);
  }

  return (
    <form className="lockbox" onSubmit={onSubmit}>
      <span className="kicker">Fonte única de referência</span>
      <h3>Sistema Unificado</h3>
      <p>Este diário é privado. Digite a senha para entrar.</p>
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        required
      />
      <div className="lockmsg">{msg}</div>
      <div className="lockbtns">
        <button type="submit" className="lockgo" disabled={busy}>
          Entrar
        </button>
      </div>
    </form>
  );
}
