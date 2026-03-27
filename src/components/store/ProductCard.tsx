import React from 'react';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { detailedCategories } from '../../data/store-categories';

interface ProductCardProps {
    product: Product;
    onAddToCart: (id: string, e: React.MouseEvent) => void;
    onToggleWishlist?: (id: string, e: React.MouseEvent) => void;
    isWishlisted?: boolean;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onToggleWishlist,
    isWishlisted = false,
    className = ''
}) => {
    const navigate = useNavigate();

    // Find category style
    const categoryStyle = detailedCategories.find(c => c.name === product.category) || detailedCategories[0];
    const Icon = categoryStyle.icon;

    const handleCardClick = () => {
        navigate(`/store/product/${product.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                group relative w-full rounded-3xl overflow-hidden 
                bg-white border ${categoryStyle.border}
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer
                flex flex-col
                ${className}
            `}
        >
            {/* Image Section - Top Half (55%) */}
            <div className="h-[55%] w-full relative bg-gray-50 overflow-hidden shrink-0">
                <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {product.isDeal && (
                        <span className={`
                            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm
                            bg-white/90 backdrop-blur-sm ${categoryStyle.color} border border-slate-100
                        `}>
                            <Sparkles className="w-3 h-3" />
                            عرض
                        </span>
                    )}
                    {(product.discount && product.discount > 0) ? (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            -{product.discount}%
                        </span>
                    ) : null}
                </div>

                {/* Wishlist Button - Moved to bottom */}\n
            </div>

            {/* Content Section - Bottom Half (45%) */}
            <div className={`flex-1 w-full p-4 flex flex-col justify-between relative overflow-hidden ${categoryStyle.bg}`}>

                {/* Decorative Background Icon */}
                <Icon className={`
                    absolute -bottom-4 -left-4 w-24 h-24 opacity-5 
                    rotate-12 transition-transform duration-500 
                    group-hover:scale-110 group-hover:rotate-6
                    ${categoryStyle.color}
                `} />

                {/* Header Info */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold opacity-80 ${categoryStyle.color}`}>
                            {product.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-medium text-slate-500 pt-0.5">{product.rating || '4.5'}</span>
                        </div>
                    </div>
                    <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                {/* Price & Action */}
                <div className="relative z-10 flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        {product.originalPrice && (
                            <span className="text-slate-400 text-[10px] line-through">
                                {product.originalPrice.toLocaleString()}
                            </span>
                        )}
                        <span className="text-base font-black text-slate-800">
                            {product.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">د.ع</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => onToggleWishlist && onToggleWishlist(product.id, e)}
                            className={`
                                w-9 h-9 rounded-full flex items-center justify-center 
                                border transition-all duration-300 active:scale-95
                                ${isWishlisted
                                    ? 'bg-rose-50 border-rose-100 text-rose-500'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-rose-100 hover:text-rose-500'
                                }
                            `}
                        >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={(e) => onAddToCart(product.id, e)}
                            className={`
                                w-9 h-9 rounded-full bg-white flex items-center justify-center 
                                shadow-sm hover:shadow-md transition-all active:scale-95
                                ${categoryStyle.color}
                            `}
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
