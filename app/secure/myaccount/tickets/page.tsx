"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../../UserContext';
import TicketCard from '../../../components/TicketCard';
import Sidebar from '../../../components/Sidebar';
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
    faExchangeAlt,
    faSearch
} from '@fortawesome/free-solid-svg-icons';

const SWIPE_THRESHOLD = -60;

export default function MyTicketsPage() {
    const router = useRouter();
    const {
        admin,
        setAdmin,
        setLoggedInAdmin,
        fetchAllTickets,
        tickets
    } = useUser();

    const searchParams = useSearchParams();

    const [localAdmin, setLocalAdmin] = useState<string | null>(null);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hiddenTicketIds, setHiddenTicketIds] = useState<Set<string>>(new Set());
    const [swipedTicketId, setSwipedTicketId] = useState<string | null>(null);
    const [swipeX, setSwipeX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const touchStartX = useRef(0);
    const touchCurrentId = useRef<string | null>(null);

    // Restore hidden tickets from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("hiddenTickets");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setHiddenTicketIds(new Set(parsed));
            }
        } catch (e) {}
    }, []);

    // Sync hidden tickets to localStorage
    useEffect(() => {
        localStorage.setItem("hiddenTickets", JSON.stringify(Array.from(hiddenTicketIds)));
    }, [hiddenTicketIds]);

    // Handle revealAll from URL param (set by Manage page)
    useEffect(() => {
        if (searchParams.get('revealAll') === '1') {
            localStorage.removeItem("hiddenTickets");
            setHiddenTicketIds(new Set());
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    const handleTouchStart = useCallback((ticketId: string, e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentId.current = ticketId;
        setIsSwiping(true);
        setSwipedTicketId(ticketId);
        setSwipeX(0);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isSwiping || !swipedTicketId) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        if (dx > 0 && swipeX === 0) return;
        setSwipeX(Math.max(dx, -80));
    }, [isSwiping, swipedTicketId, swipeX]);

    const handleTouchEnd = useCallback(() => {
        setIsSwiping(false);
        if (swipeX < SWIPE_THRESHOLD) {
            setSwipeX(-80);
        } else {
            setSwipedTicketId(null);
            setSwipeX(0);
            touchCurrentId.current = null;
        }
    }, [swipeX]);

    const handleHideConfirm = useCallback((ticketId: string) => {
        const next = new Set(hiddenTicketIds);
        next.add(ticketId);
        setHiddenTicketIds(next);
        setSwipedTicketId(null);
        setSwipeX(0);
        touchCurrentId.current = null;
    }, [hiddenTicketIds]);

    const handleSnapBack = useCallback(() => {
        setSwipedTicketId(null);
        setSwipeX(0);
        touchCurrentId.current = null;
    }, []);

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
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, fetchAllTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid === true && localAdmin && Array.isArray(tickets)) {
            const filtered = tickets.filter((t) => {
                // 1. Must belong to the logged-in admin
                const matchesAdmin = t.admin === localAdmin;
                
                // 2. Must not be deleted
                const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
                
                // 3. Platform must include "uefa" (comma separated)
                const platformList = t.platform?.toLowerCase().split(',').map(p => p.trim()) || [];
                const matchesPlatform = platformList.includes("uefa");
                
                if (!matchesAdmin || !isNotDeleted || !matchesPlatform) return false;
                if (hiddenTicketIds.has(t.ticketId)) return false;
                
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
                    const matchesSearch = t.eventName?.toLowerCase().includes(term) ||
                                        t.venue?.toLowerCase().includes(term) ||
                                        t.location?.toLowerCase().includes(term) ||
                                        t.section?.toLowerCase().includes(term) ||
                                        t.row?.toLowerCase().includes(term) ||
                                        t.seatNumbers?.toLowerCase().includes(term) ||
                                        t.admin?.toLowerCase().includes(term);
                    
                    if (!matchesSearch) return false;
                }
                
                return true;
            });
            setFilteredTickets(filtered);
        }
    }, [tickets, localAdmin, isSessionValid, activeTab, searchTerm, hiddenTicketIds]);

    const handleLogout = () => {
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminToken");
        setAdmin(null);
        // Note: setUsers and setTickets are not available in this component's scope
        // They would need to be obtained from useUser() if needed for logout
        router.push('/login');
    };

    const sidebarItems = [
        { icon: faTicketAlt, label: 'My Purchases', active: true, href: '/secure/myaccount/tickets' },
        { icon: faExchangeAlt, label: 'Transfers', active: false, href: '/secure/myaccount/transfers' },
        { icon: faUserCircle, label: 'Personal Details', active: false, href: '/secure/myaccount/personal-details' },
        { icon: faCog, label: 'Account Settings', active: false, href: '/secure/myaccount/manage' },
        { icon: faShieldAlt, label: 'Privacy', active: false, href: '#' },
        { icon: faQuestionCircle, label: 'Help', active: false, href: '#' },
        { icon: faSignOutAlt, label: 'Sign Out', active: false, action: handleLogout },
    ];

    if (isSessionValid === null) return null;

    return (
        <div className="min-h-screen bg-[#001C4B] flex flex-col font-sans">

            {/* ── Header: nav hamburger on left, title centered ── */}
            <header className="bg-[#001C4B] text-white border-b border-white/10 px-4 py-3 fixed top-0 left-0 right-0 z-50 w-full">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white/80 hover:opacity-70 transition-opacity p-1">
                        <FontAwesomeIcon icon={faBars} className="text-xl" />
                    </button>
                    <h1 className="text-lg font-black text-white tracking-tight">My Purchases</h1>
                    <button onClick={handleLogout} className="text-white/80 hover:text-red-400 transition-colors p-1">
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row pt-[72px] lg:pt-[72px] pb-8 px-4 gap-8">

                {/* ── Sidebar (shared component) ── */}
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
                                filteredTickets.map((ticket, i) => {
                                    const open = swipedTicketId === ticket.ticketId && swipeX === -80;
                                    return (
                                        <div key={i} className="relative overflow-hidden">
                                            {open && (
                                                <div className="absolute inset-y-0 right-0 w-[80px] flex items-center justify-center bg-red-500 rounded-[20px] z-0">
                                                    <button
                                                        onClick={() => handleHideConfirm(ticket.ticketId)}
                                                        className="text-white font-black text-xs uppercase tracking-widest"
                                                    >
                                                        Hide?
                                                    </button>
                                                </div>
                                            )}
                                            <div
                                                className="relative z-10"
                                                style={{
                                                    transform: `translateX(${swipedTicketId === ticket.ticketId ? swipeX : 0}px)`,
                                                    transition: isSwiping ? 'none' : 'transform 0.25s ease',
                                                    touchAction: 'pan-y',
                                                }}
                                                onTouchStart={(e) => handleTouchStart(ticket.ticketId, e)}
                                                onTouchMove={handleTouchMove}
                                                onTouchEnd={handleTouchEnd}
                                                onClick={open ? handleSnapBack : undefined}
                                            >
                                                {open ? (
                                                    <div className="pointer-events-none">
                                                        <TicketCard ticket={ticket} />
                                                    </div>
                                                ) : (
                                                    <TicketCard ticket={ticket} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
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
                                filteredTickets.map((ticket, i) => {
                                    const open = swipedTicketId === ticket.ticketId && swipeX === -80;
                                    return (
                                        <div key={i} className="relative overflow-hidden">
                                            {open && (
                                                <div className="absolute inset-y-0 right-0 w-[80px] flex items-center justify-center bg-red-500 rounded-[20px] z-0">
                                                    <button
                                                        onClick={() => handleHideConfirm(ticket.ticketId)}
                                                        className="text-white font-black text-xs uppercase tracking-widest"
                                                    >
                                                        Hide?
                                                    </button>
                                                </div>
                                            )}
                                            <div
                                                className="relative z-10"
                                                style={{
                                                    transform: `translateX(${swipedTicketId === ticket.ticketId ? swipeX : 0}px)`,
                                                    transition: isSwiping ? 'none' : 'transform 0.25s ease',
                                                    touchAction: 'pan-y',
                                                }}
                                                onTouchStart={(e) => handleTouchStart(ticket.ticketId, e)}
                                                onTouchMove={handleTouchMove}
                                                onTouchEnd={handleTouchEnd}
                                                onClick={open ? handleSnapBack : undefined}
                                            >
                                                {open ? (
                                                    <div className="pointer-events-none">
                                                        <TicketCard ticket={ticket} />
                                                    </div>
                                                ) : (
                                                    <TicketCard ticket={ticket} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
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