import { Package, Tags, Star, RefreshCw } from "lucide-react";
import { useGetProductStats, getGetProductStatsQueryKey } from "@/api/hooks";

export default function StatsOverview() {
  const { data: stats } = useGetProductStats({
    query: { queryKey: getGetProductStatsQueryKey() }
  });

  const cards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Categories", value: stats?.totalCategories || 0, icon: Tags, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Featured", value: stats?.featuredCount || 0, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "In Stock", value: stats?.inStockCount || 0, icon: RefreshCw, color: "text-emerald-400", bg: "bg-emerald-400/10" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Real-time summary of your store's inventory and categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-card border border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:border-white/10 transition-colors group">
            <div className={`p-4 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
