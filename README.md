GPU 기반 PageRank 알고리즘 추천 및 실행 시스템
한국외국어대학교 컴퓨터공학부 캡스톤설계및실습 (팀 4)

📌 프로젝트 개요
본 프로젝트는 다양한 웹/소셜 그래프 데이터셋에 대해 GPU 메모리와 데이터 특성을 고려해 최적의 PageRank 알고리즘을 자동으로 추천하고, 필요 시 분산 파티셔닝을 통해 대규모 그래프도 효율적으로 처리할 수 있는 시스템을 개발하는 것을 목표로 합니다.

"알고리즘 개발"보다는, 기존 GPU 기반 PageRank 알고리즘들의 특성과 상황별 성능을 체계적으로 분석하고, 이를 기반으로 자동 추천 및 실행 가능한 시스템을 구현하는 데 중점을 둡니다.

🚀 주요 기능
1. 그래프 특성 기반 알고리즘 추천 시스템
그래프 크기(노드/엣지 수), 밀도, 방향성, 정밀도 요구사항 등 입력

CUDA 기반 다양한 PageRank 알고리즘에 대해 자동 최적 추천

메모리 초과 시 자동 분할(partitioning) 수행

예상 성능, 메모리 사용량, 대안 알고리즘 정보 제공

2. GPU 메모리 기반 파티셔닝 전략
메모리 초과 시 자동으로 그래프를 적절히 분할

분할 개수 계산 및 정확도 손실 최소화 전략 적용

하이브리드 분할 방식(연결 밀도 기반) 구현 예정

3. 직관적인 시각화 기반 인터페이스
사전 정의된 대표 웹/소셜 그래프 제공

사용자 정의 그래프도 입력 가능

알고리즘 비교 결과를 표 및 분석 요약 형태로 시각화

🧠 시스템 아키텍처 및 기술스택
구성 요소	설명
Frontend	React + Tailwind 기반 사용자 UI
추천 엔진 로직	TypeScript 기반 규칙 기반 알고리즘 매칭
GPU 연산 (향후)	CUDA, cuGraph, CUSP, Gunrock 등 연동 가능성 고려
그래프 특성 분석	NetworkX 기반 (예정) 또는 수동 입력 방식
성능 기준	수렴 속도, 메모리 사용량, 알고리즘 안정성 등

💡 주요 알고리즘 카테고리
전통적 수치해석 기반

Power Method, Gauss-Seidel, Hessen Method, Jacobi 등

Krylov 부공간 기반

GMRES, BiCGStab, Arnoldi 등

GPU 특화 최신 기법

Dynamic Frontier PageRank (DF-P), Static PageRank (atomics-free), Monte Carlo 기반 등

분산 실행

Distributed Block-Jacobi, Cloud-based GraphX (향후 적용 대상)

🔍 예시 사용 시나리오
plaintext
복사
편집
입력: Twitter-2010 (4천만 노드, 14억 엣지)
특성 분석:
- 방향성: 유향
- 정밀도: 표준 (1e-6)
- GPU 메모리: 24GB

추천 결과:
- 알고리즘: Dynamic Frontier PageRank (DF-P)
- 프레임워크: Custom GPU
- 예상 성능: 최고
- 메모리 사용량: 35GB → 파티셔닝 필요 (5개 파트)
- 대안: Static PageRank, Distributed PageRank
📂 폴더 구조 예시
bash
복사
편집
📦project-root
 ┣ 📁src                # React 기반 프론트엔드
 ┣ 📁data               # 데이터셋 정의 및 샘플
 ┣ 📁logic              # 추천 알고리즘 로직 (TypeScript)
 ┣ 📄README.md          # 현재 문서
 ┣ 📄package.json
 ┗ ...
📌 향후 발전 방향
그래프 특성 자동 분석 기능 통합 (NetworkX + Python 서버)

실제 GPU 환경과 연동한 알고리즘 실행 및 벤치마크

파티셔닝 전략 성능 실험 및 자동 선택 시스템 고도화

논문 형식 결과 보고서 작성 (성능 비교, 정확도 평가 포함)

