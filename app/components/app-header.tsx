import NavigationTabs from './navigation-tabs';

export default function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Cricket Auction Dashboard</h1>
        <NavigationTabs />
      </div>
    </header>
  );
}
