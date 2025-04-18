import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const uploadVideo = async () => {
    if (!file) {
      alert('لطفاً لومړی یو فایل انتخاب کړئ');
      return;
    }
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUrl(data.url);
    } catch (err) {
      alert('اپلوډ کې ستونزه: ' + err.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">فلم اپلوډ کړئ</h1>
      <input
        type="file"
        accept="video/*"
        onChange={e => setFile(e.target.files[0])}
        className="border p-2 w-full"
      />
      <button
        onClick={uploadVideo}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        اپلوډ
      </button>

      {url && (
        <div className="mt-4">
          <p>اپلوډ بشپړ شو! لینک:</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 break-all"
          >
            {url}
          </a>
        </div>
      )}
    </div>
  );
}
