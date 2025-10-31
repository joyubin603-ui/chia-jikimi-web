import { useState, useEffect } from 'react';
import { Container, Typography, Button, Stack, Chip, Alert, Card, CardContent, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FaTooth, FaChartLine, FaTrophy } from 'react-icons/fa';
import BrushingTimer from './components/BrushingTimer';
import TipsSection from './components/TipsSection';
import RewardPopup from './components/RewardPopup';
import { Line } from 'react-chartjs-2';
import { getPoints, addPoints, getBadges } from './utils/storage';  // 배지 로직 추가

// 예쁜 테마: 민트/화이트 치아 테마
const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' },  // 민트 그린
    secondary: { main: '#FFEB3B' },  // 옐로우 (치아 느낌)
    background: { default: '#F1F8E9' },  // 라이트 그린
  },
  typography: {
    fontFamily: 'Noto Sans KR, sans-serif',
  },
});

function App() {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [pointHistory, setPointHistory] = useState<number[]>([]);  // 그래프용

  useEffect(() => {
    loadData();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadData = async () => {
    const savedPoints = await getPoints();
    const badgeList = await getBadges();
    setPoints(savedPoints);
    setBadges(badgeList);
    // 더미 히스토리 (실제론 localforage에서 불러와)
    setPointHistory([0, 10, 25, 45, 60, 80, 100]);
  };

  const handleBrushingComplete = async (brushedWell: boolean) => {
    const reward = brushedWell ? 15 + Math.floor(Math.random() * 10) : 5;  // 잘 닦으면 보너스
    await addPoints(reward);
    if (points + reward >= 100 && !badges.includes('gold')) {
      // 배지 unlock
      badges.push('gold');
      await localforage.setItem('badges', badges);
    }
    const newPoints = await getPoints();
    setPoints(newPoints);
    setLastReward(reward);
    setShowReward(true);
    setShowTimer(false);

    if (Notification.permission === 'granted') {
      new Notification('치아지킴이', {
        body: `양치 완료! +${reward}포인트 (잘했어요! 🎉)`,
        icon: '/tooth-icon.png',
      });
    }
  };

  // 포인트 그래프 데이터
  const chartData = {
    labels: ['1일', '2일', '3일', '4일', '5일', '6일', '7일'],
    datasets: [{ label: '포인트', data: pointHistory, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)' }],
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ pt: 2, pb: 4 }}>
        <Typography variant="h3" fontWeight="bold" align="center" sx={{ mb: 2, color: '#4CAF50' }}>
          🦷 <FaTooth /> 치아지킴이 웹
        </Typography>

        {/* 포인트 대시보드 */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Chip label={`총 포인트: ${points}점`} color="primary" variant="filled" sx={{ fontSize: 18 }} />
              </Grid>
              <Grid item xs={4}>
                <FaTrophy color="#FFEB3B" size={30} />
                <Typography variant="body2">배지: {badges.length}</Typography>
              </Grid>
            </Grid>
            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<FaTooth />}
            onClick={() => setShowTimer(true)}
            sx={{ py: 2, fontSize: 18, borderRadius: 20 }}
          >
            🪥 양치 시작 (카메라 체크!)
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => window.open('https://map.kakao.com/', '_blank')}
            startIcon={<FaChartLine />}
          >
            가까운 치과 찾기
          </Button>

          <TipsSection />
        </Stack>

        <Alert severity="success" sx={{ mt: 3, borderRadius: 10 }}>
          <strong>PWA 완벽!</strong> 크롬에서 "홈 화면 추가" 해보세요. 오프라인도 돼요!
        </Alert>
      </Container>

      {showTimer && <BrushingTimer onComplete={handleBrushingComplete} onClose={() => setShowTimer(false)} />}
      <RewardPopup open={showReward} points={lastReward} onClose={() => setShowReward(false)} />
    </ThemeProvider>
  );
}

export default App;
