import React from 'react';
import { getColorLegendData } from './map-utils';

export const CrimeSeverityLegend: React.FC = () => {
  const legendData = getColorLegendData();

  return (
    <div className="py-2 px-4 bg-white border-t">
      <h4 className="text-sm font-semibold mb-2 text-gray-800">Crime Intensity Legend</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
        {legendData.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 py-1 px-2 rounded bg-gray-50">
            <div 
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-700">{item.range}</span>
              <span className="text-gray-500 text-[10px]">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
