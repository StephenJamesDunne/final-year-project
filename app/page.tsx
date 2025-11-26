import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8">Five Realms</h1>
        <p className="text-xl mb-8 text-gray-400">An Irish Mythology Card Game</p>
        <Link
          href="/battle"
          className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded text-2xl font-bold inline-block"
        >
          Start Battle
        </Link>
      </div>
    </main>
  );
}