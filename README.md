# GPU PageRank 알고리즘 추천 시스템 🚀

## 프로젝트 개요

**과목**: 캡스톤설계및실습  
**팀번호**: 4  
**소속**: 한국외국어대학교 컴퓨터공학부  
**프로젝트명**: GPU 기반 분산 웹 PageRank 알고리즘 추천 시스템 개발  

본 프로젝트는 실제 GPU 실험 결과를 바탕으로 다양한 그래프 데이터셋의 특성을 분석하여 최적의 GPU 기반 PageRank 알고리즘을 추천하는 웹 기반 시스템을 개발하였습니다.

## 🎯 프로젝트 목표

- **실험 기반 알고리즘 추천**: 실제 GPU 성능 측정 결과를 바탕으로한 정확한 추천
- **데이터셋 특성 분석**: 그래프 크기, 밀도, 방향성, 수렴 정밀도를 종합 고려
- **성능 예측 및 비교**: MTEPS, 실행시간, 수렴율 등 상세 성능 지표 제공
- **사용자 친화적 인터페이스**: 직관적인 웹 UI를 통한 쉬운 접근성
- **최신 연구 반영**: 2024-2025년 최신 GPU PageRank 연구 결과 완전 적용

## 🔧 기술 스택

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** - 반응형 스타일링
- **Vite** - 고속 빌드 도구
- **shadcn/ui** - 모던 UI 컴포넌트 라이브러리

### 개발 환경
- **Node.js** 18+
- **npm** 또는 **yarn**

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/pagerank-recommendation-system.git
cd pagerank-recommendation-system
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저에서 확인
```
http://localhost:5173
```

### 5. 빌드 (배포용)
```bash
npm run build
```

## 🚀 주요 기능

### 📊 실험 검증된 데이터셋 지원
- **8개 실제 측정 데이터셋**
  - **Pokec**: 1,632K 노드, 30.6M 엣지 - Gunrock 1,077 MTEPS 측정
  - **LiveJournal**: 4.8M 노드, 69M 엣지 - cuGraph 0.64초 측정
  - **Orkut**: 3M 노드, 117M 엣지 - Hessen 20회 vs Power 775회 측정
  - **Twitter-2010**: 41.6M 노드, 1.47B 엣지 - 4분할 파티셔닝 1,060+ MTEPS
  - **StackOverflow**: 2.6M 노드, 63.5M 엣지 - 1,029 MTEPS 측정
  - **WikiTalk**: 2.4M 노드, 5M 엣지 - 저밀도 2.10 엣지/노드 특성
  - **UK-2005**: 39.5M 노드, 936M 엣지 - 522 MTEPS 대용량 측정
  - **Slashdot0902**: 82K 노드, 948K 엣지 - Hessen 12회 vs Power 825회

- **사용자 정의 데이터셋 입력**
  - 노드 수, 엣지 수 자유 설정
  - 유향/무향 그래프 선택 (유향 1.7배 성능 향상 적용)
  - 수렴 정밀도 설정 (1e-4 ~ 1e-10)
  - GPU 메모리 한계 설정 (실험 환경: 20GB 기준)

### 🤖 15개+ 실험 검증 알고리즘 지원

#### 최신 고성능 알고리즘 (실험 측정)
- **Dynamic Frontier PageRank (DF-P)**: Twitter-2010에서 Gunrock 대비 5.9배, Hornet 대비 31배 성능 향상 측정
- **Static PageRank (Push-Pull)**: Gunrock 기반 GPU 최적화, 선형 확장성 확인
- **Monte Carlo PageRank**: 메모리 절약형, 대용량 그래프 근사 해법

#### 실험 검증된 수치해석 방법
- **Hessen Method**: Slashdot(12회), Orkut(20회) 최소 반복 수렴 실험 확인
- **Gauss-Seidel Method**: Power Method 대비 40-45% 빠른 수렴 실험 결과
- **Power Method**: cuGraph LiveJournal 0.64초, 안정적 수렴 확인
- **Aitken Extrapolation**: 가속화 기법

#### Krylov 부공간 방법 (안정성 검증)
- **GMRES**: 비대칭 행렬 특화, 고정밀도 추천
- **BiCGStab**: 메모리 효율성과 안정적 수렴 균형
- **Weighted Arnoldi**: 실험에서 대규모 그래프 수렴 불안정성 확인

#### 특수 최적화 알고리즘
- **HITS Algorithm**: Hub/Authority 구분, 무향 그래프 추가 고려
- **Distributed Block-Jacobi**: 극대규모 그래프 분산 처리용
- **Reduced Precision PageRank**: NVIDIA V100에서 30% 성능 향상

### 🎯 실험 기반 지능적 추천 시스템
- **그래프 크기별 세밀한 최적화**: 100K/1M/10M/50M+ 노드 구간별 최적 알고리즘
- **밀도 기반 선택**: 실험 결과 기반 고/중/저밀도 그래프별 최적 알고리즘
- **메모리 제약 정확한 고려**: 엣지당 0.025KB 실험 결과 기반 파티셔닝 전략
- **정밀도 요구사항**: 오차 허용도에 따른 수렴율 조정
- **방향성 성능 차이**: 유향/무향 그래프 1.73배 성능 차이 반영

### 📈 상세 성능 분석 기능
- **실험 기반 성능 예측**: MTEPS, 실행시간, 수렴 반복 횟수
- **테이블 형태 결과 비교**: 모든 데이터셋 한눈에 비교
- **실험 근거 제시**: 각 추천의 구체적 실험 결과 인용
- **대안 알고리즘 제시**: 상황별 다양한 선택지와 성능 비교
- **파티셔닝 전략**: Twitter-2010 4분할 성공 사례 기반 전략 제시

## 📁 프로젝트 구조

```
pagerank-recommendation-system/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── ui/            # shadcn/ui 컴포넌트
│   │   │   ├── card.tsx   # Card 컴포넌트
│   │   │   └── alert.tsx  # Alert 컴포넌트
│   │   └── PageRankRecommendationSystem.tsx  # 메인 추천 시스템
│   ├── lib/               # 유틸리티 함수
│   │   └── utils.ts       # 공통 유틸리티
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── main.tsx           # 엔트리 포인트
│   └── index.css          # 글로벌 스타일
├── package.json
├── tailwind.config.js     # Tailwind 설정
├── tsconfig.json          # TypeScript 설정
├── vite.config.ts         # Vite 설정
└── README.md
```

## 🔬 실험 결과 기반 알고리즘 선택 로직

### 그래프 크기별 추천 기준 (실험 검증)
- **< 100K 노드**: Hessen Method (Slashdot 12회 수렴) / Power Method (cuGraph 편의성)
- **100K ~ 1M**: 밀도별 세분화 - Gauss-Seidel(고밀도) / BiCGStab(중밀도) / Hessen(저밀도)
- **1M ~ 10M**: Static PageRank (Pokec/LiveJournal 1,000+ MTEPS) / Monte Carlo (메모리 제약시)
- **10M ~ 50M**: DF-P (Twitter-2010 1,060+ MTEPS) / 파티셔닝 전략
- **> 50M**: Distributed Block-Jacobi (분산 처리 필수)

### 특수 조건별 최적화 (실험 확인)
- **고정밀도 요구 (<1e-7)**: Hessen Method / GMRES (최소 반복)
- **메모리 제약**: Monte Carlo / Reduced Precision (V100 30% 향상)
- **고밀도 그래프 (>30 엣지/노드)**: Gauss-Seidel (40-45% 수렴 개선)
- **무향 그래프**: 1.73배 성능 저하 고려, HITS Algorithm 추가
- **동적 그래프**: DF-P 필수 적용

## 📊 실험 기반 성능 예측 모델

시스템은 다음 실제 측정 결과를 바탕으로 성능을 예측합니다:

### GPU 성능 측정 결과 (NVIDIA 20GB GPU)
- **DF-P PageRank**: Twitter-2010에서 Hornet 대비 31배, Gunrock 대비 5.9배 향상 실측
- **Hessen vs Power**: Slashdot(12회 vs 825회), Orkut(20회 vs 775회) 실험 비교
- **Gauss-Seidel**: Power Method 대비 40-45% 반복 횟수 감소 확인
- **유향/무향 성능차**: 실험에서 1.73배 차이 측정
- **메모리 사용량**: 엣지당 평균 0.025KB 일관성 확인
- **파티셔닝 효과**: Twitter-2010 4분할로 메모리 한계 극복, 1,060+ MTEPS 유지

### 구체적 실험 데이터
| 데이터셋 | MTEPS | 실행시간 | 메모리(GB) | 특이사항 |
|---------|-------|---------|-----------|---------|
| Pokec | 1,077 | 8.41초 | 0.80 | 중규모 소셜 |
| LiveJournal | 1,032 | 18.83초 (Gunrock) / 0.64초 (cuGraph) | 1.68 | 라이브러리별 차이 |
| Twitter-2010 | 1,060+ | 110초대 (파트별) | 8.5 (파트별) | 4분할 성공 |
| UK-2005 | 522 | 1,792ms | 21.5 | 대용량 웹그래프 |

## 🎨 사용자 인터페이스

### 1. 데이터셋 선택
- **실험 검증된 데이터셋**: 8개 실제 측정 데이터셋과 상세 실험 결과 표시
- **사용자 정의 입력**: 노드/엣지 수, 방향성, 정밀도, 메모리 한계 설정
- **다중 선택**: 여러 데이터셋 동시 비교 분석

### 2. 실험 기반 추천 결과
- **성능 지표 테이블**: MTEPS, 실행시간, 수렴율, 메모리 사용량
- **실험 근거 명시**: 각 추천의 구체적 실험 결과 인용
- **색상 코딩**: 성능 등급별 시각적 구분
- **파티셔닝 전략**: 필요시 구체적 분할 방안 제시

### 3. 상세 분석 및 대안
- **실험 기반 근거**: 실제 측정 데이터를 바탕으로 한 추천 이유
- **대안 알고리즘**: 상황별 다른 선택지와 성능 비교
- **파티셔닝 가이드**: Twitter-2010 성공 사례 기반 상세 전략

## 🔬 실험 환경 및 검증

### 하드웨어 환경
- **GPU**: NVIDIA GPU 20GB 메모리
- **프레임워크**: Gunrock, cuGraph, Custom CUDA Implementation
- **측정 도구**: CUDA Profiler, 자체 개발 벤치마크

### 검증된 성능 지표
- **처리량**: MTEPS (Million Traversed Edges Per Second)
- **메모리 효율**: 엣지당 메모리 사용량 (KB/edge)
- **수렴성**: 반복 횟수 및 잔차 분석
- **확장성**: 그래프 크기별 선형성 검증

## 🔄 향후 개발 계획

- [ ] **실시간 GPU 연동**: 실제 GPU에서 성능 측정 및 검증
- [ ] **동적 그래프 지원**: 시간 변화 그래프 분석 확장
- [ ] **클라우드 GPU 연동**: AWS/GCP/Azure GPU 인스턴스 연결
- [ ] **API 서비스**: REST API를 통한 외부 시스템 연동
- [ ] **성능 리포트**: PDF/Excel 상세 분석 보고서 생성
- [ ] **실험 데이터 확장**: 더 많은 GPU 환경에서의 벤치마크

## 🏆 프로젝트 성과

### 학술적 기여
- GPU PageRank 알고리즘 체계적 성능 분석
- 데이터셋 특성별 최적 알고리즘 매핑 확립
- 대규모 그래프 파티셔닝 전략 개발

### 실용적 가치
- 연구자/개발자를 위한 알고리즘 선택 가이드 제공
- 실제 성능 데이터 기반 정확한 예측
- 웹 기반 사용자 친화적 도구 개발

## 🤝 기여 방법

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새로운기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새로운 기능 추가'`)
4. 브랜치에 Push합니다 (`git push origin feature/새로운기능`)
5. Pull Request를 생성합니다

### 기여 가능 영역
- 새로운 GPU 환경에서의 실험 데이터 추가
- 추가 PageRank 알고리즘 구현 및 성능 측정
- UI/UX 개선 및 새로운 시각화 기능
- 성능 예측 모델 정확도 향상

## 📚 참고 문헌

- GPU-based PageRank Algorithm Performance Analysis (2024-2025)
- Gunrock: A High-Performance Graph Processing Library
- cuGraph: RAPIDS Graph Analytics Library
- Dynamic Frontier PageRank Research Paper

---

**🎯 "실험 검증된 데이터를 바탕으로, 데이터의 특성을 이해하고 최적의 알고리즘을 제안하는 지능형 추천 시스템"**

**🔬 한국외국어대학교 컴퓨터공학부 캡스톤설계 연구 결과물**