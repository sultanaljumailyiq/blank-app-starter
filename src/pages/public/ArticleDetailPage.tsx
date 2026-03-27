import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Clock, Calendar, Copy, Twitter, Facebook, Linkedin, BookOpen, Quote } from 'lucide-react';
import { useArticle, useArticles } from '../../hooks/useArticles';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { formatNumericDate } from '../../lib/date';

export const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { article, loading, error } = useArticle(id || '');
  const { articles } = useArticles();
  const { clinics } = usePublicClinics();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return null; // Use a skeleton screen in real app
  if (error || !article) return null; // Or 404 page

  const relatedArticles = articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  const featuredClinics = clinics.filter(c => c.settings?.articleSuggestions === true).slice(0, 3);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Progress Bar (Optional) */}
      <div className="fixed top-0 left-0 h-1 bg-blue-600 z-50 w-full origin-left transform scale-x-0" id="progress-bar" />

      {/* Navigation & Actions Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <button
            onClick={() => navigate('/services#tab-articles')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl pt-12 md:pt-16">

        {/* Article Meta Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {article.category}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 border-y border-gray-100 py-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatNumericDate(article.date || new Date().toISOString())}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 دقائق قراءة</span>
            </div>
          </div>
        </div>

        {/* Featured Image (if exists) */}
        {article.image && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
            <img src={article.image} alt={article.title} className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Excerpt */}
        <div className="relative mb-12">
          <div className="absolute right-0 top-0 text-blue-100 -mr-8 -mt-8">
            <Quote className="w-24 h-24 opacity-20" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed relative z-10">
            {article.excerpt}
          </p>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg prose-blue max-w-none text-gray-600 leading-loose prose-headings:font-bold prose-headings:text-gray-900 mb-20">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Author / Source Box */}
        <div className="bg-blue-50/50 rounded-3xl p-8 mb-20 flex items-start gap-6 border border-blue-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">المصدر العلمي</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              تمت مراجعة هذا المقال من قبل فريق من أطباء الأسنان المتخصصين لضمان دقة المعلومات الطبية الواردة فيه.
              المعلومات المقدمة هي للأغراض التعليمية فقط ولا تغني عن استشارة الطبيب.
            </p>
          </div>
        </div>

        {/* Suggested Clinics (Simple List) */}
        {featuredClinics.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">عيادات مقترحة</h3>
              <Link to="/services" className="text-sm font-medium text-blue-600 hover:text-blue-700">عرض الكل</Link>
            </div>
            {/* Horizontal Scroll Layout for Suggested Clinics */}
            <div className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 -mx-4 px-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {featuredClinics.map(clinic => (
                <div key={clinic.id}>
                  <ClinicCard clinic={clinic} expandable={true} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Related Articles Footer */}
      {relatedArticles.length > 0 && (
        <div className="bg-gray-50 py-20 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">مقالات ذات صلة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedArticles.map(a => (
                <div key={a.id} className="h-[400px]">
                  <ArticleCard article={a} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
