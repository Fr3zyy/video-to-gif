"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VideoToGifConverter() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [video, setVideo] = useState(null);
  const [gif, setGif] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const ffmpegInstance = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpeg(ffmpegInstance);
    }
    load();
  }, []);

  const convertToGif = useCallback(async () => {
    if (!video || !ffmpeg) return;

    setConverting(true);

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(video));

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-t', '10',
        '-ss', '0',
        '-f', 'gif',
        'output.gif'
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const gifUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
      setGif(gifUrl);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setConverting(false);
    }
  }, [video, ffmpeg]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Video to GIF Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <Input type="file" accept="video/*" onChange={handleFileChange} className="mb-4" />
        {video && (
          <video src={video} controls className="w-full mb-4" />
        )}
        {gif && (
          <img src={gif} alt="Converted GIF" className="w-full mb-4" />
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={convertToGif} disabled={!video || converting || !ffmpeg}>
          {converting ? 'Converting...' : 'Convert to GIF'}
        </Button>
        {gif && (
          <Button className="ml-2" onClick={() => window.open(gif, '_blank')}>
            Download GIF
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}