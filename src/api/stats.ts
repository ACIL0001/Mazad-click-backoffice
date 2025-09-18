import { requests } from './utils';

export interface UserStats {
  total: number;
  byType: {
    admin: number;
    professional: number;
    client: number;
    reseller: number;
  };
}

export interface AuctionStats {
  total: number;
  byStatus: {
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  byCategory: {
    name: string;
    count: number;
    _id: string;
  }[];
  dailyAverage: number;
  weeklyGrowth: number;
}

export interface CategoryStats {
  name: string;
  count: number;
  _id: string;
}

export interface PlatformOverview {
  users: UserStats;
  auctions: AuctionStats;
  lastUpdated: Date;
}

export interface DashboardWidget {
  title: string;
  value: number;
  icon: string;
}

export interface DashboardStats {
  widgets: DashboardWidget[];
}

export const StatsAPI = {
  getUserStats: (): Promise<UserStats> => requests.get('stats/users'),
  getAuctionStats: (): Promise<AuctionStats> => requests.get('stats/auctions'),
  getCategoryStats: (): Promise<CategoryStats[]> => requests.get('stats/categories'),
  getSummary: (): Promise<any> => requests.get('stats/summary'),
  getDashboardStats: (): Promise<DashboardStats> => requests.get('stats/dashboard'),
  getUserTimeSeries: (): Promise<{ labels: string[]; data: number[] }> => requests.get('stats/users/timeseries'),
  getAuctionTimeSeries: (): Promise<{ labels: string[]; data: number[] }> => requests.get('stats/auctions/timeseries'),
  getAuctionStatusTimeSeries: (): Promise<{ labels: string[]; series: { name: string; data: number[] }[] }> => requests.get('stats/auctions/status-timeseries'),
  getAuctionCategoryTimeSeries: (): Promise<{ labels: string[]; series: { name: string; data: number[] }[] }> => requests.get('stats/auctions/category-timeseries'),
};




// import React, { useState, useEffect } from 'react';
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   Users, 
//   Gavel, 
//   ShoppingBag, 
//   Clock, 
//   CheckCircle, 
//   AlertCircle,
//   XCircle,
//   Target,
//   Award,
//   Activity,
//   BarChart3,
//   PieChart,
//   Calendar,
//   DollarSign,
//   Zap,
//   Eye,
//   UserCheck,
//   Building,
//   Crown,
//   Star,
//   ArrowUpRight,
//   ArrowDownRight,
//   Briefcase,
//   RefreshCw,
//   Loader2
// } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle, loading }) => {
//   const cardStyle = {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     padding: '24px',
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
//     border: '1px solid #e5e7eb',
//     transition: 'box-shadow 0.3s ease',
//     marginBottom: '16px'
//   };

//   const iconContainerStyle = {
//     padding: '8px',
//     borderRadius: '50%',
//     backgroundColor: `${color}15`,
//     marginRight: '16px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   };

//   const trendStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     padding: '4px 10px',
//     borderRadius: '20px',
//     fontSize: '12px',
//     fontWeight: '500',
//     backgroundColor: trend === 'up' ? '#dcfce7' : '#fef2f2',
//     color: trend === 'up' ? '#166534' : '#991b1b'
//   };

//   return (
//     <div style={cardStyle}>
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           {loading ? (
//             <Loader2 style={{ height: '24px', width: '24px', color: '#9ca3af', animation: 'spin 1s linear infinite', marginRight: '12px' }} />
//           ) : (
//             <div style={iconContainerStyle}>
//               <Icon style={{ height: '24px', width: '24px', color }} />
//             </div>
//           )}
//           <div>
//             <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>{title}</h3>
//             {loading ? (
//               <div style={{ height: '32px', width: '96px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginTop: '4px', animation: 'pulse 2s infinite' }}></div>
//             ) : (
//               <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '4px 0 0 0' }}>{value}</p>
//             )}
//             {subtitle && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>{subtitle}</p>}
//           </div>
//         </div>
//         {trend && trendValue && (
//           <div style={trendStyle}>
//             {trend === 'up' ? <ArrowUpRight style={{ width: '12px', height: '12px', marginRight: '4px' }} /> : <ArrowDownRight style={{ width: '12px', height: '12px', marginRight: '4px' }} />}
//             {trendValue}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const SectionTitle = ({ title, description }) => (
//   <div style={{ marginBottom: '24px' }}>
//     <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{title}</h2>
//     <p style={{ color: '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>{description}</p>
//   </div>
// );

// const ChartCard = ({ title, data, dataKey, color, label }) => (
//   <div style={{ 
//     backgroundColor: 'white', 
//     borderRadius: '12px', 
//     padding: '24px', 
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
//     border: '1px solid #e5e7eb', 
//     height: '384px' 
//   }}>
//     <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>{title}</h3>
//     <ResponsiveContainer width="100%" height="80%">
//       <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis />
//         <Tooltip />
//         <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} />
//       </LineChart>
//     </ResponsiveContainer>
//   </div>
// );

// const Dashboard = () => {
//   const [timeRange, setTimeRange] = useState('week');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Mock data for demonstration
//   const [dashboardData, setDashboardData] = useState({
//     userStats: {
//       total: 12847,
//       byType: {
//         admin: 12,
//         professional: 3524,
//         client: 8642,
//         reseller: 669
//       }
//     },
//     auctionStats: {
//       total: 1247,
//       byStatus: {
//         active: 89,
//         completed: 1043,
//         pending: 76,
//         cancelled: 39
//       },
//       dailyAverage: 24,
//       weeklyGrowth: 8.7
//     },
//     categoryStats: [
//       { name: 'Électronique', count: 324 },
//       { name: 'Mobilier', count: 198 },
//       { name: 'Véhicules', count: 156 },
//       { name: 'Art', count: 142 },
//       { name: 'Mode', count: 98 }
//     ],
//     identityStats: {
//       pending: 23,
//       pendingProfessionals: 15,
//       pendingResellers: 8,
//       verified: 3421
//     },
//     subscriptionStats: {
//       total: 2450000,
//       subscriptions: 850000,
//       commissions: 1600000,
//       growth: 12.3
//     },
//     offerStats: {
//       total: 5876,
//       pending: 234,
//       accepted: 4821,
//       rejected: 821,
//       acceptanceRate: 82.1
//     },
//     trendData: [
//       { name: 'Jan', users: 400, offers: 240 },
//       { name: 'Fév', users: 500, offers: 300 },
//       { name: 'Mar', users: 600, offers: 350 },
//       { name: 'Avr', users: 750, offers: 420 },
//       { name: 'Mai', users: 850, offers: 480 },
//       { name: 'Jun', users: 920, offers: 520 }
//     ],
//     recentActivities: [
//       { type: 'auction', message: '89 enchères actives en cours', time: 'Maintenant' },
//       { type: 'user', message: '12847 utilisateurs au total', time: '5 min' },
//       { type: 'offer', message: '234 offres en attente', time: '12 min' },
//       { type: 'identity', message: '23 vérifications en attente', time: '23 min' },
//       { type: 'subscription', message: 'Revenus d\'abonnements mis à jour', time: '1 h' }
//     ]
//   });

//   const handleRefresh = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//     }, 1000);
//   };

//   const containerStyle = {
//     minHeight: '100vh',
//     backgroundColor: '#f9fafb',
//     padding: '32px',
//     color: '#374151',
//     fontFamily: 'system-ui, -apple-system, sans-serif'
//   };

//   const gridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//     gap: '24px',
//     marginBottom: '32px'
//   };

//   const chartGridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
//     gap: '24px',
//     marginBottom: '32px'
//   };

//   const systemStatusGridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//     gap: '16px',
//     marginBottom: '32px'
//   };

//   const statusItemStyle = (bgColor, textColor, darkTextColor) => ({
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: '12px',
//     backgroundColor: bgColor,
//     borderRadius: '8px'
//   });

//   const activityListStyle = {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
//     border: '1px solid #e5e7eb',
//     overflow: 'hidden'
//   };

//   if (loading && dashboardData.userStats?.total === 0) {
//     return (
//       <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <Loader2 style={{ height: '40px', width: '40px', color: '#9ca3af', animation: 'spin 1s linear infinite' }} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <div style={{ textAlign: 'center' }}>
//           <XCircle style={{ height: '48px', width: '48px', color: '#ef4444', margin: '0 auto 16px' }} />
//           <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Erreur de chargement</h2>
//           <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
//           <button
//             onClick={handleRefresh}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#2563eb',
//               color: 'white',
//               borderRadius: '8px',
//               border: 'none',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500',
//               transition: 'background-color 0.2s'
//             }}
//             onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
//             onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
//           >
//             Réessayer
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={containerStyle}>
//       {/* Header */}
//       <div style={{ marginBottom: '32px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
//           <div>
//             <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
//               Tableau de Bord Administrateur
//             </h1>
//             <p style={{ color: '#6b7280', margin: 0 }}>
//               Vue d'ensemble de la plateforme d'enchères • Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
//             </p>
//           </div>
//           <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               style={{
//                 padding: '8px 16px',
//                 backgroundColor: '#f3f4f6',
//                 color: '#374151',
//                 borderRadius: '8px',
//                 border: 'none',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 transition: 'background-color 0.2s',
//                 opacity: loading ? 0.6 : 1
//               }}
//             >
//               <RefreshCw style={{ height: '16px', width: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
//               Actualiser
//             </button>
//             {['week', 'month', 'quarter'].map((range) => (
//               <button
//                 key={range}
//                 onClick={() => setTimeRange(range)}
//                 style={{
//                   padding: '8px 16px',
//                   borderRadius: '8px',
//                   fontSize: '14px',
//                   fontWeight: '500',
//                   border: 'none',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   backgroundColor: timeRange === range ? '#2563eb' : 'white',
//                   color: timeRange === range ? 'white' : '#374151',
//                   boxShadow: timeRange === range ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
//                 }}
//               >
//                 {range === 'week' ? 'Cette semaine' : range === 'month' ? 'Ce mois' : 'Ce trimestre'}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <main style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
//         {/* Key Metrics Row */}
//         <section>
//           <div style={gridStyle}>
//             <StatCard
//               title="Utilisateurs Totaux"
//               value={dashboardData.userStats?.total?.toLocaleString() || '0'}
//               icon={Users}
//               color="#2563eb"
//               trend="up"
//               trendValue="12.5%"
//               subtitle={`${dashboardData.userStats?.byType?.professional || 0} professionnels`}
//               loading={loading}
//             />
//             <StatCard
//               title="Enchères Actives"
//               value={dashboardData.auctionStats?.byStatus?.active?.toLocaleString() || '0'}
//               icon={Gavel}
//               color="#059669"
//               trend="up"
//               trendValue="8.7%"
//               subtitle={`${dashboardData.auctionStats?.dailyAverage || 0}/jour en moyenne`}
//               loading={loading}
//             />
//             <StatCard
//               title="Offres en Attente"
//               value={dashboardData.offerStats?.pending?.toLocaleString() || '0'}
//               icon={Clock}
//               color="#d97706"
//               trend="down"
//               trendValue="5.2%"
//               subtitle={`${dashboardData.offerStats?.acceptanceRate?.toFixed(1) || 0}% acceptées`}
//               loading={loading}
//             />
//             <StatCard
//               title="Vérifications"
//               value={dashboardData.identityStats?.pending?.toLocaleString() || '0'}
//               icon={UserCheck}
//               color="#7c3aed"
//               trend="up"
//               trendValue="23.1%"
//               subtitle="En attente d'approbation"
//               loading={loading}
//             />
//           </div>
//         </section>

//         {/* Statistics Overview */}
//         <section>
//           <SectionTitle 
//             title="Aperçu des Statistiques" 
//             description="Répartition détaillée des utilisateurs et catégories actives." 
//           />
//           <div style={gridStyle}>
//             {loading ? (
//               <>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
//                   <div style={{ height: '24px', width: '24px', backgroundColor: '#c7d2fe', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '20px', backgroundColor: '#c7d2fe', borderRadius: '4px', width: '48px', margin: '0 auto 4px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '14px', backgroundColor: '#c7d2fe', borderRadius: '4px', width: '80px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
//                   <div style={{ height: '24px', width: '24px', backgroundColor: '#bbf7d0', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '20px', backgroundColor: '#bbf7d0', borderRadius: '4px', width: '48px', margin: '0 auto 4px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '14px', backgroundColor: '#bbf7d0', borderRadius: '4px', width: '80px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fed7aa', borderRadius: '8px' }}>
//                   <div style={{ height: '24px', width: '24px', backgroundColor: '#fde68a', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '20px', backgroundColor: '#fde68a', borderRadius: '4px', width: '48px', margin: '0 auto 4px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '14px', backgroundColor: '#fde68a', borderRadius: '4px', width: '80px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
//                   <div style={{ height: '24px', width: '24px', backgroundColor: '#fde68a', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '20px', backgroundColor: '#fde68a', borderRadius: '4px', width: '48px', margin: '0 auto 4px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '14px', backgroundColor: '#fde68a', borderRadius: '4px', width: '80px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
//                   <Users style={{ height: '24px', width: '24px', color: '#4338ca', margin: '0 auto 8px' }} />
//                   <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{dashboardData.userStats?.byType?.client || 0}</p>
//                   <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Clients</p>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
//                   <Gavel style={{ height: '24px', width: '24px', color: '#059669', margin: '0 auto 8px' }} />
//                   <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{dashboardData.offerStats?.total || 0}</p>
//                   <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Offres/enchères</p>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fed7aa', borderRadius: '8px' }}>
//                   <Building style={{ height: '24px', width: '24px', color: '#ea580c', margin: '0 auto 8px' }} />
//                   <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{dashboardData.userStats?.byType?.reseller || 0}</p>
//                   <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Revendeurs</p>
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
//                   <Star style={{ height: '24px', width: '24px', color: '#d97706', margin: '0 auto 8px' }} />
//                   <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{dashboardData.userStats?.byType?.professional || 0}</p>
//                   <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Professionnels</p>
//                 </div>
//               </>
//             )}
//           </div>
//         </section>

//         {/* User Distribution and Categories */}
//         <section>
//           <div style={chartGridStyle}>
//             <div style={{ 
//               backgroundColor: 'white', 
//               borderRadius: '12px', 
//               padding: '24px', 
//               boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
//               border: '1px solid #e5e7eb'
//             }}>
//               <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Répartition des Utilisateurs</h3>
//               {loading ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                   {[...Array(4)].map((_, index) => (
//                     <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
//                         <div style={{ width: '12px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '50%', marginRight: '12px', animation: 'pulse 2s infinite' }}></div>
//                         <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '96px', animation: 'pulse 2s infinite' }}></div>
//                       </div>
//                       <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '64px', animation: 'pulse 2s infinite' }}></div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                   {dashboardData.userStats && Object.entries(dashboardData.userStats.byType).map(([type, count]) => {
//                     const percentage = dashboardData.userStats.total > 0 ? (count / dashboardData.userStats.total) * 100 : 0;
//                     const colors = {
//                       admin: '#ef4444',
//                       professional: '#2563eb',
//                       client: '#059669',
//                       reseller: '#7c3aed'
//                     };
//                     const labels = {
//                       admin: 'Administrateurs',
//                       professional: 'Professionnels',
//                       client: 'Clients',
//                       reseller: 'Revendeurs'
//                     };
                    
//                     return (
//                       <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
//                           <div style={{ width: '12px', height: '12px', backgroundColor: colors[type], borderRadius: '50%', marginRight: '12px' }}></div>
//                           <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{labels[type]}</span>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center' }}>
//                           <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginRight: '8px' }}>{count?.toLocaleString() || 0}</span>
//                           <span style={{ fontSize: '12px', color: '#6b7280' }}>({percentage.toFixed(1)}%)</span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             <div style={{ 
//               backgroundColor: 'white', 
//               borderRadius: '12px', 
//               padding: '24px', 
//               boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
//               border: '1px solid #e5e7eb'
//             }}>
//               <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Performance par Catégorie</h3>
//               {loading ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                   {[...Array(5)].map((_, index) => (
//                     <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '128px', marginBottom: '8px', animation: 'pulse 2s infinite' }}></div>
//                         <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '64px', animation: 'pulse 2s infinite' }}></div>
//                       </div>
//                       <div style={{ height: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '48px', animation: 'pulse 2s infinite' }}></div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                   {dashboardData.categoryStats.slice(0, 5).map((category, index) => (
//                     <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
//                           <span style={{ fontWeight: '500', color: '#111827' }}>{category.name}</span>
//                           <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{category.count}</span>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center' }}>
//                           <Activity style={{ height: '16px', width: '16px', color: '#2563eb', marginRight: '4px' }} />
//                           <span style={{ fontSize: '14px', color: '#2563eb' }}>Catégorie active</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {dashboardData.categoryStats.length === 0 && !loading && (
//                     <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
//                       <PieChart style={{ height: '48px', width: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
//                       <p>Aucune catégorie trouvée</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Revenue and Performance */}
//         <section>
//           <SectionTitle 
//             title="Revenus et Performance" 
//             description="Aperçu financier et métriques clés de la plateforme." 
//           />
//           <div style={chartGridStyle}>
//             <div style={{ 
//               background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
//               borderRadius: '12px', 
//               padding: '24px', 
//               color: 'white' 
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
//                 <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Revenus Totaux</h3>
//                 <DollarSign style={{ height: '24px', width: '24px' }} />
//               </div>
//               {loading ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                   <div style={{ height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '128px', animation: 'pulse 2s infinite' }}></div>
//                   <div style={{ height: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '96px', animation: 'pulse 2s infinite' }}></div>
//                 </div>
//               ) : (
//                 <>
//                   <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
//                     {dashboardData.subscriptionStats?.total ? `${(dashboardData.subscriptionStats.total / 1000000).toFixed(1)}M €` : '0 €'}
//                   </p>
//                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
//                     <ArrowUpRight style={{ height: '16px', width: '16px', marginRight: '4px' }} />
//                     <span style={{ fontSize: '14px' }}>+{dashboardData.subscriptionStats?.growth || 0}% ce mois</span>
//                   </div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
//                     <div>
//                       <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 4px 0' }}>Abonnements</p>
//                       <p style={{ fontWeight: '600', margin: 0 }}>{dashboardData.subscriptionStats?.subscriptions ? `${(dashboardData.subscriptionStats.subscriptions / 1000).toFixed(0)}k €` : '0 €'}</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 4px 0' }}>Commissions</p>
//                       <p style={{ fontWeight: '600', margin: 0 }}>{dashboardData.subscriptionStats?.commissions ? `${(dashboardData.subscriptionStats.commissions / 1000000).toFixed(1)}M €` : '0 €'}</p>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
            
//             <div style={{ 
//               backgroundColor: 'white', 
//               borderRadius: '12px', 
//               padding: '24px', 
//               boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
//               border: '1px solid #e5e7eb'
//             }}>
//               <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Métriques Clés</h3>
//               {loading ? (
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
//                   {[...Array(4)].map((_, index) => (
//                     <div key={index} style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
//                       <div style={{ height: '24px', width: '24px', backgroundColor: '#e5e7eb', borderRadius: '4px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                       <div style={{ height: '32px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '48px', margin: '0 auto 8px', animation: 'pulse 2s infinite' }}></div>
//                       <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '80px', margin: '0 auto', animation: 'pulse 2s infinite' }}></div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
//                   <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
//                     <Activity style={{ height: '24px', width: '24px', color: '#2563eb', margin: '0 auto 8px' }} />
//                     <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>{dashboardData.userStats?.byType?.client || 0}</p>
//                     <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Clients actifs</p>
//                   </div>
//                   <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
//                     <Target style={{ height: '24px', width: '24px', color: '#059669', margin: '0 auto 8px' }} />
//                     <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
//                       {dashboardData.auctionStats?.total > 0 
//                         ? Math.round((dashboardData.auctionStats.byStatus.completed / dashboardData.auctionStats.total) * 100)
//                         : 0}%
//                     </p>
//                     <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Taux de réussite</p>
//                   </div>
//                   <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
//                     <Award style={{ height: '24px', width: '24px', color: '#7c3aed', margin: '0 auto 8px' }} />
//                     <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
//                       {dashboardData.auctionStats?.total > 0 && dashboardData.offerStats?.total > 0
//                         ? Math.round(dashboardData.offerStats.total / dashboardData.auctionStats.total)
//                         : 0}
//                     </p>
//                     <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Offres par enchère</p>
//                   </div>
//                   <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
//                     <DollarSign style={{ height: '24px', width: '24px', color: '#d97706', margin: '0 auto 8px' }} />
//                     <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
//                       {dashboardData.subscriptionStats?.total ? `${(dashboardData.subscriptionStats.total / 1000).toFixed(0)}k` : '0'}
//                     </p>
//                     <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Revenus (€)</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Trends Charts */}
//         <section>
//           <SectionTitle 
//             title="Tendances des Utilisateurs & Offres" 
//             description="Évolution des données sur les derniers mois." 
//           />
//           <div style={chartGridStyle}>
//             <ChartCard 
//               title="Utilisateurs" 
//               data={dashboardData.trendData} 
//               dataKey="users" 
//               color="#4F46E5" 
//             />
//             <ChartCard 
//               title="Offres" 
//               data={dashboardData.trendData} 
//               dataKey="offers" 
//               color="#8B5CF6" 
//             />
//           </div>
//         </section>
        
//         {/* System Status */}
//         <section>
//           <SectionTitle 
//             title="État du Système" 
//             description="Informations vitales sur la santé de la plateforme." 
//           />
//           <div style={systemStatusGridStyle}>
//             <div style={statusItemStyle('#dcfce7', '#166534', '#14532d')}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <CheckCircle style={{ height: '16px', width: '16px', color: '#059669', marginRight: '8px' }} />
//                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#166534' }}>Système</span>
//               </div>
//               <span style={{ color: '#14532d', fontWeight: '600' }}>Opérationnel</span>
//             </div>
//             <div style={statusItemStyle('#dbeafe', '#1e40af', '#1e3a8a')}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <Activity style={{ height: '16px', width: '16px', color: '#2563eb', marginRight: '8px' }} />
//                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>Activité</span>
//               </div>
//               <span style={{ color: '#1e3a8a', fontWeight: '600' }}>Élevée</span>
//             </div>
//             <div style={statusItemStyle('#fef3c7', '#d97706', '#92400e')}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <AlertCircle style={{ height: '16px', width: '16px', color: '#d97706', marginRight: '8px' }} />
//                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>Alertes</span>
//               </div>
//               <span style={{ color: '#92400e', fontWeight: '600' }}>{dashboardData.identityStats?.pending || 0}</span>
//             </div>
//             <div style={statusItemStyle('#fef2f2', '#dc2626', '#991b1b')}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <XCircle style={{ height: '16px', width: '16px', color: '#dc2626', marginRight: '8px' }} />
//                 <span style={{ fontSize: '14px', fontWeight: '500', color: '#dc2626' }}>Erreurs</span>
//               </div>
//               <span style={{ color: '#991b1b', fontWeight: '600' }}>0</span>
//             </div>
//           </div>
//         </section>
        
//         {/* Recent Activity */}
//         <section>
//           <SectionTitle 
//             title="Activité Récente" 
//             description="Liste des événements les plus récents sur la plateforme." 
//           />
//           <div style={activityListStyle}>
//             <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
//               {dashboardData.recentActivities.map((activity, index) => (
//                 <li 
//                   key={index} 
//                   style={{ 
//                     padding: '16px', 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     justifyContent: 'space-between',
//                     borderBottom: index < dashboardData.recentActivities.length - 1 ? '1px solid #e5e7eb' : 'none'
//                   }}
//                 >
//                   <div style={{ display: 'flex', alignItems: 'center' }}>
//                     <span style={{ 
//                       height: '8px', 
//                       width: '8px', 
//                       borderRadius: '50%', 
//                       backgroundColor: '#3b82f6', 
//                       marginRight: '12px' 
//                     }}></span>
//                     <span style={{ fontSize: '14px', color: '#4b5563' }}>{activity.message}</span>
//                   </div>
//                   <span style={{ fontSize: '12px', color: '#9ca3af' }}>{activity.time}</span>
//                 </li>
//               ))}
//               {dashboardData.recentActivities.length === 0 && (
//                 <li style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
//                   <Clock style={{ height: '24px', width: '24px', margin: '0 auto 8px', opacity: 0.5 }} />
//                   <p>Aucune activité récente</p>
//                 </li>
//               )}
//             </ul>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;