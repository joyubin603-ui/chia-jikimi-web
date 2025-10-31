import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const guides = ['윗니 45도!', '아랫니 원 그리기!', '혀 닦기!', '치실 마무리!'];

export default function BrushingTimer({ onComplete, onClose }: { onComplete: (brushedWell: boolean) => void; onClose: () => void }) {
  const [seconds, setSeconds] = useState(120);
  const [guideIndex, setGuideIndex] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<any>(null);
  const [motionDetected, setMotionDetected] = useState(0);  // 움직임 카운트
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadModel();
    setupCamera();
    intervalRef.current = setInterval(() => {
      if (seconds > 0) {
        setSeconds(s => s - 1);
        setGuideIndex(i => (i + 1) % guides.length);
        detectMotion();
      } else {
        clearInterval(intervalRef.current);
        onComplete(motionDetected > 80);  // 80% 이상 움직이면 "잘함"
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const loadModel = async () => {
    await tf.ready();
    const loadedModel = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
    setModel(loadedModel);
  };

  const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    if (videoRef) videoRef.srcObject = stream;
  };

  const detectMotion = async () => {
    if (!model || !videoRef || !canvasRef) return;
    const predictions = await model.estimateFaces(videoRef);
    if (predictions.length > 0) {
      // 입 랜드마크 (예: 코와 턱 거리 변화로 움직임 감지 – 간단 로직)
      const landmarks = predictions[0].keypoints;
      const mouthDist = Math.abs(landmarks[13].y - landmarks[9].y);  // 입 위아래
      if (mouthDist > 0.02) {  // 임계값
        setMotionDetected(m => Math.min(m + 1, 120));
      }
      // 캔버스에 그리기 (피드백용)
      const ctx = canvasRef.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.width, canvasRef.height);
      ctx?.drawImage(videoRef, 0, 0);
      landmarks.forEach(point => {
        ctx?.beginPath();
        ctx?.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx?.fillStyle = 'red';
        ctx?.fill();
      });
    }
  };

  return (
    <Dialog open fullScreen>
      <DialogContent sx={{ bgcolor: '#E8F5E8', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h4" color="primary">타이머: {Math.floor(seconds / 60)}:{seconds % 60.toString().padStart(2, '0')}</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>{guides[guideIndex]}</Typography>
        
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <video ref={setVideoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: 10 }} />
          <canvas ref={setCanvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.7 }} />
        </Box>
        
        <Typography>움직임 감지: {Math.round((motionDetected / 120) * 100)}%</Typography>
        <CircularProgress variant="determinate" value={motionDetected} sx={{ mt: 2 }} />
        
        <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>중단</Button>
      </DialogContent>
    </Dialog>
  );
}
