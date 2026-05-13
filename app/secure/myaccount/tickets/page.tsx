"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import TicketCard from '../../../components/TicketCard';
import { Ticket } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTicketAlt, 
    faUserCircle, 
    faCog, 
    faShieldAlt, 
    faQuestionCircle,
    faSignOutAlt,
    faBars,
    faTimes,
    faLock,
    faChevronLeft,
    faExchangeAlt,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function MyTicketsPage() {
    const router = useRouter();
    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setLoading,
        setUsers,
        setTickets
    } = useUser();

    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const adminUsername = sessionStorage.getItem("loggedInAdmin");
        const adminData = sessionStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setIsSessionValid(true);
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, fetchAllTickets]);

    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(allTickets)) {
            const filtered = allTickets.filter((t) => {
                // 1. Must belong to the logged-in admin
                const matchesAdmin = t.admin === loggedInAdmin;
                
                // 2. Must not be deleted
                const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
                
                // 3. Platform must include "uefa" (comma separated)
                const platformList = t.platform?.toLowerCase().split(',').map(p => p.trim()) || [];
                const matchesPlatform = platformList.includes("uefa");

                if (!matchesAdmin || !isNotDeleted || !matchesPlatform) return false;

                // 4. Filter by Tab (Upcoming vs Past)
                // eventStatus: PAST, ACTIVE, WAITING
                let matchesTab = false;
                if (activeTab === 'upcoming') {
                    matchesTab = t.eventStatus === 'ACTIVE' || t.eventStatus === 'WAITING';
                } else {
                    matchesTab = t.eventStatus === 'PAST';
                }

                if (!matchesTab) return false;

                // 5. Search Filter
                if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    const matchesSearch = 
                        t.eventName?.toLowerCase().includes(term) ||
                        t.ticketId?.toLowerCase().includes(term) ||
                        t.venue?.toLowerCase().includes(term) ||
                        t.location?.toLowerCase().includes(term) ||
                        t.seatNumbers?.toLowerCase().includes(term);
                    
                    if (!matchesSearch) return false;
                }

                return true;
            });
            setFilteredTickets(filtered);
        }
    }, [allTickets, loggedInAdmin, isSessionValid, activeTab, searchTerm]);

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInAdmin");
        sessionStorage.removeItem("adminData");
        setAdmin(null);
        setUsers([]);
        setTickets([]);
        router.push('/login');
    };

    const sidebarItems = [
        { icon: faTicketAlt, label: 'My Purchases', active: true, href: '/secure/myaccount/tickets' },
        { icon: faExchangeAlt, label: 'Transfers', active: false, href: '/secure/myaccount/transfers' },
        { icon: faUserCircle, label: 'Personal Details', active: false, href: '#' },
        { icon: faCog, label: 'Account Settings', active: false, href: '#' },
        { icon: faShieldAlt, label: 'Privacy', active: false, href: '#' },
        { icon: faQuestionCircle, label: 'Help', active: false, href: '#' },
        { icon: faSignOutAlt, label: 'Sign Out', active: false, action: handleLogout },
    ];

    if (isSessionValid === null) return null;

    return (
        <div className="min-h-screen bg-[#001C4B] flex flex-col font-sans">

            {/* ── Header: nav hamburger on left, title centered ── */}
            <header className="bg-[#001C4B] text-white border-b border-white/10 px-4 py-3 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white/80 hover:opacity-70 transition-opacity p-1">
                        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} className="text-xl" />
                    </button>
                    <h1 className="text-lg font-black text-white tracking-tight">My Purchases</h1>
                    <button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition-colors p-1">
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row py-8 px-4 gap-8">

                {/* ── Sidebar ── */}
                <aside className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:bg-transparent lg:inset-auto lg:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 lg:p-0">
                        <div className="lg:hidden flex justify-end mb-8">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-2xl text-[#1f262d]">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <nav className="space-y-1">
                            {sidebarItems.map((item, i) => (
                                item.href && item.href !== '#' ? (
                                    <Link key={i} href={item.href}
                                        className={`w-full text-left px-4 py-3 rounded-[12px] flex items-center space-x-3 transition-all ${item.active ? 'bg-[#001C4B] text-white font-black shadow-lg shadow-[#001C4B]/20' : 'text-[#1f262d] hover:bg-white hover:shadow-sm font-bold'}`}>
                                        <FontAwesomeIcon icon={item.icon} className="w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    <button key={i} onClick={(item as any).action}
                                        className={`w-full text-left px-4 py-3 rounded-[12px] flex items-center space-x-3 transition-all ${(item as any).label === 'Sign Out' ? 'text-red-600 hover:bg-red-50' : (item.active ? 'bg-[#001C4B] text-white font-black shadow-lg shadow-[#001C4B]/20' : 'text-[#1f262d] hover:bg-white hover:shadow-sm font-bold')}`}>
                                        <FontAwesomeIcon icon={item.icon} className="w-5" />
                                        <span>{item.label}</span>
                                    </button>
                                )
                            ))}
                        </nav>
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <Link href="/secure/myaccount/manage" className="flex items-center space-x-3 text-gray-400 hover:text-[#001C4B] transition-colors text-[10px] font-black uppercase tracking-widest">
                                <FontAwesomeIcon icon={faLock} className="w-4" />
                                <span>Admin Panel</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 pb-24 lg:pb-0">

                    {/* Search */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by event, ticket ID, or venue..."
                            className="w-full p-4 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 font-bold text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/20 mb-6 overflow-x-auto">
                        {(['upcoming', 'past'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-4">
                        {activeTab === 'upcoming' ? (
                            filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket, i) => (
                                    <TicketCard key={i} ticket={ticket} />
                                ))
                            ) : (
                                <div className="bg-white rounded-[20px] p-16 text-center shadow-sm border border-gray-100">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <FontAwesomeIcon icon={faTicketAlt} className="text-2xl text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#1f262d] mb-2">No upcoming purchases</h3>
                                    <p className="text-gray-400 font-bold mb-8 text-sm">Find your next live experience today!</p>
                                    <button onClick={() => router.push('/')}
                                        className="bg-[#001C4B] text-white px-10 py-4 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform shadow-xl shadow-[#001C4B]/20">
                                        Browse Events
                                    </button>
                                </div>
                            )
                        ) : (
                            filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket, i) => (
                                    <TicketCard key={i} ticket={ticket} />
                                ))
                            ) : (
                                <div className="bg-white rounded-[20px] p-16 text-center shadow-sm border border-gray-100">
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No past purchases to show.</p>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>

        </div>
    );
}