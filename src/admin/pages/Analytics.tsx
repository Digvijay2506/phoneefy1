import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { platformTrafficData } from '../data/analytics';
import { mockPhones } from '../data/phones';
import { Trophy, TrendingUp, Eye } from 'lucide-react';
import { useShops } from '../contexts/ShopContext';

export default function Analytics() {
  const [period, setPeriod] = useState('Monthly');
  const { shops } = useShops();

  // Real shops, ranked; sales/revenue are illustrative until real order data exists
  const topShops = [...shops].slice(0, 5).map((shop, i) => ({
    ...shop,
    sales: 1500 - (i * 200),
    revenue: 45000 - (i * 5000)
  }));

  const mostSoldPhones = [...mockPhones].filter(p => p.status === 'Sold').slice(0, 5).map((phone, i) => ({
    ...phone,
    soldCount: 450 - (i * 50)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="flex bg-secondary/50 rounded-md p-1 border border-border">
          {['Daily', 'Weekly', 'Monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                period === p 
                  ? 'bg-card text-foreground shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Platform Traffic ({period})
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformTrafficData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="value1" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTraffic)" name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Shops */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performing Shops
          </h3>
          <div className="space-y-4">
            {topShops.map((shop, i) => (
              <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">{shop.sales} Sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-primary font-medium">${shop.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed/Sold Phones */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Most Sold Models
          </h3>
          <div className="space-y-4">
            {mostSoldPhones.map((phone, i) => (
              <div key={phone.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{phone.model}</p>
                    <p className="text-xs text-muted-foreground">{phone.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-foreground">{phone.soldCount} Units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
