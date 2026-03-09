import React from 'react';
import { Calendar, User, Clock, ChevronLeft, BookOpen, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { formatNumericDate } from '../../lib/date';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link to={`/article/${article.id}`} className="block h-full group">
      <div className="h-full bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 flex flex-col relative">

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-50">
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 z-10" />

          {/* Image or Placeholder */}
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors duration-500">
              <BookOpen className="w-10 h-10 text-gray-300 group-hover:text-blue-500/50 transition-colors duration-300" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4 z-20">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-bold text-gray-800 rounded-full shadow-sm border border-gray-100">
              {article.category}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatNumericDate(article.date || new Date().toISOString())}</span>
            </div>
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>5 دقائق</span>
              </div>
            </>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Footer / Action */}
          <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 flex items-center gap-1 group/btn group-hover:text-blue-600 transition-colors">
              اقرأ المزيد
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-1" />
            </span>

            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
