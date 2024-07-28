"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function VideoToGifConverter() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [video, setVideo] = useState(null);
  const [gif, setGif] = useState(null);
  const [converting, setConverting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);

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

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setVideoDuration(videoRef.current.duration);
        setEndTime(Math.min(10, videoRef.current.duration));
      });
    }
  }, [video]);

  const convertToGif = useCallback(async () => {
    if (!video || !ffmpeg) return;

    setConverting(true);

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(video));

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', (endTime - startTime).toString(),
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
  }, [video, ffmpeg, startTime, endTime]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Video to GIF Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <Input type="file" accept="video/*" onChange={handleFileChange} className="mb-4" />
        {video && (
          <>
            <video ref={videoRef} src={video} controls className="w-full mb-4" />
            <div className="mb-4">
              <Label className="block mb-2">Start Time: {formatTime(startTime)}</Label>
              <Slider
                min={0}
                max={Math.max(0, videoDuration - 0.1)}
                step={0.1}
                value={[startTime]}
                onValueChange={(value) => {
                  setStartTime(value[0]);
                  handleSeek(value[0]);
                }}
              />
            </div>
            <div className="mb-4">
              <Label className="block mb-2">End Time: {formatTime(endTime)}</Label>
              <Slider
                min={startTime + 0.1}
                max={videoDuration}
                step={0.1}
                value={[endTime]}
                onValueChange={(value) => {
                  setEndTime(value[0]);
                  handleSeek(value[0]);
                }}
              />
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Selected Duration: {formatTime(endTime - startTime)}
            </div>
          </>
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