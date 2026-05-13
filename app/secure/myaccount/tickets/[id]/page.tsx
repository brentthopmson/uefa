"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../UserContext';
import { Ticket } from '../../../../types';
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
    faChevronRight,
    faCalendarAlt,
    faMapMarkerAlt,
    faPaperPlane,
    faCameraSlash,
    faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import TransferModal from '../../../../components/TransferModal';

function FlipCarousel({ images }: { images: string[] }) {
    const [flipIdx, setFlipIdx] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setFlipIdx(p => (p + 1) % images.length);
        }, 5000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [images.length]);

    return (
        <div className="relative w-full h-36 md:h-44 rounded-xl overflow-hidden mb-4 cursor-pointer" onClick={() => setFlipIdx(p => (p + 1) % images.length)}>
            {images.map((url, i) => (
                <img
                    key={i}
                    src={url}
                    alt={`Event view ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === flipIdx ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    {images.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === flipIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TicketDetailsAccountPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;
    
    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setTickets
    } = useUser();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    useEffect(() => {
        const adminUsername = sessionStorage.getItem("loggedInAdmin");
        const adminData = sessionStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setIsSessionValid(true);
                if (allTickets.length === 0) fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, allTickets.length, fetchAllTickets]);

    useEffect(() => {
        if (isSessionValid && allTickets.length > 0) {
            const foundTicket = allTickets.find(t => t.ticketId === ticketId || t.sn === ticketId);
            if (foundTicket) setTicket(foundTicket);
        }
    }, [allTickets, ticketId, isSessionValid]);

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInAdmin");
        sessionStorage.removeItem("adminData");
        setAdmin(null);
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
    ];

    if (isSessionValid === null || !ticket) return null;

    const seats = ticket.seatNumbers
        ? ticket.seatNumbers.split(',').map((s: string) => s.trim())
        : [ticket.seat || 'N/A'];

    const flipImageList = ticket.flipImages
        ? ticket.flipImages.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const nextSeat = () => { if (currentSeatIndex < seats.length - 1) setCurrentSeatIndex(p => p + 1); };
    const prevSeat = () => { if (currentSeatIndex > 0) setCurrentSeatIndex(p => p - 1); };

    return (
        <div className="min-h-screen bg-[#001C4B] flex flex-col font-sans">

            {/* ── Header: deep blue bg, white text ── */}
            <header className="bg-[#001C4B] text-white border-b border-white/10 px-4 py-2 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left: If on first seat, go back to list. If on a subsequent seat, go to previous seat. */}
                    {currentSeatIndex > 0 ? (
                        <button onClick={prevSeat}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </button>
                    ) : (
                        <button onClick={() => router.push('/secure/myaccount/tickets')} 
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </button>
                    )}

                    {/* Center: Ticket label + dot indicators */}
                    <div className="text-center select-none">
                        <p className="text-[14px] font-black text-white tracking-wide">
                            Ticket {currentSeatIndex + 1}{seats.length > 1 ? ` of ${seats.length}` : ''}
                        </p>
                        {seats.length > 1 && (
                            <div className="flex justify-center space-x-1 mt-0.5">
                                {seats.map((_: any, idx: number) => (
                                    <div key={idx} className={`rounded-full transition-all duration-300 ${currentSeatIndex === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Multi-seat = next ticket arrow | Single seat = hidden */}
                    {seats.length > 1 ? (
                        <button onClick={nextSeat} disabled={currentSeatIndex === seats.length - 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 disabled:opacity-20 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                        </button>
                    ) : (
                        <div className="w-8"></div>
                    )}
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row py-8 px-4 gap-8">

                {/* ── Sidebar ── */}
                <aside className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:bg-transparent lg:inset-auto lg:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 lg:p-0">
                        <div className="lg:hidden flex justify-end mb-8">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-2xl"><FontAwesomeIcon icon={faTimes} /></button>
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
                                    <button key={i}
                                        className={`w-full text-left px-4 py-3 rounded-[12px] flex items-center space-x-3 transition-all ${item.active ? 'bg-[#001C4B] text-white font-black shadow-lg shadow-[#001C4B]/20' : 'text-[#1f262d] hover:bg-white hover:shadow-sm font-bold'}`}>
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

                {/* ── Main ── */}
                <main className="flex-1 pb-24 lg:pb-0">

                    {/* ── Sliding ticket card ── */}
                    <div className="overflow-hidden">
                        <div className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentSeatIndex * 100}%)` }}>

                            {seats.map((seatNum: string, idx: number) => (
                                <div key={idx} className="min-w-full">

                                    {/* ── QR Code Unavailable Card (top) ── */}
                                    <div className="max-w-md mx-auto mb-4 bg-white rounded-[20px] shadow-md border border-gray-100 overflow-hidden">
                                        <div className="px-5 pt-5 pb-4 text-center">
                                            <p className="font-black text-[#001C4B] text-[15px] mb-1">QR Code Not Yet Available</p>
                                            <p className="text-[11px] text-gray-500 font-bold leading-snug max-w-xs mx-auto">
                                                Your QR code will be updated shortly before the match. Please check back closer to the event date.
                                            </p>
                                        </div>
                                    </div>

                                    {/* White Ticket Card */}
                                    <div className="bg-white rounded-[20px] shadow-md border border-gray-100 overflow-hidden max-w-md mx-auto">

                                        {/* ── Ticket top: Flip images carousel + Date & Venue ── */}
                                        <div className="px-6 pt-6 pb-5 text-center border-b border-dashed border-gray-200">
                                            {/* Flip Images Carousel */}
                                            {flipImageList.length > 0 ? (
                                                <FlipCarousel images={flipImageList} />
                                            ) : (
                                                <div className="w-full h-24 bg-gradient-to-r from-[#001C4B] to-[#002d6e] rounded-xl flex items-center justify-center mb-4">
                                                    <p className="text-white font-black text-sm tracking-widest uppercase">{ticket.eventName || 'Event'}</p>
                                                </div>
                                            )}

                                            {/* Date & Venue */}
                                            <div className="space-y-1.5 text-sm text-[#1f262d]">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                                                    <span className="font-bold text-[13px]">{ticket.dateTime}</span>
                                                </div>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs" />
                                                    <span className="font-bold text-[13px]">{ticket.venue}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── 4-column seat grid (Gate/Sector/Row/Seat) ── */}
                                        <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                                            {[
                                                { top: 'GATE', bottom: ticket.sectionNo || 'A2' },
                                                { top: 'SECTOR', bottom: ticket.section || '—' },
                                                { top: 'ROW', bottom: ticket.row || '—' },
                                                { top: 'SEAT', bottom: seatNum },
                                            ].map((col, ci) => (
                                                <div key={ci} className="py-4 text-center">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider leading-tight mb-1">{col.top}</p>
                                                    <p className="text-xl font-black text-[#1f262d]">{col.bottom}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── No Screenshots / Restricted Transfer ── */}
                                        <div className="px-6 py-4 border-b border-dashed border-gray-200 text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center space-x-1">
                                                <FontAwesomeIcon icon={faCameraSlash} />
                                                <span>No Screenshots Allowed</span>
                                            </p>
                                            <div className="border-2 border-[#1f262d] rounded-lg py-2 px-4 inline-block">
                                                <p className="text-base font-black text-[#1f262d] uppercase tracking-wider">Restricted Transfer</p>
                                            </div>
                                        </div>

                                        {/* ── Info rows ── */}
                                        <div className="px-6 py-5 space-y-3 border-b border-gray-100">
                                            {[
                                                { label: 'TICKET KEPT FOR', value: ticket.admin || 'Not assigned yet' },
                                                { label: 'CATEGORY', value: ticket.section || 'Category 1 RV' },
                                                { label: 'GATES OPEN AT (LOCAL TIME)', value: ticket.doorTime || '15:00' },
                                            ].map((row, ri) => (
                                                <div key={ri} className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{row.label}</span>
                                                    <span className="text-[12px] font-black text-[#1f262d]">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Barcode strip */}
                                        <div className="px-6 py-6 flex flex-col items-center border-b border-gray-100">
                                            <div className="flex justify-center space-x-px h-16 mb-2">
                                                {Array.from({ length: 60 }).map((_, i) => (
                                                    <div key={i} className="h-full bg-[#1f262d]" style={{ width: `${Math.random() * 2.5 + 0.5}px`, opacity: Math.random() > 0.08 ? 1 : 0.15 }} />
                                                ))}
                                            </div>
                                            <p className="text-[9px] font-mono font-black text-gray-400 tracking-[0.3em] mt-1">
                                                {ticket.ticketId?.toUpperCase()}-{idx + 1}
                                            </p>
                                        </div>

                                        {/* Secured badge */}
                                        <div className="px-6 py-3 bg-gray-50 flex items-center justify-center space-x-2">
                                            <FontAwesomeIcon icon={faLock} className="text-gray-400 text-xs" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secured by UEFA</span>
                                        </div>
                                    </div>

                                    {/* ── Transfer your ticket card (below ticket, like reference) ── */}
                                    <div className="max-w-md mx-auto mt-4 bg-white rounded-[20px] shadow-md border border-gray-100 overflow-hidden">
                                        <div className="px-5 pt-5 pb-2">
                                            <p className="font-black text-[#001C4B] text-[15px] mb-1">Transfer your ticket</p>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FontAwesomeIcon icon={faPaperPlane} className="text-[#001C4B] text-xs" />
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-bold leading-snug">
                                                    You can transfer this ticket to a guest to make entry into the stadium smoother
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-5 pb-5 pt-3">
                                            <button
                                                onClick={() => setIsTransferModalOpen(true)}
                                                className="w-full bg-[#001C4B] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#002d6e] active:scale-95 transition-all"
                                            >
                                                Transfer
                                            </button>
                                        </div>
                                    </div>

                                    {/* Help button */}
                                    <div className="max-w-md mx-auto mt-3">
                                        <button
                                            onClick={() => window.open('https://www.uefa.com/help', '_blank')}
                                            className="w-full bg-white text-[#001C4B] border border-gray-200 py-4 rounded-xl font-black text-sm hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faQuestionCircle} />
                                            <span>Help</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} ticket={ticket} />
        </div>
    );
}