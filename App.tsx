import React, { useState, useCallback } from 'react';
import { AspectRatio, GeneratedImageSet } from './types';
import { extractPromptsFromScript, generateImages } from './services/geminiService';
import Loader from './components/Loader';
import ImageGrid from './components/ImageGrid';

const SCRIPT_PLACEHOLDER = `SCENE START
INT. COFFEE SHOP - DAY

A trendy coffee shop, sunlight streaming through the windows.
JANE (30s), focused, types on her laptop.
A steaming mug of latte sits beside her.

SCENE START
EXT. CITY STREET - NIGHT

Rain-slicked streets reflect neon signs.
MARK (40s), in a trench coat, looks up at a tall skyscraper, a determined look on his face.
The city buzzes around him.
`;

const App: React.FC = () => {
  const [script, setScript] = useState<string>(SCRIPT_PLACEHOLDER);
  const [imageStyle, setImageStyle] = useState<string>('Cinematic, photorealistic, 4k, epic lighting');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [numImages, setNumImages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageSet[]>([]);

  const aspectRatios: AspectRatio[] = ["16:9", "1:1", "9:16", "4:3", "3:4"];

  const handleGenerate = useCallback(async () => {
    if (!script.trim() || !imageStyle.trim()) {
      setError('Script and Image Style prompts cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    
    try {
      setStatusMessage('Analyzing script and extracting prompts...');
      const prompts = await extractPromptsFromScript(script);

      if (!prompts || prompts.length === 0) {
        throw new Error("Could not extract any prompts from the script. Please check the script format.");
      }
      
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        setStatusMessage(`Generating images for prompt ${i + 1} of ${prompts.length}: "${prompt}"`);
        
        const images = await generateImages(prompt, imageStyle, numImages, aspectRatio);
        
        setGeneratedImages(prev => [...prev, { prompt, images }]);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [script, imageStyle, numImages, aspectRatio]);

  return (
    <div className="min-h-screen bg-gray-dark text-text-primary font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
            Bulk Image Generator
          </h1>
          <p className="text-text-secondary mt-2 text-lg">Turn your script scenes into stunning visuals, instantly.</p>
        </header>

        <div className="bg-gray-medium p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-light mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label htmlFor="script" className="block text-lg font-semibold mb-2 text-text-secondary">
                1. Paste Your Script
              </label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder={SCRIPT_PLACEHOLDER}
                className="w-full h-80 p-4 bg-gray-dark border border-gray-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-text-primary resize-y"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="imageStyle" className="block text-lg font-semibold mb-2 text-text-secondary">
                  2. Define Image Style
                </label>
                <input
                  type="text"
                  id="imageStyle"
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  placeholder="e.g., Cinematic, photorealistic, 4k"
                  className="w-full p-3 bg-gray-dark border border-gray-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-text-primary"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="aspectRatio" className="block text-lg font-semibold mb-2 text-text-secondary">
                  3. Select Aspect Ratio
                </label>
                <select
                  id="aspectRatio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full p-3 bg-gray-dark border border-gray-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-text-primary"
                  disabled={isLoading}
                >
                  {aspectRatios.map(ratio => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="numImages" className="block text-lg font-semibold mb-2 text-text-secondary">
                  4. Images per Prompt
                </label>
                <input
                  type="number"
                  id="numImages"
                  value={numImages}
                  onChange={(e) => setNumImages(Math.max(1, parseInt(e.target.value, 10)))}
                  min="1"
                  max="4"
                  className="w-full p-3 bg-gray-dark border border-gray-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-text-primary"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Generating...' : 'Generate Images'}
            </button>
          </div>
        </div>

        {isLoading && <Loader message={statusMessage} />}
        
        {error && <div className="text-center p-4 bg-red-900 border border-red-700 text-white rounded-lg">{error}</div>}

        {!isLoading && generatedImages.length > 0 && <ImageGrid imageSets={generatedImages} />}
      </main>
    </div>
  );
};

export default App;
