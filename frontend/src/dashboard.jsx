import React from 'react';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const userName = localStorage.getItem('username') || 'Guest';

  return (
    <div className="w-full min-h-screen font-body bg-stone">
      {/* Left: shared sidebar navbar (20%, fixed to viewport) */}
      <Sidebar />

      {/* Right: main content (offset by sidebar width, scrolls independently) */}
      <main className="w-4/5 ml-[20%] min-h-screen flex flex-col items-center justify-center px-[6vw] text-center">
        <span className="font-display text-2xl font-bold text-ink mb-3">Property Zone</span>
        <span className="uppercase text-xs tracking-widest text-gold font-semibold mb-4">Dashboard</span>
        <h1 className="font-display font-semibold text-4xl text-ink mb-4 max-w-xl">
          Welcome back, {userName}.
        </h1>
        <p className="text-inksoft/60 max-w-md mb-8 leading-relaxed">
          Ready to list your property? A few details is all it takes to get your building in front of
          buyers and tenants looking right now.
        </p>
        <a
          href="/dashboard/sell"
          className="bg-gold text-ink font-semibold rounded-full px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
        >
          Sell Your Property
        </a>
      </main>
    </div>
  );
}
