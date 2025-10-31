import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const guides = ['윗니 45도!', '아랫니 원 그리기!', '혀 닦기!', '치실 마무리!'];

interface Props {
  onComplete: (brushedWell: boolean) => void;
  onClose: () => void;
}

export default function BrushingTimer({ onComplete, onClose }: Props) {
  const [seconds, setSeconds] = useState(120);
  const [guideIndex, setGuideIndex] = useState(0);
  const [model, setModel] = useState<any>(null);
  const [motionDetected, setMotionDetected] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadModel();
    setupCamera();
    intervalRef.current = setInterval(() => {
      if (seconds > 0) {
        setSeconds(s => s - 1);
        setGuideIndex(i => (i + 1) % guides.length);
        detectMotion();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete(motionDetected > 80);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, motionDetected, onComplete]);

  const loadModel = async () => {
    await tf.setBackend('webgl');
    await tf.ready();
    const loadedModel = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    setModel(loadedModel);
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('카메라 접근 실패:', err);
    }
  };

  const detectMotion = async () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const predictions = await model.estimateFaces(videoRef.current);
    if (predictions.length > 0) {
      const landmarks = predictions[0].keypoints;
      const noseY = landmarks[1].y;
      const chinY = landmarks[152].y;
      const mouthDist = Math.abs(noseY - chinY);
      if (mouthDist > 0.05) {
        setMotionDetected(m => Math.min(m + 1, 120));
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = 'red';
        const radius = 2;
        const startAngle = 0;
        const endAngle = 2 * Math.PI;
        landmarks.forEach((point: any) => {
          ctx.beginPath();
          ctx.arc(
            point.x,
            point.y,
            radius,
            startAngle,
            endAngle
          );
          ctx.fill();
        });
      }
    }
  };

  return (
    <Dialog open fullScreen>
      <DialogContent sx={{ 
        bgcolor: '#E8F5E8', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 2 
      }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          🪥 양치 타이머
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {Math.floor(seconds / 60)}:{seconds % 60.toString().padStart(2, '0')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {guides[guideIndex]}
        </Typography>
        
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mb: 3 }}>
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline 
            style={{ width: '100%', borderRadius: 10, border: '2px solid #4CAF50' }} 
          />
          <canvas 
            ref={canvasRef}
            width={640} 
            height={480} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              opacity: 0.7, 
              borderRadius: 10 
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>움직임 감지: {Math.round((motionDetected / 120) * 100)}%</Typography>
          <CircularProgress variant="determinate" value={motionDetected} color="primary" />
        </Box>
        
        <Button 
          variant="outlined" 
          onClick={onClose} 
          sx={{ mt: 3, borderRadius: 20 }} 
          size="large"
        >
          중단하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
