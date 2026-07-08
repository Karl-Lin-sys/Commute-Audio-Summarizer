import { useState } from 'react';
import { Headphones, Loader2, Play, AlertCircle } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/summarize-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      if (data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        setAudioUrl(audioSrc);
      } else {
        throw new Error('No audio returned from server');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Commute Audio Summarizer</h1>
          </div>
          <p className="text-slate-500">
            Paste a news article below, and get a personalized audio summary ready for your commute.
          </p>
        </header>

        <main className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="article" className="text-sm font-medium text-slate-700">
              News Article Text
            </label>
            <textarea
              id="article"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full text of your news article here..."
              className="w-full min-h-[240px] p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y transition-colors"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={!text.trim() || loading}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Summary...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Create Audio Summary</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {audioUrl && (
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-medium">Your Audio Summary</h2>
              <audio controls className="w-full" autoPlay>
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
