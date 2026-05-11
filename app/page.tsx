'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight, faLocationDot, faCalendarAlt, faPlayCircle, faTicketAlt } from '@fortawesome/free-solid-svg-icons';

const heroEvent = { 
  id: 1, 
  title: 'UEFA EURO 2024: The Final Showdown', 
  subtitle: 'Spain vs England - Olympiastadion Berlin', 
  image: 'https://editorial.uefa.com/resources/028b-1ace610b642a-167825d19d5c-1000/ucl_final_london_24_brand_identity.jpeg', 
  path: '/euro-2024' 
};

const categories = [
  { name: 'All Competitions', active: true },
  { name: 'National Teams', active: false },
  { name: 'Clubs', active: false },
  { name: 'Youth & Amateur', active: false },
  { name: 'Women', active: false },
];

const matchCenterEvents = [
  { id: 101, homeTeam: 'Real Madrid', awayTeam: 'B. Dortmund', score: '2 - 0', status: 'FT', date: '01 Jun', competition: 'Champions League', image: 'https://img.uefa.com/imgml/uefacom/ucl/social/og-default.jpg' },
  { id: 102, homeTeam: 'Atalanta', awayTeam: 'B. Leverkusen', score: '3 - 0', status: 'FT', date: '22 May', competition: 'Europa League', image: 'https://img.uefa.com/imgml/uefacom/uel/social/og-default.jpg' },
  { id: 103, homeTeam: 'Olympiacos', awayTeam: 'Fiorentina', score: '1 - 0', status: 'FT', date: '29 May', competition: 'Conference League', image: 'https://img.uefa.com/imgml/uefacom/uecl/social/og-default.jpg' },
  { id: 104, homeTeam: 'Spain', awayTeam: 'England', score: '2 - 1', status: 'FT', date: '14 Jul', competition: 'EURO 2024', image: 'https://img.uefa.com/imgml/uefacom/euro2024/social/og-default.png' },
  { id: 105, homeTeam: 'Man City', awayTeam: 'Inter', score: '1 - 0', status: 'FT', date: '10 Jun', competition: 'Champions League', image: 'https://img.uefa.com/imgml/uefacom/ucl/social/og-default.jpg' },
];

const latestNews = [
  { id: 201, title: 'Champions League Team of the Season announced', category: 'News', image: 'https://editorial.uefa.com/resources/028b-1ace610b642a-167825d19d5c-1000/ucl_final_london_24_brand_identity.jpeg' },
  { id: 202, title: 'EURO 2024: All you need to know about the tournament', category: 'Tournament Guide', image: 'https://img.uefa.com/imgml/uefacom/euro2024/social/og-default.png' },
  { id: 203, title: 'New format for UEFA club competitions explained', category: 'Video', image: 'https://editorial.uefa.com/resources/0285-190b0d367464-3e9a56c39e8e-1000/uel_final_dublin_24_brand_identity.jpeg' },
  { id: 204, title: 'Women\'s Champions League: Bilbao 2024 reflections', category: 'Feature', image: 'https://editorial.uefa.com/resources/0285-190b0d46247c-3b5a56c39e8e-1000/uecl_final_athens_24_brand_identity.jpeg' },
];

function HeroBanner({ event }: { event: any }) {
  return (
    <div className="relative w-full h-[400px] md:h-[550px] lg:h-[650px] overflow-hidden mb-8">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000f28] via-[#000f28]/60 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 container mx-auto text-white z-10">
        <div className="max-w-3xl">
          <span className="bg-[#00AEEF] text-[#001C4B] font-bold text-xs uppercase px-3 py-1 rounded-sm mb-4 inline-block tracking-wider">Top Story</span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight shadow-sm">{event.title}</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">{event.subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/ticket-details/${event.id}`} className="bg-white text-[#001C4B] px-8 py-3.5 rounded-sm font-bold hover:bg-gray-100 transition-colors flex items-center">
              <FontAwesomeIcon icon={faTicketAlt} className="mr-3" />
              Get Tickets
            </Link>
            <Link href={event.path} className="bg-[#001C4B]/60 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-sm font-bold hover:bg-[#001C4B] transition-colors flex items-center">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCenterCarousel({ events }: { events: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative group/section overflow-hidden mb-16 bg-[#f2f3f5] py-10 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#001C4B] uppercase tracking-wide">Match Center</h2>
          <button className="text-[#00AEEF] font-bold text-sm hover:underline uppercase">View All Matches</button>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/ticket-details/${event.id}`}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 flex-shrink-0 group/card snap-start relative flex flex-col"
              >
                <div className="bg-[#001C4B] text-white text-xs font-bold py-1.5 px-4 text-center uppercase tracking-wider">
                  {event.competition}
                </div>
                <div className="p-5 flex-grow">
                  <div className="text-center text-xs text-gray-500 mb-4 font-bold uppercase tracking-wider">{event.date}</div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col items-center w-1/3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 border border-gray-200 shadow-inner text-[#001C4B] font-bold text-xl">
                        {event.homeTeam.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#001C4B] text-center">{event.homeTeam}</span>
                    </div>
                    
                    <div className="flex flex-col items-center w-1/3">
                      <div className="text-2xl font-bold text-[#001C4B] bg-[#f2f3f5] px-3 py-1 rounded">{event.score}</div>
                      <span className="text-[10px] text-gray-500 mt-1 font-bold">{event.status}</span>
                    </div>

                    <div className="flex flex-col items-center w-1/3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 border border-gray-200 shadow-inner text-[#001C4B] font-bold text-xl">
                        {event.awayTeam.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-[#001C4B] text-center">{event.awayTeam}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 border-t border-gray-100 text-center">
                  <span className="text-[#00AEEF] font-bold text-xs uppercase tracking-wider group-hover/card:underline">Find Tickets</span>
                </div>
              </Link>
            ))}
          </div>

          <button onClick={() => scroll('left')} className="absolute -left-4 top-[45%] -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#001C4B] opacity-0 group-hover/section:opacity-100 transition-opacity z-10 border border-gray-200">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button onClick={() => scroll('right')} className="absolute -right-4 top-[45%] -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#001C4B] opacity-0 group-hover/section:opacity-100 transition-opacity z-10 border border-gray-200">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </section>
  );
}

function NewsCarousel({ title, news }: { title: string, news: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative group/section overflow-hidden mb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#001C4B] uppercase tracking-wide">{title}</h2>
          <button className="text-[#00AEEF] font-bold text-sm hover:underline uppercase">More News</button>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
            {news.map((item) => (
              <Link key={item.id} href={`/ticket-details/${item.id}`} className="min-w-[260px] md:min-w-[300px] bg-white overflow-hidden group/card snap-start flex-shrink-0">
                <div className="relative aspect-[16/9] overflow-hidden rounded-sm mb-3">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  {item.category === 'Video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/card:bg-black/10 transition-colors">
                      <FontAwesomeIcon icon={faPlayCircle} className="text-white text-4xl opacity-90" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[#00AEEF] text-[10px] font-bold uppercase tracking-widest mb-1 block">{item.category}</span>
                  <h3 className="font-bold text-[#001C4B] text-lg leading-tight group-hover/card:underline">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          <button onClick={() => scroll('left')} className="absolute -left-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#001C4B] opacity-0 group-hover/section:opacity-100 transition-opacity z-10 border border-gray-200">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button onClick={() => scroll('right')} className="absolute -right-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-[#001C4B] opacity-0 group-hover/section:opacity-100 transition-opacity z-10 border border-gray-200">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function UEFAHome() {
  return (
    <main className="pt-[60px] md:pt-[70px] bg-white min-h-screen pb-0">
      {/* UEFA Secondary Navigation Bar */}
      <div className="bg-[#f2f3f5] border-b border-gray-200 hidden md:block">
         <div className="container mx-auto px-4">
           <ul className="flex space-x-8 text-[13px] font-bold text-[#001C4B] uppercase tracking-wider py-3 overflow-x-auto scrollbar-hide">
             {categories.map((cat, index) => (
               <li key={index}>
                 <button className={`whitespace-nowrap hover:text-[#00AEEF] transition-colors ${cat.active ? 'text-[#00AEEF] border-b-2 border-[#00AEEF] pb-3 -mb-[13px]' : ''}`}>
                   {cat.name}
                 </button>
               </li>
             ))}
           </ul>
         </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner event={heroEvent} />

      {/* Main Content Areas */}
      <MatchCenterCarousel events={matchCenterEvents} />
      <NewsCarousel title="Latest UEFA News" news={latestNews} />
      <NewsCarousel title="Featured Competitions" news={latestNews.slice().reverse()} />

      {/* App Download Section (UEFA styled) */}
      <section className="bg-[#001C4B] py-16 text-white border-t border-[#00AEEF]/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wide">UEFA Mobile Tickets App</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg">The secure and easy way to receive, manage, transfer, and use your official UEFA match tickets directly on your smartphone.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="h-12 hover:opacity-80 transition-opacity"><img src="https://img.vggcdn.net/img/apple-app-store-badge/en.svg" alt="App Store" className="h-full" /></a>
              <a href="#" className="h-12 hover:opacity-80 transition-opacity"><img src="https://img.vggcdn.net/img/google-play-store-badge/en.png" alt="Google Play" className="h-full" /></a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img src="https://img.uefa.com/imgml/uefacom/tickets/mobile_ticket_app_mockup.png" className="h-[300px] object-contain" alt="UEFA App" onError={(e) => { e.currentTarget.src = "https://placehold.co/300x400/transparent/FFFFFF?text=Mobile+App"; }} />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#f2f3f5] py-20 border-y border-gray-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#001C4B] mb-8 uppercase tracking-wide">Stay Updated with UEFA.com</h2>
          <p className="text-[#53575A] font-medium mb-8">Sign up for official UEFA ticketing news, tournament updates, and exclusive offers delivered straight to your inbox.</p>
          <form className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white border border-gray-300 px-6 py-4 rounded-sm outline-none focus:ring-2 focus:ring-[#00AEEF] transition-all text-[15px]"
            />
            <button className="bg-[#001C4B] text-white px-10 py-4 rounded-sm font-bold text-[15px] hover:bg-[#000f28] transition-all uppercase tracking-wider">
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest">
            By subscribing, you agree to our <span className="underline cursor-pointer hover:text-[#00AEEF]">Terms and Conditions</span> and <span className="underline cursor-pointer hover:text-[#00AEEF]">Privacy Policy</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
