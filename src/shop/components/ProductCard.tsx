import React from "react";
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }: { product: any }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group bg-white rounded-[2rem] p-3 border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-500 cursor-pointer"
    >
      {/* 📸 Image Container - Changed aspect from 4/5 to square for shorter height */}
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-slate-100">
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs font-bold uppercase">
            No Image
          </div>
        )}
        
        {/* Badge - Scaled down slightly */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-tighter text-slate-900">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* 📝 Details Section - Compact spacing */}
      <div className="mt-4 px-1 pb-1">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <h3 className="text-lg font-bold text-slate-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">
              {product.sub_category_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-indigo-600">
              ${product.base_price}
            </p>
          </div>
        </div>

        {/* 🔗 Footer - Reduced height and margin */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
            Customize Now
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-all group-hover:translate-x-1">
            <MoveRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;