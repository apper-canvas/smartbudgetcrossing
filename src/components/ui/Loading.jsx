import React from "react";
import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "default" }) => {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/4" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-200 to-primary-300 rounded-xl animate-pulse" />
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-4 w-1/3" />
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-4 w-1/3" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-pulse" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">Loading...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;