
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  FileText,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./App.css";

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 13500 },
  { month: "Apr", revenue: 19000 },
  { month: "May", revenue: 17500 },
  { month: "Jun", revenue: 23000 },
  { month: "Jul", revenue: 26000 },
  { month: "Aug", revenue: 22000 },
  { month: "Sep", revenue: 29000 },
  { month: "Oct", revenue: 34000 },
  { month: "Nov", revenue: 31000 },
  { month: "Dec", revenue: 39000 },
];

const subscriptions = [
  { name: "Olivia Martin", email: "olivia@example.com", plan: "Premium", amount: "₹2,499", date: "28 Oct 2026", status: "Active", initials: "OM" },
  { name: "Jackson Lee", email: "jackson@example.com", plan: "Standard", amount: "₹1,499", date: "27 Oct 2026", status: "Active", initials: "JL" },
  { name: "Isabella Chen", email: "isabella@example.com", plan: "Basic", amount: "₹499", date: "26 Oct 2026", status: "Pending", initials: "IC" },
  { name: "William Kim", email: "william@example.com", plan: "Premium", amount: "₹2,499", date: "25 Oct 2026", status: "Active", initials: "WK" },
  { name: "Sophia Patel", email: "sophia@example.com", plan: "Standard", amount: "₹1,499", date: "24 Oct 2026", status: "Cancelled", initials: "SP" },
];

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", icon: Users },
  { name: "Subscriptions", icon: CreditCard },
  { name: "Plans", icon: Package },
  { name: "Billing", icon: FileText },
  { name: "Reports", icon: ChartNoAxesCombined },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: "Total Revenue",
      value: "₹4,52,890",
      change: "+12.8%",
      positive: true,
      icon: CreditCard,
      color: "purple",
    },
    {
      title: "Active Subscriptions",
      value: "1,248",
      change: "+8.2%",
      positive: true,
      icon: Package,
      color: "blue",
    },
    {
      title: "Total Customers",
      value: "2,845",
      change: "+15.3%",
      positive: true,
      icon: Users,
      color: "green",
    },
    {
      title: "Pending Payments",
      value: "₹18,450",
      change: "-3.4%",
      positive: false,
      icon: FileText,
      color: "orange",
    },
  ];

  return (
    <div className="app-container">
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <CreditCard size={23} />
          </div>
          <span>Subscript<span className="brand-highlight">ly</span></span>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">S</div>
          <div>
            <strong>Startup Workspace</strong>
            <small>Admin Account</small>
          </div>
          <MoreHorizontal size={19} />
        </div>

        <p className="nav-heading">MENU</p>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <p className="nav-heading">PREFERENCES</p>
          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">EA</div>
            <div className="profile-info">
              <strong>Admin User</strong>
              <small>admin@example.com</small>
            </div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h2>{activePage}</h2>
              <p>Welcome back! Here's what's happening today.</p>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={18} />
              <input placeholder="Search anything..." />
              <span>⌘ K</span>
            </div>
            <button className="notification-button">
              <Bell size={20} />
              <i />
            </button>
            <div className="top-profile">EA</div>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <>
            <section className="welcome-row">
              <div>
                <h1>Dashboard Overview</h1>
                <p>Monitor your business performance and subscriptions.</p>
              </div>
              <button className="date-button">
                <CalendarDays size={17} />
                Last 12 months
              </button>
            </section>

            <section className="stats-grid">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div className="stat-card" key={stat.title}>
                    <div className="stat-top">
                      <div className={`stat-icon ${stat.color}`}>
                        <Icon size={21} />
                      </div>
                      <button className="more-button">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                    <p className="stat-title">{stat.title}</p>
                    <h2>{stat.value}</h2>
                    <div className="stat-footer">
                      <span className={stat.positive ? "positive" : "negative"}>
                        {stat.positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                        {stat.change}
                      </span>
                      <small>from last month</small>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="dashboard-grid">
              <div className="panel revenue-panel">
                <div className="panel-header">
                  <div>
                    <h3>Revenue Overview</h3>
                    <p>Your revenue performance throughout the year</p>
                  </div>
                  <button className="filter-button">2026</button>
                </div>

                <div className="revenue-total">
                  <h2>₹4,52,890</h2>
                  <span className="positive">
                    <ArrowUpRight size={16} /> 12.8%
                  </span>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7357e8" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#7357e8" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf0f5" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9299a8", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9299a8", fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#7357e8" strokeWidth={3} fill="url(#revenueGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel subscription-panel">
                <div className="panel-header">
                  <div>
                    <h3>Subscription Overview</h3>
                    <p>Current subscription status</p>
                  </div>
                  <MoreHorizontal size={21} />
                </div>

                <div className="donut-container">
                  <div className="donut">
                    <div className="donut-inner">
                      <h2>1,248</h2>
                      <span>Total</span>
                    </div>
                  </div>
                </div>

                <div className="legend">
                  <div><span className="dot active-dot" /> Active <strong>856</strong></div>
                  <div><span className="dot pending-dot" /> Pending <strong>245</strong></div>
                  <div><span className="dot cancelled-dot" /> Cancelled <strong>147</strong></div>
                </div>
              </div>
            </section>

            <section className="panel table-panel">
              <div className="panel-header table-heading">
                <div>
                  <h3>Recent Subscriptions</h3>
                  <p>Latest customer subscription activity</p>
                </div>
                <button className="view-all-button" onClick={() => setActivePage("Subscriptions")}>
                  View all <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>PLAN</th>
                      <th>AMOUNT</th>
                      <th>START DATE</th>
                      <th>STATUS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.email}>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">{sub.initials}</div>
                            <div>
                              <strong>{sub.name}</strong>
                              <small>{sub.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{sub.plan}</td>
                        <td className="amount-cell">{sub.amount}</td>
                        <td>{sub.date}</td>
                        <td>
                          <span className={`status ${sub.status.toLowerCase()}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td><button className="more-button"><MoreHorizontal size={19} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="placeholder-page">
            <div className="placeholder-icon"><Plus size={28} /></div>
            <h2>{activePage} Management</h2>
            <p>The {activePage.toLowerCase()} section is ready for development.</p>
            <button className="primary-button" onClick={() => setActivePage("Dashboard")}>
              Back to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
