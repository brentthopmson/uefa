"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../UserContext";
import { User } from "../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExchangeAlt,
    faBars,
    faUser,
    faEnvelope,
    faTicketAlt,
    faChevronRight,
    faSearch,
    faSignOutAlt,
    faUserCircle,
    faCog,
    faShieldAlt,
    faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

export default function TransfersPage() {
    const router = useRouter();
    const {
        admin,
        users,
        fetchAllUsers,
        setAdmin,
        setUsers,
        setTickets,
        setLoggedInAdmin,
        verifyAdminSession
    } = useUser();

    const [localAdmin, setLocalAdmin] = useState<string | null>(null);
    const [filteredTransfers, setFilteredTransfers] = useState<User[]>([]);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        setAdmin(null);
        setUsers([]);
        setTickets([]);
        router.push('/login');
    };

    const sidebarItems = [
        { icon: faTicketAlt, label: 'My Purchases', active: false, href: '/secure/myaccount/tickets' },
        { icon: faExchangeAlt, label: 'Transfers', active: true, href: '/secure/myaccount/transfers' },
        { icon: faUserCircle, label: 'Personal Details', active: false, href: '/secure/myaccount/personal-details' },
        { icon: faCog, label: 'Account Settings', active: false, href: '/secure/myaccount/manage' },
        { icon: faShieldAlt, label: 'Privacy', active: false, href: '#'},
        { icon: faQuestionCircle, label: 'Help', active: false, href: '#'},
        { icon: faSignOutAlt, label: 'Sign Out', active: false, action: handleLogout },
    ];

    useEffect(() => {
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setLocalAdmin(adminUsername);
                setIsSessionValid(true);
                fetchAllUsers();
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, fetchAllUsers, setLoggedInAdmin]);

    // Periodic session verification
    useEffect(() => {
        if (isSessionValid === true) {
            const interval = setInterval(async () => {
                const result = await verifyAdminSession();
                if (!result.valid) {
                    alert("Your session has expired. You have been logged out.");
                    localStorage.removeItem("loggedInAdmin");
                    localStorage.removeItem("adminData");
                    setAdmin(null);
                    setUsers([]);
                    setTickets([]);
                    setLoggedInAdmin(null);
                    setLocalAdmin(null);
                    setIsSessionValid(false);
                    router.push('/login');
                }
            }, 60000); // Check every 60 seconds

            return () => clearInterval(interval);
        }
    }, [isSessionValid, verifyAdminSession, router, setAdmin, setUsers, setTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid === true && localAdmin && Array.isArray(users)) {
            // Filter: only this admin's transfers with 'uefa' platform
            let transfers = users.filter(u =>
                u.admin === localAdmin &&
                u.userPlatform?.toLowerCase() === 'uefa'
            );

            // Filter by tab
            if (activeTab === 'pending') {
                transfers = transfers.filter(u =>
                    u.systemStatus === 'WAITING APPROVAL' ||
                    u.systemStatus === 'WAITING COMPLETION' ||
                    !u.systemStatus // Default to pending if no status
                );
            } else {
                transfers = transfers.filter(u => u.systemStatus === 'COMPLETED');
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
    }, [users, localAdmin, isSessionValid, activeTab, searchTerm]);

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
                        <FontAwesomeIcon icon={faBars} className="text-xl" />
                    </button>
                    <h1 className="text-lg font-black text-white tracking-tight">Transfers</h1>
                    <button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition-colors p-1">
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row py-8 px-4 gap-8">
                <Sidebar
                    sidebarItems={sidebarItems}
                    isSidebarOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    adminUsername={admin?.username}
                />

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

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'pending' ? 'border-[#3b82f6] text-[#1f262d]' : 'border-transparent text-gray-400 hover:text-[#1f262d]'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'completed' ? 'border-[#3b82f6] text-[#1f262d]' : 'border-transparent text-gray-400 hover:text-[#1f262d]'}`}
                        >
                            Completed
                        </button>
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
                                {activeTab === 'pending'
                                    ? `No pending transfers found.`
                                    : `No completed transfers found.`}
                            </p>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}
