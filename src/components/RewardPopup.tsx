import { Dialog, DialogContent, Typography, Button } from '@mui/material'
import Confetti from 'react-confetti'

export default function RewardPopup({ open, points, onClose }: { open: boolean; points: number; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}>
      {open && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      <DialogContent sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h4">🎉</Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom>양치 완료!</Typography>
        <Typography variant="h6" color="primary">+{points} 포인트 적립</Typography>
        <Button variant="contained" onClick={onClose} sx={{ mt: 3 }}>확인</Button>
      </DialogContent>
    </Dialog>
  )
}
