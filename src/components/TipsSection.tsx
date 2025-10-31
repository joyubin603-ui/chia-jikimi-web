import { Box, Typography, Paper } from '@mui/material'

export default function TipsSection() {
  const tips = [
    '하루 3번, 식후 3분 이내 양치하세요.',
    '치실과 구강세정제로 충치 예방!',
    '한국 치과협회 추천: 6개월마다 검진.',
    '매운 김치 후엔 부드럽게 양치!'
  ]

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>구강 건강 팁</Typography>
      {tips.map((tip, i) => (
        <Paper key={i} sx={{ p: 2, mb: 1, textAlign: 'left' }}>
          <Typography variant="body2">{tip}</Typography>
        </Paper>
      ))}
    </Box>
  )
}
