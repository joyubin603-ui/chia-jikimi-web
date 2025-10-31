import { useState, useEffect } from 'react'
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material'

const guides = [
  '윗니는 45도 각도로!',
  '아랫니 안쪽을 원을 그리며~',
  '혀도 잊지 말고 닦아요!',
  '치실로 마무리하세요!',
]

export default function BrushingTimer({ onComplete, onClose }: { onComplete: () => void; onClose: () => void }) {
  const [seconds, setSeconds] = useState(120)
  const [guideIndex, setGuideIndex] = useState(0)

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds(seconds - 1)
        if (seconds % 30 === 0) setGuideIndex((i) => (i + 1) % guides.length)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      onComplete()
    }
  }, [seconds, onComplete])

  return (
    <Dialog open fullScreen>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd' }}>
        <Typography variant="h3" fontWeight="bold" color="primary">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </Typography>

        <Box sx={{ my: 4, p: 3, bgcolor: 'white', borderRadius: 3, width: '80%', boxShadow: 3 }}>
          <Typography variant="h6" align="center" color="text.secondary">
            {guides[guideIndex]}
          </Typography>
        </Box>

        <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          그만할게요! 
        </Button>
      </DialogContent>
    </Dialog>
  )
}
