"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faTicketAlt, faUser, faSearch, faBell, faHome, faHeart, faTag } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { UserProvider, useUser } from './UserContext';
import { useEffect, useState } from 'react';

library.add(faPhone, faLock, faTicketAlt, faUser, faSearch, faBell, faHome, faHeart, faTag);

export default function RootLayoutWrapper({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: { className: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const openExternalLink = (path: string) => {
    const uefaBase = 'https://www.uefa.com';
    const fullUrl = `${uefaBase}${path}`;
    window.open(fullUrl, '_self');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query !== '') {
      const searchUrl = `https://www.uefa.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_self');
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("loggedInAdmin");
    sessionStorage.removeItem("adminData");
    router.push('/login');
  };

  const shouldShowHeaderFooter =
    pathname !== '/account' &&
    pathname !== '/invalid' &&
    pathname !== '/login' &&
    !pathname?.startsWith('/secure/myaccount');

  return (
    <>
      {shouldShowHeaderFooter && (
        <div className="flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#001C4B] text-white border-b border-white/10 shadow-sm">
            {/* Top navigation bar */}
            <div className="py-1.5 px-4 hidden lg:block border-b border-white/10">
              <div className="container mx-auto flex justify-end items-center text-[10px] font-bold uppercase tracking-widest text-white/80">
                <button
                  onClick={() => openExternalLink('/help')}
                  className="mr-8 hover:text-white transition-colors"
                >
                  Help
                </button>

                <button
                  onClick={() => admin ? router.push('/secure/myaccount/tickets') : openExternalLink('/member')}
                  className="flex items-center hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-[12px]" />
                  {admin ? `Hi, ${admin.username}` : 'My Account'}
                </button>
              </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-2 flex items-center h-[60px] md:h-[70px]">
              {/* Logo */}
              <div className="flex-shrink-0 mr-10">
                <Link href="/" className="flex items-center">
                  <img src="https://1000logos.net/wp-content/uploads/2022/01/UEFA-logo-768x432.png" alt="UEFA logo" className="h-[32px] w-auto md:h-[38px] brightness-0 invert" />
                </Link>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center space-x-8 font-bold text-[14px]">
                {['Tickets', 'Euro 2024', 'Champions League', 'Nations League'].map((item) => (
                  <button
                    key={item}
                    onClick={() => openExternalLink(`/${item.toLowerCase().replace(' ', '-')}`)}
                    className="hover:text-[#00AEEF] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex-1"></div>

              {/* Desktop Right Links */}
              <div className="hidden lg:flex items-center space-x-6 font-bold text-[14px]">
                <button onClick={() => openExternalLink('/explore')} className="hover:text-[#00AEEF] transition-colors">Explore</button>
                <button onClick={() => openExternalLink('/news')} className="hover:text-[#00AEEF] transition-colors">News</button>
                <button onClick={() => openExternalLink('/video')} className="hover:text-[#00AEEF] transition-colors">Video</button>

                {admin ? (
                  <>
                    <button onClick={() => router.push('/secure/myaccount/tickets')} className="hover:text-[#00AEEF] transition-colors">My Tickets</button>
                    <button onClick={handleSignOut} className="hover:text-[#00AEEF] transition-colors">Sign Out</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => router.push('/login')} className="hover:text-[#00AEEF] transition-colors">My Tickets</button>
                    <button onClick={() => router.push('/login')} className="hover:text-[#00AEEF] transition-colors">Sign In</button>
                  </>
                )}

                <div className="relative flex items-center space-x-4">
                  <form onSubmit={handleSearchSubmit} className="relative hidden xl:block">
                    <input
                      type="text"
                      placeholder="Search UEFA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border-none py-1.5 pl-8 pr-4 rounded-full text-[13px] text-white placeholder-white/50 focus:ring-1 focus:ring-[#00AEEF] transition-all outline-none w-[200px]"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs" />
                  </form>
                  <button className="text-white hover:text-[#00AEEF] p-2 rounded-full transition-colors relative">
                    <FontAwesomeIcon icon={faBell} className="text-xl" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#001C4B]"></span>
                  </button>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex lg:hidden items-center space-x-4">
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                  <FontAwesomeIcon icon={faSearch} className="text-xl" />
                </button>
                <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative">
                  <FontAwesomeIcon icon={faBell} className="text-xl" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#001C4B]"></span>
                </button>
                <button
                  onClick={() => admin ? router.push('/secure/myaccount/tickets') : router.push('/login')}
                  className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faUser} className="text-xl" />
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden px-4 pb-3 bg-[#001C4B]">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search UEFA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border-none py-2.5 pl-10 pr-4 rounded-lg text-sm outline-none text-white placeholder-white/50 focus:ring-1 focus:ring-[#00AEEF]"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                </div>
              </form>
            </div>
          </header>

          <main className={`flex-grow ${shouldShowHeaderFooter ? 'pb-[70px] lg:pb-0' : ''}`}>
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <Link href="/" className={`flex flex-col items-center space-y-1 ${pathname === '/' ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
              <FontAwesomeIcon icon={faHome} className="text-xl" />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <button
              onClick={() => admin ? router.push('/secure/myaccount/tickets') : router.push('/login')}
              className={`flex flex-col items-center space-y-1 ${pathname?.startsWith('/secure/myaccount/tickets') ? 'text-[#00AEEF]' : 'text-gray-400'}`}
            >
              <FontAwesomeIcon icon={faTicketAlt} className="text-xl" />
              <span className="text-[10px] font-bold">My Tickets</span>
            </button>
            <button onClick={() => openExternalLink('/video')} className="flex flex-col items-center space-y-1 text-gray-400">
              <FontAwesomeIcon icon={faHeart} className="text-xl" />
              <span className="text-[10px] font-bold">Video</span>
            </button>
            <button onClick={() => openExternalLink('/news')} className="flex flex-col items-center space-y-1 text-gray-400">
              <FontAwesomeIcon icon={faTag} className="text-xl" />
              <span className="text-[10px] font-bold">News</span>
            </button>
            <button
              onClick={() => admin ? router.push('/secure/myaccount/tickets') : router.push('/login')}
              className={`flex flex-col items-center space-y-1 ${pathname?.startsWith('/secure/myaccount') && !pathname?.includes('tickets') ? 'text-[#00AEEF]' : 'text-gray-400'}`}
            >
              <FontAwesomeIcon icon={faUser} className="text-xl" />
              <span className="text-[10px] font-bold">{admin ? 'Profile' : 'Sign In'}</span>
            </button>
          </nav>

          <footer className="bg-[#1f262d] text-white py-16 hidden lg:block">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                <div>
                  <h4 className="font-bold mb-6 text-[16px] text-white">Help</h4>
                  <ul className="space-y-3 text-[14px] text-gray-300">
                    <li><button onClick={() => openExternalLink('/help')} className="hover:text-white transition-colors">Help/FAQ</button></li>
                    <li><button onClick={() => openExternalLink('/sell')} className="hover:text-white transition-colors">Sell</button></li>
                    <li><button onClick={() => openExternalLink('/contact')} className="hover:text-white transition-colors">Contact Us</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-6 text-[16px] text-white">Our Network</h4>
                  <ul className="space-y-3 text-[14px] text-gray-300">
                    <li><button onClick={() => openExternalLink('/livenation')} className="hover:text-white transition-colors">Live Nation</button></li>
                    <li><button onClick={() => openExternalLink('/houseofblues')} className="hover:text-white transition-colors">House of Blues</button></li>
                    <li><button onClick={() => openExternalLink('/frontgatetickets')} className="hover:text-white transition-colors">Front Gate Tickets</button></li>
                    <li><button onClick={() => openExternalLink('/ticketweb')} className="hover:text-white transition-colors">TicketWeb</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-6 text-[16px] text-white">About Us</h4>
                  <ul className="space-y-3 text-[14px] text-gray-300">
                    <li><button onClick={() => openExternalLink('/about')} className="hover:text-white transition-colors">Who We Are</button></li>
                    <li><button onClick={() => openExternalLink('/careers')} className="hover:text-white transition-colors">Careers</button></li>
                    <li><button onClick={() => openExternalLink('/news')} className="hover:text-white transition-colors">UEFA News</button></li>
                    <li><button onClick={() => openExternalLink('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-6 text-[16px] text-white">Friends & Partners</h4>
                  <ul className="space-y-3 text-[14px] text-gray-300">
                    <li><button onClick={() => openExternalLink('/paypal')} className="hover:text-white transition-colors">PayPal</button></li>
                    <li><button onClick={() => openExternalLink('/allianz')} className="hover:text-white transition-colors">Allianz</button></li>
                    <li><button onClick={() => openExternalLink('/aws')} className="hover:text-white transition-colors">AWS</button></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-[12px] text-gray-400">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <p>© 1998-2024 UEFA. All rights reserved.</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
                  <button onClick={() => openExternalLink('/terms-conditions')} className="hover:text-white transition-colors">Terms and conditions</button>
                  <button onClick={() => openExternalLink('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                  <button onClick={() => openExternalLink('/cookie-policy')} className="hover:text-white transition-colors">Cookie Policy</button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
      {!shouldShowHeaderFooter && (
        <div className="pb-[70px] lg:pb-0">
          {children}
          {/* Also show bottom nav on secure account pages for better navigation */}
          {pathname?.startsWith('/secure/myaccount') && (
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-[100] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <Link href="/" className={`flex flex-col items-center space-y-1 ${pathname === '/' ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                <FontAwesomeIcon icon={faHome} className="text-xl" />
                <span className="text-[10px] font-bold">Home</span>
              </Link>
              <Link href="/secure/myaccount/tickets" className={`flex flex-col items-center space-y-1 ${pathname?.startsWith('/secure/myaccount/tickets') ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                <FontAwesomeIcon icon={faTicketAlt} className="text-xl" />
                <span className="text-[10px] font-bold">My Tickets</span>
              </Link>
              <button onClick={() => openExternalLink('/video')} className="flex flex-col items-center space-y-1 text-gray-400">
                <FontAwesomeIcon icon={faHeart} className="text-xl" />
                <span className="text-[10px] font-bold">Video</span>
              </button>
              <button onClick={() => openExternalLink('/news')} className="flex flex-col items-center space-y-1 text-gray-400">
                <FontAwesomeIcon icon={faTag} className="text-xl" />
                <span className="text-[10px] font-bold">News</span>
              </button>
              <Link href="/secure/myaccount/tickets" className={`flex flex-col items-center space-y-1 ${pathname?.startsWith('/secure/myaccount') && !pathname?.includes('tickets') ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                <FontAwesomeIcon icon={faUser} className="text-xl" />
                <span className="text-[10px] font-bold">Profile</span>
              </Link>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
