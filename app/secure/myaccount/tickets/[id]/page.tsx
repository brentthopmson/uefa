"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "../../../../UserContext";
import { Ticket } from "../../../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTicketAlt,
    faUserCircle,
    faCog,
    faShieldAlt,
    faQuestionCircle,
    faSignOutAlt,
    faChevronLeft,
    faChevronRight,
    faCalendarAlt,
    faMapMarkerAlt,
    faPaperPlane,
    faEyeSlash,
    faExchangeAlt,
    faWallet,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import TransferModal from "../../../../components/TransferModal";

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
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === flipIdx ? "opacity-100" : "opacity-0"}`}
                />
            ))}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    {images.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === flipIdx ? "bg-white w-3" : "bg-white/50"}`} />
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
        setTickets,
        setLoggedInAdmin,
        setUsers
    } = useUser();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    useEffect(() => {
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem("adminData");
    
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setIsSessionValid(true);
                if (allTickets.length === 0) {
                    fetchAllTickets();
                }
            } catch (e) {
                console.error("Error parsing admin data", e);
                router.replace('/login');
            }
        } else {
            router.replace('/login');
        }
    }, [setAdmin, router, fetchAllTickets, allTickets.length]);

    useEffect(() => {
        if (isSessionValid && allTickets.length > 0) {
            const foundTicket = allTickets.find(t => t.ticketId === ticketId || t.sn === ticketId);
            if (foundTicket) setTicket(foundTicket);
        }
    }, [allTickets, ticketId, isSessionValid]);

    const handleLogout = () => {
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminToken");
        setAdmin(null);
        setUsers([]);
        setTickets([]);
        router.push('/login');
    };



    if (isSessionValid === null || !ticket) return null;

    const seats = ticket.seatNumbers
        ? ticket.seatNumbers.split(",").map((s: string) => s.trim())
        : [ticket.seat || "N/A"];

    const flipImageList = ticket.flipImages
        ? ticket.flipImages.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const nextSeat = () => { if (currentSeatIndex < seats.length - 1) setCurrentSeatIndex(p => p + 1); };
    const prevSeat = () => { if (currentSeatIndex > 0) setCurrentSeatIndex(p => p - 1); };

    return (
        <div className="min-h-screen bg-[#001C4B] flex flex-col font-sans">

            {/* ── Header: deep blue bg, white text ── */}
            <header className="bg-[#001C4B] text-white border-b border-white/10 px-4 py-2 fixed top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    {/* Left: If on first seat, go back to list. If on a subsequent seat, go to previous seat. */}
                    {currentSeatIndex > 0 ? (
                        <button onClick={prevSeat}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </button>
                    ) : (
                        <Link href="/secure/myaccount/tickets" 
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </Link>
                    )}

                    {/* Center: Ticket label + dot indicators */}
                    <div className="text-center select-none">
                        <p className="text-[14px] font-black text-white tracking-wide">
                            Ticket {currentSeatIndex + 1}{seats.length > 1 ? ` of ${seats.length}` : ""}
                        </p>
                        {seats.length > 1 && (
                            <div className="flex justify-center space-x-1 mt-0.5">
                                {seats.map((_: any, idx: number) => (
                                    <div key={idx} className={`rounded-full transition-all duration-300 ${currentSeatIndex === idx ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
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

            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col pt-[72px] px-4 gap-8">
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
                                                    <p className="text-white font-black text-sm tracking-widest uppercase">{ticket.eventName || "Event"}</p>
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
                                                { top: "GATE", bottom: ticket.sectionNo || "A2" },
                                                { top: "SECTOR", bottom: ticket.section || "—" },
                                                { top: "ROW", bottom: ticket.row || "—" },
                                                { top: "SEAT", bottom: seatNum },
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
                                                <FontAwesomeIcon icon={faEyeSlash} />
                                                <span>No Screenshots Allowed</span>
                                            </p>
                                            <div className="border-2 border-[#1f262d] rounded-lg py-2 px-4 inline-block">
                                                <p className="text-base font-black text-[#1f262d] uppercase tracking-wider">Restricted Transfer</p>
                                            </div>
                                        </div>

                                        {/* ── Info rows ── */}
                                        <div className="px-6 py-5 space-y-3 border-b border-gray-100">
                                            {[
                                                { label: "TICKET KEPT FOR", value: "Not assigned yet" },
                                                { label: "CATEGORY", value: ticket.category || "Category 1 RV" },
                                                { label: "GATES OPEN AT (LOCAL TIME)", value: ticket.doorTime || "15:00" },
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
                                        <div className="px-6 py-3 bg-gray-50 flex items-center justify-center space-x-2 border-b border-gray-100">
                                            <FontAwesomeIcon icon={faLock} className="text-gray-400 text-xs" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secured by UEFA</span>
                                        </div>

                                        {/* Dynamic Payment Options */}
                                        {ticket.paymentSettings && (() => {
                                            try {
                                                const settings = JSON.parse(ticket.paymentSettings);
                                                return (
                                                    <div className="px-6 py-4 space-y-3 bg-white">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-1">Payment Options</p>
                                                        
                                                        {/* Apple Pay */}
                                                        {settings.applePayNumber && (
                                                            <a 
                                                                href={`sms:${settings.applePayNumber}?body=Hi, I would like to add my tickets for ${ticket.eventName} to my Apple Wallet. UserID: ${ticket.ticketId}`}
                                                                className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                                            >
                                                                <FontAwesomeIcon icon={faWallet} className="mr-2" />
                                                                Add to Apple Wallet
                                                            </a>
                                                        )}

                                                        {/* Crypto Wallets */}
                                                        {settings.cryptoWallets && (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {settings.cryptoWallets.btc && (
                                                                    <a 
                                                                        href={`bitcoin:${settings.cryptoWallets.btc}`}
                                                                        className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all"
                                                                    >
                                                                        <span className="text-[9px] font-black text-[#f7931a] mb-0.5">BTC</span>
                                                                        <FontAwesomeIcon icon={faWallet} className="text-gray-400 text-[10px]" />
                                                                    </a>
                                                                )}
                                                                {settings.cryptoWallets.eth && (
                                                                    <a 
                                                                        href={`ethereum:${settings.cryptoWallets.eth}`}
                                                                        className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all"
                                                                    >
                                                                        <span className="text-[9px] font-black text-[#627eea] mb-0.5">ETH</span>
                                                                        <FontAwesomeIcon icon={faWallet} className="text-gray-400 text-[10px]" />
                                                                    </a>
                                                                )}
                                                                {settings.cryptoWallets.usdt && (
                                                                    <div 
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(settings.cryptoWallets.usdt || "");
                                                                            alert("USDT Address copied to clipboard!");
                                                                        }}
                                                                        className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                                                                    >
                                                                        <span className="text-[9px] font-black text-[#26a17b] mb-0.5">USDT</span>
                                                                        <FontAwesomeIcon icon={faWallet} className="text-gray-400 text-[10px]" />
                                                                    </div>
                                                                )}
                                                                {settings.cryptoWallets.trc && (
                                                                    <div 
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(settings.cryptoWallets.trc || "");
                                                                            alert("TRC Address copied to clipboard!");
                                                                        }}
                                                                        className="flex flex-col items-center justify-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                                                                    >
                                                                        <span className="text-[9px] font-black text-[#ff0013] mb-0.5">TRC</span>
                                                                        <FontAwesomeIcon icon={faWallet} className="text-gray-400 text-[10px]" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } catch (e) {
                                                console.error("Error parsing payment settings", e);
                                                return null;
                                            }
                                        })()}
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
                                            onClick={() => window.open("https://www.uefa.com/help", "_blank")}
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