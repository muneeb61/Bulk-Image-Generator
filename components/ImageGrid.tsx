import React from 'react';
import { GeneratedImageSet } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  imageSets: GeneratedImageSet[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ imageSets }) => {
  return (
    <div className="space-y-12">
      {imageSets.map((set, setIndex) => (
        <div key={setIndex} className="bg-gray-medium p-6 rounded-xl shadow-lg border border-gray-light">
          <h2 className="text-xl font-semibold mb-4 text-text-secondary">
            <span className="font-bold text-brand-secondary">Prompt:</span> {set.prompt}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {set.images.map((imageUrl, imgIndex) => (
              <ImageCard 
                key={imgIndex} 
                imageUrl={imageUrl} 
                prompt={set.prompt} 
                index={imgIndex} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
