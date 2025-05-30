import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RecommendationResult {
  algorithm: string;
  framework: string;
  partitioning: boolean;
  performance: string;
  reasoning: string;
  memoryUsage: number;
  alternatives: string[];
  partitionCount?: number;
  expectedTime?: string;
  mteps?: number;
  convergenceRate?: string;
}

interface GraphDataset {
  id: string;
  name: string;
  nodes: number;
  edges: number;
  directed: boolean;
  tolerance?: number;
  description?: string;
}

const PageRankRecommendationSystem: React.FC = () => {
  const [datasets, setDatasets] = useState<GraphDataset[]>([]);
  const [manualEntry, setManualEntry] = useState({
    nodes: '',
    edges: '',
    directed: 'directed',
    tolerance: '1e-6',
    memoryLimit: '20'
  });
  
  const [recommendations, setRecommendations] = useState<{[key: string]: RecommendationResult}>({});
  const [showComparison, setShowComparison] = useState(false);

  // 실험 결과 기반 사전 정의된 데이터셋들
  const predefinedDatasets: GraphDataset[] = [
    { id: 'pokec', name: 'Pokec (슬로바키아 소셜)', nodes: 1632803, edges: 30622564, directed: true, tolerance: 1e-6, description: '중규모 소셜 네트워크 - Gunrock 실험: 8.41초, 1,077 MTEPS' },
    { id: 'livejournal', name: 'LiveJournal (블로그)', nodes: 4847571, edges: 68993773, directed: true, tolerance: 1e-6, description: '대규모 소셜 네트워크 - Gunrock: 18.83초, cuGraph: 0.64초' },
    { id: 'orkut', name: 'Orkut (소셜 서비스)', nodes: 3072441, edges: 117185083, directed: false, tolerance: 1e-6, description: '무향 소셜 네트워크 - Hessen: 20회 반복, 2.98초' },
    { id: 'twitter', name: 'Twitter-2010', nodes: 41652230, edges: 1468365182, directed: true, tolerance: 1e-6, description: '초대규모 - 4분할 파티셔닝, 평균 1,060 MTEPS' },
    { id: 'stackoverflow', name: 'StackOverflow', nodes: 2601977, edges: 63497050, directed: true, tolerance: 1e-6, description: 'Q&A 지식 그래프 - Gunrock: 1,029 MTEPS' },
    { id: 'wikitalk', name: 'WikiTalk', nodes: 2394385, edges: 5021410, directed: true, tolerance: 1e-8, description: '위키피디아 토론 - 저밀도 그래프 (2.10 엣지/노드)' },
    { id: 'slashdot', name: 'Slashdot0902', nodes: 82168, edges: 948464, directed: true, tolerance: 1e-6, description: '소규모 - Hessen: 12회 반복, Power: 825회 반복' },
    { id: 'uk2005', name: 'UK-2005 웹그래프', nodes: 39459923, edges: 936364282, directed: true, tolerance: 1e-6, description: '웹 그래프 - Gunrock: 522 MTEPS, 1,792ms' }
  ];

  const addPredefinedDataset = (dataset: GraphDataset) => {
    if (!datasets.find(d => d.id === dataset.id)) {
      setDatasets([...datasets, dataset]);
    }
  };

  const addManualDataset = () => {
    if (manualEntry.nodes && manualEntry.edges) {
      const newDataset: GraphDataset = {
        id: `manual_${Date.now()}`,
        name: `사용자 정의 (${parseInt(manualEntry.nodes).toLocaleString()} 노드)`,
        nodes: parseInt(manualEntry.nodes),
        edges: parseInt(manualEntry.edges),
        directed: manualEntry.directed === 'directed',
        tolerance: parseFloat(manualEntry.tolerance),
        description: '사용자 정의 데이터셋'
      };
      setDatasets([...datasets, newDataset]);
      setManualEntry({ nodes: '', edges: '', directed: 'directed', tolerance: '1e-6', memoryLimit: '20' });
    }
  };

  const removeDataset = (id: string) => {
    setDatasets(datasets.filter(d => d.id !== id));
    const newRecommendations = { ...recommendations };
    delete newRecommendations[id];
    setRecommendations(newRecommendations);
  };

  const calculateDensity = (nodes: number, edges: number): number => {
    if (!nodes || !edges) return 0;
    return edges / nodes;
  };

  const calculateMemoryRequirement = (edges: number): number => {
    return (edges * 0.025) / 1024; // 실험 결과: 엣지당 0.025KB
  };

  const getRecommendationForDataset = (dataset: GraphDataset, memoryLimit: number = 20): RecommendationResult => {
    const { nodes, edges, directed, tolerance } = dataset;
    const density = calculateDensity(nodes, edges);
    const memoryReq = calculateMemoryRequirement(edges);

    let recommendation: RecommendationResult = {
      algorithm: '',
      framework: '',
      partitioning: false,
      performance: '',
      reasoning: '',
      memoryUsage: memoryReq,
      alternatives: [],
      expectedTime: '',
      mteps: 0,
      convergenceRate: ''
    };

    // 메모리 초과 시 파티셔닝 필요
    if (memoryReq > memoryLimit) {
      recommendation.partitioning = true;
      const partitions = Math.ceil(memoryReq / (memoryLimit * 0.8));
      recommendation.partitionCount = partitions;
    }

    const highPrecision = tolerance && tolerance < 1e-7;

    // 실험 결과 기반 상세 알고리즘 선택 로직
    if (nodes < 100000) {
      // 소규모 그래프 (실험: Slashdot0902)
      if (highPrecision) {
        recommendation.algorithm = 'Hessen Method';
        recommendation.framework = 'Custom Upper-Hessenberg Implementation';
        recommendation.performance = '최고 (최소 반복)';
        recommendation.reasoning = '소규모 고정밀도: Slashdot0902 실험에서 Hessen Method가 12회 반복으로 수렴 (Power Method: 825회)';
        recommendation.expectedTime = '< 1초';
        recommendation.convergenceRate = '12-20회 반복';
        recommendation.alternatives = ['Power Method (안정적, 느림)', 'GMRES (Krylov 부공간)', 'Jacobi Method'];
      } else {
        recommendation.algorithm = 'Power Method';
        recommendation.framework = 'cuGraph (빠른 구현)';
        recommendation.performance = '높음 (안정적)';
        recommendation.reasoning = '소규모 표준 정밀도: cuGraph의 최적화된 구현으로 빠른 개발과 안정성 보장';
        recommendation.expectedTime = '< 0.5초';
        recommendation.convergenceRate = '200-800회 반복';
        recommendation.alternatives = ['Hessen Method (최적 성능)', 'Gauss-Seidel Method', 'Aitken Extrapolation'];
      }
    } else if (nodes < 1000000) {
      // 중간규모 그래프
      if (density > 30) {
        // 고밀도 (Orkut 수준)
        recommendation.algorithm = 'Gauss-Seidel Method';
        recommendation.framework = 'Custom GPU Implementation';
        recommendation.performance = '매우 높음 (고밀도 최적화)';
        recommendation.reasoning = '고밀도 중간규모: Power Method 대비 40-45% 빠른 수렴, 고밀도 그래프에서 우수한 성능';
        recommendation.expectedTime = '2-5초';
        recommendation.convergenceRate = '100-300회 반복';
        recommendation.alternatives = ['BiCGStab (메모리 효율)', 'Power Method + ILU Preconditioner', 'Weighted Jacobi'];
      } else if (density > 15) {
        recommendation.algorithm = 'BiCGStab';
        recommendation.framework = 'CUSP Library + GPU';
        recommendation.performance = '높음 (균형적)';
        recommendation.reasoning = '중밀도 그래프: 메모리 효율성과 안정적 수렴의 균형, Krylov 부공간 방법의 장점';
        recommendation.expectedTime = '3-8초';
        recommendation.convergenceRate = '50-200회 반복';
        recommendation.alternatives = ['GMRES (더 안정)', 'Conjugate Gradient', 'Arnoldi Methods'];
      } else {
        // 저밀도 (WikiTalk 수준)
        recommendation.algorithm = 'Hessen Method';
        recommendation.framework = 'Custom Upper-Hessenberg';
        recommendation.performance = '최고 (저밀도 특화)';
        recommendation.reasoning = '저밀도 중간규모: WikiTalk와 같은 저밀도 그래프에서 최소 반복으로 빠른 수렴';
        recommendation.expectedTime = '1-3초';
        recommendation.convergenceRate = '20-50회 반복';
        recommendation.alternatives = ['Power Method (안정)', 'GMRES', 'Weighted Arnoldi'];
      }
    } else if (nodes < 10000000) {
      // 대규모 그래프 (LiveJournal, Pokec 수준)
      if (memoryReq > memoryLimit * 0.7) {
        recommendation.algorithm = 'Monte Carlo PageRank';
        recommendation.framework = 'Custom GPU + Random Walk';
        recommendation.performance = '중-높음 (메모리 절약)';
        recommendation.reasoning = '메모리 제약 대규모: 확률적 방법으로 메모리 사용량 대폭 감소, 근사 해법';
        recommendation.expectedTime = '10-30초';
        recommendation.convergenceRate = '샘플링 기반';
        recommendation.alternatives = ['Reduced Precision PageRank', 'Block-Jacobi + Partitioning'];
      } else {
        recommendation.algorithm = 'Static PageRank (Push-Pull)';
        recommendation.framework = 'Gunrock GPU Framework';
        recommendation.performance = '매우 높음';
        recommendation.reasoning = `대규모 최적화: Pokec(1,077 MTEPS), LiveJournal(1,032 MTEPS) 실험 결과 기반, 선형 확장성 확인`;
        recommendation.expectedTime = '8-20초';
        recommendation.mteps = 1000;
        recommendation.convergenceRate = '50-150회 반복';
        recommendation.alternatives = ['cuGraph (편의성)', 'Dynamic Frontier PageRank', 'Power Method + GPU'];
      }
    } else if (nodes < 50000000) {
      // 초대규모 그래프 (Twitter, UK-2005 수준)
      recommendation.algorithm = 'Dynamic Frontier PageRank (DF-P)';
      recommendation.framework = 'Custom GPU (최신 연구)';
      recommendation.performance = '최고 (최신 기술)';
      recommendation.reasoning = 'Twitter-2010 실험: 4분할 파티셔닝으로 1,060+ MTEPS 달성, Gunrock 대비 5.9배, Hornet 대비 31배 성능 향상';
      recommendation.expectedTime = '60-180초 (파티셔닝)';
      recommendation.mteps = 1100;
      recommendation.convergenceRate = '동적 수렴';
      recommendation.alternatives = ['Static PageRank + Heavy Partitioning', 'Distributed Gunrock', 'Asynchronous PageRank'];
    } else {
      // 극대규모 그래프
      recommendation.algorithm = 'Distributed Block-Jacobi PageRank';
      recommendation.framework = 'Multi-GPU + MPI + NCCL';
      recommendation.performance = '높음 (분산 필수)';
      recommendation.reasoning = '극대규모: 단일 GPU 메모리 한계 초과, 분산 처리 필수, Block-Jacobi로 통신 비용 최소화';
      recommendation.expectedTime = '300-900초';
      recommendation.convergenceRate = '비동기 수렴';
      recommendation.alternatives = ['GraphX Spark', 'Pregel-based Systems', 'Streaming PageRank'];
    }

    // 방향성에 따른 성능 조정 (실험 결과: 유향이 1.73배 빠름)
    if (!directed) {
      const prevPerf = recommendation.performance;
      recommendation.performance = prevPerf.includes('최고') ? '매우 높음' : 
                                   prevPerf.includes('매우 높음') ? '높음' : 
                                   prevPerf.includes('높음') ? '중-높음' : '중간';
      recommendation.reasoning += ' [무향 그래프는 유향 대비 약 1.7배 느린 성능, 높은 밀도로 인한 계산 부하 증가]';
      
      // 무향 그래프 특화 대안
      if (nodes < 5000000) {
        recommendation.alternatives.push('HITS Algorithm (Hub/Authority 분석)');
      }
      
      // MTEPS 조정
      if (recommendation.mteps) {
        recommendation.mteps = Math.round(recommendation.mteps / 1.7);
      }
    }

    // 정밀도 요구사항 조정
    if (highPrecision) {
      recommendation.reasoning += ` [높은 정밀도(${tolerance}) 요구로 수렴 조건 강화]`;
      if (recommendation.convergenceRate && !recommendation.convergenceRate.includes('동적') && !recommendation.convergenceRate.includes('샘플링')) {
        const range = recommendation.convergenceRate.match(/(\d+)-(\d+)/);
        if (range) {
          const min = parseInt(range[1]);
          const max = parseInt(range[2]);
          recommendation.convergenceRate = `${Math.round(min * 1.5)}-${Math.round(max * 2)}회 반복`;
        }
      }
    }

    return recommendation;
  };

  const generateRecommendations = () => {
    const memoryLimit = parseInt(manualEntry.memoryLimit) || 20;
    const newRecommendations: {[key: string]: RecommendationResult} = {};
    
    datasets.forEach(dataset => {
      newRecommendations[dataset.id] = getRecommendationForDataset(dataset, memoryLimit);
    });
    
    setRecommendations(newRecommendations);
    setShowComparison(true);
  };

  const resetAll = () => {
    setDatasets([]);
    setRecommendations({});
    setShowComparison(false);
    setManualEntry({ nodes: '', edges: '', directed: 'directed', tolerance: '1e-6', memoryLimit: '20' });
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚀 GPU PageRank 알고리즘 추천 시스템</h1>
          <p className="text-lg text-gray-600">실험 결과 기반 데이터셋별 최적 PageRank 알고리즘 추천</p>
          <p className="text-sm text-gray-500 mt-2">한국외국어대학교 컴퓨터공학부 캡스톤설계 팀 4 연구 결과</p>
        </div>

        {/* 데이터셋 선택 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 사전 정의된 데이터셋 */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl font-bold text-blue-800">📊 실험 검증된 데이터셋</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {predefinedDatasets.map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{dataset.name}</div>
                      <div className="text-sm text-gray-600">
                        {dataset.nodes.toLocaleString()} 노드, {dataset.edges.toLocaleString()} 엣지 
                        ({dataset.directed ? '유향' : '무향'})
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{dataset.description}</div>
                    </div>
                    <button
                      onClick={() => addPredefinedDataset(dataset)}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      disabled={datasets.some(d => d.id === dataset.id)}
                    >
                      {datasets.some(d => d.id === dataset.id) ? '추가됨' : '추가'}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 사용자 정의 데이터셋 */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-xl font-bold text-green-800">✏️ 사용자 정의 데이터셋</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">노드 수</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="예: 1000000"
                    value={manualEntry.nodes}
                    onChange={(e) => handleManualInputChange('nodes', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">엣지 수</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="예: 50000000"
                    value={manualEntry.edges}
                    onChange={(e) => handleManualInputChange('edges', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">그래프 유형</label>
                    <select
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      value={manualEntry.directed}
                      onChange={(e) => handleManualInputChange('directed', e.target.value)}
                    >
                      <option value="directed">유향 그래프 (1.7배 빠름)</option>
                      <option value="undirected">무향 그래프</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">수렴 정밀도</label>
                    <select
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      value={manualEntry.tolerance}
                      onChange={(e) => handleManualInputChange('tolerance', e.target.value)}
                    >
                      <option value="1e-4">1e-4 (빠른 수렴)</option>
                      <option value="1e-6">1e-6 (표준 정밀도)</option>
                      <option value="1e-8">1e-8 (높은 정밀도)</option>
                      <option value="1e-10">1e-10 (최고 정밀도)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">GPU 메모리 한계 (GB)</label>
                  <input
                    type="number"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="예: 20 (실험 환경 기준)"
                    value={manualEntry.memoryLimit}
                    onChange={(e) => handleManualInputChange('memoryLimit', e.target.value)}
                  />
                </div>
                <button
                  onClick={addManualDataset}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  disabled={!manualEntry.nodes || !manualEntry.edges}
                >
                  ➕ 데이터셋 추가
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 선택된 데이터셋 목록 */}
        {datasets.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-xl font-bold text-purple-800">📋 선택된 데이터셋 ({datasets.length}개)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {datasets.map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{dataset.name}</div>
                      <div className="text-sm text-gray-600">
                        노드: {dataset.nodes.toLocaleString()}, 엣지: {dataset.edges.toLocaleString()}, 
                        타입: {dataset.directed ? '유향' : '무향'}, 오차: {dataset.tolerance}
                      </div>
                      <div className="text-sm text-gray-500">
                        밀도: {calculateDensity(dataset.nodes, dataset.edges).toFixed(2)} 엣지/노드, 
                        예상 메모리: {calculateMemoryRequirement(dataset.edges).toFixed(2)} GB
                      </div>
                    </div>
                    <button
                      onClick={() => removeDataset(dataset.id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      제거
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={generateRecommendations}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🎯 실험 결과 기반 알고리즘 추천
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  🔄 모두 초기화
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 추천 결과 비교 */}
        {showComparison && Object.keys(recommendations).length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardTitle className="text-2xl font-bold">🎯 실험 기반 알고리즘 추천 결과</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">데이터셋</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">추천 알고리즘</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">예상 성능</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">실행 시간</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">수렴율</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">메모리</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">파티셔닝</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map(dataset => {
                      const rec = recommendations[dataset.id];
                      if (!rec) return null;
                      return (
                        <tr key={dataset.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">
                            <div className="font-semibold">{dataset.name}</div>
                            <div className="text-sm text-gray-600">
                              {dataset.nodes.toLocaleString()} / {dataset.edges.toLocaleString()}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="font-semibold text-blue-700">{rec.algorithm}</div>
                            <div className="text-xs text-gray-600">{rec.framework}</div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              rec.performance.includes('최고') ? 'bg-green-100 text-green-800' :
                              rec.performance.includes('매우 높음') ? 'bg-blue-100 text-blue-800' :
                              rec.performance.includes('높음') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rec.performance}
                            </span>
                            {rec.mteps && (
                              <div className="text-xs text-gray-600 mt-1">{rec.mteps} MTEPS</div>
                            )}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{rec.expectedTime || 'N/A'}</td>
                          <td className="border border-gray-300 p-3 text-sm">{rec.convergenceRate || 'N/A'}</td>
                          <td className="border border-gray-300 p-3 text-sm">{rec.memoryUsage.toFixed(2)} GB</td>
                          <td className="border border-gray-300 p-3 text-center">
                            {rec.partitioning ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                {rec.partitionCount}개 파트
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold">불필요</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 상세 추천 이유 */}
              <div className="mt-8 space-y-6">
                {datasets.map(dataset => {
                  const rec = recommendations[dataset.id];
                  if (!rec) return null;
                  return (
                    <div key={dataset.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">{dataset.name} - 실험 기반 분석</h3>
                      
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>🔬 실험 근거:</strong> {rec.reasoning}
                        </AlertDescription>
                      </Alert>

                      {rec.alternatives.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-gray-800">🔄 대안 알고리즘 (실험 검증됨)</h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.alternatives.map((alt, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rec.partitioning && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertDescription className="text-orange-800">
                            <strong>🔧 파티셔닝 전략 (Twitter-2010 검증):</strong> 그래프를 {rec.partitionCount}개 파트로 분할하여 처리. 
                            Twitter 실험에서 4분할로 평균 1,060+ MTEPS 달성. 각 파트의 결과 통합 시 정확도 손실 최소화를 위해 
                            경계 노드 오버랩 고려 필요.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 실험 결과 기반 알고리즘 가이드 */}
        <Card className="shadow-lg">
          <CardHeader className="bg-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-indigo-800">📚 실험 검증된 GPU PageRank 알고리즘</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              
              {/* 최신 고성능 알고리즘 */}
              <div className="space-y-3">
                <h4 className="font-bold text-green-700 border-b border-green-200 pb-1">🚀 최신 연구 알고리즘</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong className="text-green-800">Dynamic Frontier (DF-P)</strong><br/>
                  <span className="text-gray-700">변화 노드만 처리, Gunrock 대비 5.9배 향상</span><br/>
                  <span className="text-xs text-green-600">Twitter-2010: 1,060+ MTEPS</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong className="text-blue-800">Static PageRank (Push-Pull)</strong><br/>
                  <span className="text-gray-700">Gunrock 기반, 선형 확장성 확인</span><br/>
                  <span className="text-xs text-blue-600">Pokec: 1,077 MTEPS, LiveJournal: 1,032 MTEPS</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <strong className="text-purple-800">Monte Carlo PageRank</strong><br/>
                  <span className="text-gray-700">메모리 절약형, 확률적 샘플링</span><br/>
                  <span className="text-xs text-purple-600">대용량 그래프 근사 해법</span>
                </div>
              </div>

              {/* 실험 검증된 수치해석 방법 */}
              <div className="space-y-3">
                <h4 className="font-bold text-orange-700 border-b border-orange-200 pb-1">🔢 실험 검증 수치방법</h4>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <strong className="text-yellow-800">Hessen Method</strong><br/>
                  <span className="text-gray-700">최소 반복 수렴, 고정밀도 최적</span><br/>
                  <span className="text-xs text-yellow-600">Slashdot: 12회 vs Power: 825회</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <strong className="text-orange-800">Gauss-Seidel Method</strong><br/>
                  <span className="text-gray-700">Power Method 대비 40-45% 빠른 수렴</span><br/>
                  <span className="text-xs text-orange-600">고밀도 그래프에서 우수</span>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <strong className="text-red-800">Power Method (cuGraph)</strong><br/>
                  <span className="text-gray-700">안정적, 라이브러리 지원</span><br/>
                  <span className="text-xs text-red-600">LiveJournal: 0.64초 (cuGraph)</span>
                </div>
              </div>

              {/* Krylov 부공간 방법 */}
              <div className="space-y-3">
                <h4 className="font-bold text-teal-700 border-b border-teal-200 pb-1">🌀 Krylov 부공간 방법</h4>
                <div className="p-3 bg-teal-50 rounded-lg">
                  <strong className="text-teal-800">GMRES</strong><br/>
                  <span className="text-gray-700">비대칭 행렬 특화, 강한 수렴성</span><br/>
                  <span className="text-xs text-teal-600">고정밀도 요구시 추천</span>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <strong className="text-cyan-800">BiCGStab</strong><br/>
                  <span className="text-gray-700">메모리 효율적, 안정적 수렴</span><br/>
                  <span className="text-xs text-cyan-600">중밀도 그래프 최적</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <strong className="text-emerald-800">Weighted Arnoldi</strong><br/>
                  <span className="text-gray-700">고유값 문제 기반</span><br/>
                  <span className="text-xs text-emerald-600">실험: 대규모에서 수렴 불안정</span>
                </div>
              </div>

            </div>

            {/* 실험 결과 기반 성능 비교 */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <h4 className="font-bold text-lg mb-4 text-gray-800">📊 실험 결과 기반 성능 지표</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">⚡ 실험 성능 (MTEPS 기준)</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>Twitter DF-P:</strong> 1,060+ MTEPS (4분할)</li>
                    <li><strong>Pokec Gunrock:</strong> 1,077 MTEPS</li>
                    <li><strong>LiveJournal Gunrock:</strong> 1,032 MTEPS</li>
                    <li><strong>UK-2005 Gunrock:</strong> 522 MTEPS</li>
                    <li><strong>StackOverflow:</strong> 1,029 MTEPS</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">🔄 수렴 비교 (반복 횟수)</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>Hessen vs Power (Slashdot):</strong> 12회 vs 825회</li>
                    <li><strong>Hessen vs Power (Orkut):</strong> 20회 vs 775회</li>
                    <li><strong>Gauss-Seidel:</strong> Power 대비 40-45% 감소</li>
                    <li><strong>유향 vs 무향:</strong> 1.73배 성능 차이</li>
                    <li><strong>메모리 효율:</strong> 엣지당 0.025KB</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">
                  <strong>🔬 실험 환경:</strong> NVIDIA GPU 20GB, CUDA, Gunrock/cuGraph 프레임워크 기반 
                  한국외국어대학교 캡스톤설계 연구 결과 (2024-2025)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageRankRecommendationSystem;