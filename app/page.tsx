import Journal from '@/components/Journal';

// Só chega aqui quem passou pelo proxy com sessão válida.
export default function Home() {
  return <Journal />;
}
