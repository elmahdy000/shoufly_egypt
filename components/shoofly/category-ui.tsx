"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiBox, FiArrowLeft, FiStar, FiChevronLeft } from "react-icons/fi";

interface CategoryCardProps {
  id: number;
  name: string;
  count?: number;
  icon?: React.ReactNode;
  image?: string;
  isActive?: boolean;
}

/**
 * 🌟 MAIN CATEGORY CARD
 * Premium, scannable, and visually rich.
 */
export function CategoryCard({ id, name, count = 0, icon, image, isActive }: CategoryCardProps) {
  return (
    <Link href={`/categories/${id}`} className="block group">
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 p-6 ${
          isActive 
            ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
            : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50"
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Icon/Image Container */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isActive ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
          }`}>
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              icon || <FiBox size={24} />
            )}
          </div>

          <div className="space-y-1">
            <h3 className={`font-black text-lg transition-colors ${isActive ? "text-primary" : "text-slate-900 group-hover:text-primary"}`}>
              {name}
            </h3>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              {count} مورد معتمد <FiChevronLeft className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </p>
          </div>
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      </motion.div>
    </Link>
  );
}

/**
 * 💊 SUBCATEGORY PILL
 * Compact, lightweight, horizontal scroll friendly.
 */
export function SubcategoryPill({ name, isActive, onClick }: { name: string; isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
        isActive
          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
          : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      {name}
    </button>
  );
}

/**
 * 🛡️ BRAND CARD
 * Logo-based, premium brand strip item.
 */
export function BrandCard({ name, logo, count }: { name: string; logo?: string; count?: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="shrink-0 w-32 md:w-40 flex flex-col items-center gap-3 group cursor-pointer"
    >
      <div className="w-full aspect-square bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all">
        {logo ? (
          <img src={logo} alt={name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 font-black text-xl">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{name}</p>
        {count !== undefined && <p className="text-[10px] font-bold text-slate-400 mt-0.5">{count} قطعة متوفرة</p>}
      </div>
    </motion.div>
  );
}

/**
 * 📦 CATEGORY GRID CONTAINER
 */
export function CategoryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

/**
 * ⬅️ HORIZONTAL SCROLL CONTAINER
 */
export function HorizontalScroll({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="space-y-4">
      {label && <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{label}</h4>}
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 -mx-2 px-2 snap-x">
        {children}
      </div>
    </div>
  );
}
