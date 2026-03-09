import React from 'react';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArticles } from '../../hooks/useArticles';
import { ArticleCard } from '../cards/ArticleCard';

export const EducationalArticles: React.FC = () => {
  const { articles, loading } = useArticles();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold mb-4">
            <BookOpen className="w-5 h-5 ml-2" />
            مقالات تعليمية
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            تعلم المزيد عن صحة أسنانك
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            مقالات ونصائح من خبراء الأسنان لمساعدتك في الحفاظ على ابتسامة صحية
          </p>
        </div>

        {/* Articles Horizontal Scroll */}
        <div className="relative mb-12">
          {loading ? (
            <div className="flex gap-6 overflow-hidden pb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 sm:w-80 h-96 bg-gray-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {articles.map((article) => (
                <div key={article.id} className="flex-shrink-0 w-72 sm:w-80 h-[420px]">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/services#tab-articles">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              عرض جميع المقالات
            </button>
          </Link>
        </div>


      </div>
    </section>
  );
};
