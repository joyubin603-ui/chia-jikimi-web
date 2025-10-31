import { useState, useEffect } from 'react'
import { Container, Typography, Button, Stack, Chip, Alert } from '@mui/material'
import BrushingTimer from './components/BrushingTimer'
import TipsSection from './components/TipsSection'
import RewardPopup from './components/RewardPopup'
import { getPoints, addPoints } from './utils/storage'

function App() {
  const [points, setPoints] = useState(0)
  const [showTimer, setShowTimer] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [lastReward, setLastReward] = useState(0)

 useEffect(() => {
  // async 함수 안에서 await 사용
  const loadPoints = async () => {
    const savedPoints = await getPoints()
    setPoints(savedPoints)
  }
  loadPoints()

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])

  const handleBrushingComplete = () => {
    const reward = 10 + Math.floor(Math.random() * 5)
    addPoints(reward)
    setPoints(getPoints())
    setLastReward(reward)
    setShowReward(true)
    setShowTimer(false)

    if (Notification.permission === 'granted') {
      new Notification('치아지킴이', {
        body: `양치 완료! +${reward} 포인트 적립 🎉`,
        icon: '/tooth-icon.png',
      })
    }
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ pt: 4, textAlign: 'center', fontFamily: 'Noto Sans KR' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>치아지킴이 웹</Typography>

        <Chip label={`포인트: ${points}점`} color="primary" sx={{ fontSize: 20, py: 2, mb: 3 }} />

        <Stack spacing={3}>
          <Button variant="contained" size="large" onClick={() => setShowTimer(true)} sx={{ py: 2, fontSize: 18 }}>
            양치 시작하기 (3분 타이머)
          </Button>

          <Button variant="outlined" size="large" onClick={() => window.open('https://www.kda.or.kr', '_blank')}>
            한국치과협회 팁 보기
          </Button>

          <TipsSection />
        </Stack>

        <Alert severity="info" sx={{ mt: 3 }}>
          설치 없이 브라우저에서 바로 사용 가능!<br />
          <strong>크롬 → "홈 화면에 추가"</strong> 하면 앱처럼 쓸 수 있어요!
        </Alert>
      </Container>

      {showTimer && (
        <BrushingTimer onComplete={handleBrushingComplete} onClose={() => setShowTimer(false)} />
      )}

      <RewardPopup open={showReward} points={lastReward} onClose={() => setShowReward(false)} />
    </>
  )
}

export default App
