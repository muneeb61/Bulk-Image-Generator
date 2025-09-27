import React from 'react';

interface ImageCardProps {
  imageUrl: string;
  prompt: string;
  index: number;
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.586l-4.293-4.293-1.414 1.414L12 18.414l5.707-5.707-1.414-1.414L12 15.586z" />
    <path d="M12 4v11h-2V4h2z" />
    <path d="M5 20h14v-2H5v2z" />
  </svg>
);


const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, prompt, index }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const safePrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safePrompt}_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative aspect-video overflow-hidden rounded-lg shadow-md bg-gray-dark">
      <img src={imageUrl} alt={prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          title="Download Image"
        >
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ImageCard;
