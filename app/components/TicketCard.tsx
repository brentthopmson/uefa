"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faChevronRight, faMapMarkerAlt, faCalendarAlt, faLock, faImage } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket } from '../types';
import { useState } from 'react';

interface TicketCardProps {
    ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
    const router = useRouter();
    const [imgError, setImgError] = useState(false);

    return (
        <Link
            href={`/secure/myaccount/tickets/${ticket.ticketId || ticket.sn}`}
            className="block bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
        >
            {/* Cover Image */}
            {ticket.coverImage && !imgError ? (
                <div className="relative h-36 md:h-44 overflow-hidden bg-gray-100">
                    <img
                        src={ticket.coverImage}
                        alt={ticket.eventName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            ) : (
                <div className="h-24 bg-gradient-to-r from-[#001C4B] to-[#002d6e] flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-white text-sm" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm leading-tight">{ticket.eventName}</p>
                            <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-0.5">{ticket.section || 'Category 1'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500 font-bold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#001C4B]" />
                        {ticket.venue}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 font-bold">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#001C4B]" />
                        {ticket.dateTime}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 font-bold mt-1">
                        <FontAwesomeIcon icon={faLock} className="mr-2 text-[#001C4B] text-[9px]" />
                        <span className="text-[10px] font-black text-[#001C4B] uppercase tracking-widest">Secured</span>
                    </div>
                </div>
                <div className="text-[#001C4B] font-bold flex items-center hover:underline">
                    View Ticket <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-xs" />
                </div>
            </div>
        </Link>
    );
}