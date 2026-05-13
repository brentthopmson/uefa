"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { User } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faExchangeAlt,
    faBars,
    faTimes,
    faUser,
    faEnvelope,
    faTicketAlt,
    faChevronRight,
    faSearch,
    faLock,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function TransfersPage() {
    const router = useRouter();
    const {
        admin,
        users,
        fetchAllUsers,
        setAdmin,
        setUsers,
        setTickets
    } = useUser();

    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [filteredTransfers, setFilteredTransfers] = useState<User[]>([]);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInAdmin");
        sessionStorage.removeItem("adminData");
        setAdmin(null);
        setUsers([]);
        setTickets([]);
        router.push('/login');
    };

    const sidebarItems = [
        { icon: faTicketAlt, label: 'My Purchases', active: false, href: '/secure/myaccount/tickets' },
        { icon: faExchangeAlt, label: 'Transfers', active: true, href: '/secure/myaccount/transfers' },
        { icon: faUser, label: 'Personal Details', active: false, href: '#' },
        { icon: faLock, label: 'Privacy', active: false, href: '#' },
        { icon: faSearch, label: 'Help', active: false, href: '#' },
        { icon: faSignOutAlt, label: 'Sign Out', active: false, action: handleLogout },
    ];

    const statusTabs = ['all', 'WAITING APPROVAL', 'WAITING COMPLETION', 'COMPLETED', 'DECLINED', 'RETRACTED', 'CANCELLED'];

    useEffect(() => {
        const adminUsername = sessionStorage.getItem("loggedInAdmin");
        const adminData = sessionStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setIsSessionValid(true);
                fetchAllUsers();
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, fetchAllUsers]);

    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(users)) {
            // Filter: only this admin's transfers with 'uefa' platform
            let transfers = users.filter(u => 
                u.admin === loggedInAdmin && 
                u.userPlatform?.toLowerCase() === 'uefa'
            );

            // Filter by status
            if (activeStatus !== 'all') {
                transfers = transfers.filter(u => u.systemStatus === activeStatus);
            }

            // Filter by search
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                transfers = transfers.filter(u => 
                    u.fullName?.toLowerCase().includes(term) ||
                    u.emailAddress?.toLowerCase().includes(term) ||
                    u.ticketId?.toLowerCase().includes(term)
                );
            }

            setFilteredTransfers(transfers);
        }
    }, [users, loggedInAdmin, isSessionValid, activeStatus, searchTerm]);



    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING APPROVAL': return 'bg-yellow-100 text-yellow-800';
            case 'WAITING COMPLETION': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'DECLINED': return 'bg-red-100 text-red-800';
            case 'RETRACTED': return 'bg-orange-100 text-orange-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (isSessionValid === null) return null;

    return (
        <div className="min-h-screen bg-[#001C4B] flex flex-col font-sans">

            {/* ── Header ── */}
            <header className="bg-[#001C4B] text-white border-b border-white/10 px-4 py-3 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white/80 hover:opacity-70 transition-opacity p-1">
                        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} className="text-xl" />
                    </button>
                    <h1 className="text-lg font-black text-white tracking-tight">Transfers</h1>
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
                            placeholder="Search by name, email, or ticket ID..."
                            className="w-full p-4 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 font-bold text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 ml-1">Filter by Status</label>
                        <div className="relative">
                            <select 
                                value={activeStatus} 
                                onChange={(e) => setActiveStatus(e.target.value)}
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm outline-none appearance-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer"
                            >
                                {statusTabs.map(status => (
                                    <option key={status} value={status} className="bg-[#001C4B] text-white">
                                        {status === 'all' ? 'All Statuses' : status}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                <FontAwesomeIcon icon={faChevronRight} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Transfer List */}
                    {filteredTransfers.length > 0 ? (
                        <div className="space-y-4">
                            {filteredTransfers.map((transfer, i) => (
                                <Link key={i} href={`/secure/myaccount/transfers/${transfer.userId}`} className="block bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform">
                                    <div className="p-5 flex items-start justify-between">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-[#001C4B]/10 text-[#001C4B] flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1f262d] text-sm truncate">{transfer.fullName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 truncate">{transfer.emailAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-400 mt-2">
                                                <span className="flex items-center">
                                                    <FontAwesomeIcon icon={faTicketAlt} className="mr-1 text-[#001C4B]" />
                                                    {transfer.ticketId}
                                                </span>
                                                <span className="flex items-center">
                                                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-1 text-[#001C4B]" />
                                                    {transfer.seatNumbers}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-300 mt-1">
                                                {new Date(transfer.timestamp).toLocaleDateString('en-US', { 
                                                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusColor(transfer.systemStatus)}`}>
                                                {transfer.systemStatus || 'UNKNOWN'}
                                            </span>
                                            <FontAwesomeIcon icon={faChevronRight} className="text-gray-200 text-[10px]" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[20px] p-16 text-center shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                <FontAwesomeIcon icon={faExchangeAlt} className="text-2xl text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#1f262d] mb-2">No transfers found</h3>
                            <p className="text-gray-400 font-bold text-sm">
                                {activeStatus !== 'all' 
                                    ? `No transfers with status "${activeStatus}"` 
                                    : 'You haven\'t made any transfers yet.'}
                            </p>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}