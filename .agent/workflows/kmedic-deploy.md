---
description: Git 커밋 및 푸시 (GitHub Pages 자동 배포)
---

1. 변경 사항 확인
// turbo
```bash
cd /Users/dongjae/antigravity/k-medicine-dictionary && git status
```

2. 전체 스테이징
```bash
cd /Users/dongjae/antigravity/k-medicine-dictionary && git add -A
```

3. 커밋 (메시지는 상황에 맞게 수정)
```bash
cd /Users/dongjae/antigravity/k-medicine-dictionary && git commit -m "update"
```

4. 푸시 (GitHub Pages 자동 배포 트리거)
```bash
cd /Users/dongjae/antigravity/k-medicine-dictionary && git push origin main
```
