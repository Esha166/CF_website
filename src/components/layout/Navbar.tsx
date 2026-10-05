"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists or I'll use standard classes

interface SubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  children?: SubItem[];
  isButton?: boolean;
}

interface NavbarProps {
  navItems: NavItem[];
}

const Navbar = ({ navItems }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#134981] rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:rotate-6">CF</div>
          <span className="font-bold text-xl text-[#134981] hidden sm:block">Combine Foundation</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <div key={item.label} className="relative group py-2">
              {item.children ? (
                <>
                  <button className="flex items-center text-gray-700 font-semibold hover:text-[#134981] transition-colors">
                    {item.label}
                    <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-[110]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mt-2">
                      <div className="py-2">
                        {item.children.map((sub) => (
                          <Link 
                            key={sub.label} 
                            href={sub.href}
                            className="flex items-center px-4 py-18 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#134981] transition-colors "
                          >
                            {sub.icon && <span className="mr-3">{sub.icon}</span>}
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : item.isButton ? (
                <Link 
                  href={item.href}
                  className="bg-[#134981] text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition-all"
                >
                  {item.label}
                </Link>
              ) : (
                <Link 
                  href={item.href}
                  className="text-gray-700 font-semibold hover:text-[#134981] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#134981] hover:after:w-full after:transition-all"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-[#134981] hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-3">
              <Link 
                href={item.href}
                className={item.isButton ? "bg-[#134981] text-white px-6 py-3 rounded-xl font-bold text-center" : "text-gray-800 font-bold text-lg"}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-4 flex flex-col gap-3 border-l-2 border-gray-100 pl-4">
                  {item.children.map(sub => (
                    <Link key={sub.label} href={sub.href} className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
