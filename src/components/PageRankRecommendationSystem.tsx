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

  // 사전 정의된 데이터셋들
  const predefinedDatasets: GraphDataset[] = [
    { id: 'pokec', name: 'Pokec (슬로바키아 소셜)', nodes: 1632803, edges: 30622564, directed: true, tolerance: 1e-6, description: '중간 규모 소셜 네트워크' },
    { id: 'livejournal', name: 'LiveJournal (블로그)', nodes: 4847571, edges: 68993773, directed: true, tolerance: 1e-6, description: '대규모 소셜 네트워크' },
    { id: 'orkut', name: 'Orkut (소셜 서비스)', nodes: 3072441, edges: 117185083, directed: false, tolerance: 1e-6, description: '무향 소셜 네트워크' },
    { id: 'twitter', name: 'Twitter-2010', nodes: 41652230, edges: 1468365182, directed: true, tolerance: 1e-6, description: '초대규모 소셜 네트워크' },
    { id: 'stackoverflow', name: 'StackOverflow', nodes: 2601977, edges: 63497050, directed: true, tolerance: 1e-6, description: 'Q&A 지식 그래프' },
    { id: 'wikitalk', name: 'WikiTalk', nodes: 2394385, edges: 5021410, directed: true, tolerance: 1e-8, description: '위키피디아 토론 네트워크' },
    { id: 'slashdot', name: 'Slashdot0902', nodes: 82168, edges: 948464, directed: true, tolerance: 1e-6, description: '뉴스/토론 플랫폼' },
    { id: 'uk2005', name: 'UK-2005 웹그래프', nodes: 39459923, edges: 936364282, directed: true, tolerance: 1e-6, description: '웹 그래프' }
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
    return (edges * 0.025) / 1024;
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
      alternatives: []
    };

    // 메모리 초과 시 파티셔닝 필요
    if (memoryReq > memoryLimit) {
      recommendation.partitioning = true;
      const partitions = Math.ceil(memoryReq / (memoryLimit * 0.8));
      recommendation.partitionCount = partitions;
    }

    // 수렴 조건에 따른 알고리즘 선택 (높은 정밀도 요구시)
    const highPrecision = tolerance && tolerance < 1e-7;

    // 확장된 알고리즘 선택 로직
    if (nodes < 50000) {
      // 소규모 그래프
      if (highPrecision) {
        recommendation.algorithm = 'Hessen Method';
        recommendation.framework = 'Custom Implementation';
        recommendation.performance = '매우 높음 (고정밀도)';
        recommendation.reasoning = '소규모 그래프에서 고정밀도 요구 시 Hessen Method가 최적입니다.';
        recommendation.alternatives = ['GMRES (Krylov)', 'Aitken-Power Method'];
      } else {
        recommendation.algorithm = 'Power Method';
        recommendation.framework = 'cuGraph';
        recommendation.performance = '높음 (빠른 개발)';
        recommendation.reasoning = '소규모 그래프에서 빠른 개발을 위해 cuGraph Power Method를 권장합니다.';
        recommendation.alternatives = ['Hessen Method (최적 성능)', 'Jacobi Method'];
      }
    } else if (nodes < 500000) {
      // 중간규모 그래프
      if (density > 50) {
        recommendation.algorithm = 'Gauss-Seidel Method';
        recommendation.framework = 'Custom GPU Implementation';
        recommendation.performance = '높음 (고밀도 최적화)';
        recommendation.reasoning = '고밀도 중간규모 그래프에서 Gauss-Seidel이 Power Method보다 40-45% 빠른 수렴을 보입니다.';
        recommendation.alternatives = ['BiCGStab (메모리 효율)', 'Power Method + Preconditioner'];
      } else if (density > 20) {
        recommendation.algorithm = 'BiCGStab';
        recommendation.framework = 'CUSP Library';
        recommendation.performance = '높음 (균형적)';
        recommendation.reasoning = '중밀도 그래프에서 BiCGStab이 안정적인 수렴과 메모리 효율성을 제공합니다.';
        recommendation.alternatives = ['GMRES (더 안정적)', 'Power Extrapolation'];
      } else {
        recommendation.algorithm = 'Hessen Method';
        recommendation.framework = 'Custom Implementation';
        recommendation.performance = '매우 높음';
        recommendation.reasoning = '저밀도 중간규모 그래프에서 Hessen Method가 최소 반복으로 빠른 수렴을 보입니다.';
        recommendation.alternatives = ['cuGraph (개발 편의성)', 'Arnoldi Method'];
      }
    } else if (nodes < 5000000) {
      // 대규모 그래프
      if (memoryReq > memoryLimit * 0.7) {
        recommendation.algorithm = 'Monte Carlo PageRank';
        recommendation.framework = 'Custom GPU Implementation';
        recommendation.performance = '중-높음 (메모리 절약)';
        recommendation.reasoning = '메모리 제약이 있는 대규모 그래프에서 Monte Carlo 방법이 효율적입니다.';
        recommendation.alternatives = ['Static PageRank + Partitioning', 'Reduced Precision PageRank'];
      } else {
        recommendation.algorithm = 'Static PageRank (Atomics-free)';
        recommendation.framework = 'Custom GPU (DF-P 기반)';
        recommendation.performance = '매우 높음';
        recommendation.reasoning = '대규모 그래프에서 최신 GPU 최적화된 Static PageRank가 Gunrock보다 5.9배 빠릅니다.';
        recommendation.alternatives = ['Power Method + Gunrock', 'GMRES + ILU Preconditioner'];
      }
    } else if (nodes < 50000000) {
      // 초대규모 그래프
      recommendation.algorithm = 'Dynamic Frontier PageRank (DF-P)';
      recommendation.framework = 'Custom GPU Implementation';
      recommendation.performance = '최고 (최신 기술)';
      recommendation.reasoning = '초대규모 그래프에서 DF-P가 기존 방법보다 31배(Hornet) ~ 5.9배(Gunrock) 빠른 성능을 보입니다.';
      recommendation.alternatives = ['Static PageRank + Heavy Partitioning', 'Distributed PageRank'];
    } else {
      // 극대규모 그래프
      recommendation.algorithm = 'Distributed Block-Jacobi PageRank';
      recommendation.framework = 'Multi-GPU + MPI';
      recommendation.performance = '높음 (분산 필수)';
      recommendation.reasoning = '극대규모 그래프는 분산 처리가 필수이며, Block-Jacobi 방법이 통신 비용을 줄입니다.';
      recommendation.alternatives = ['Cloud-based GraphX', 'Streaming PageRank'];
    }

    // 방향성에 따른 조정
    if (!directed) {
      recommendation.performance = recommendation.performance.replace('매우 높음', '높음').replace('최고', '매우 높음');
      recommendation.reasoning += ' 무향 그래프는 유향 그래프 대비 약 1.7배 느린 성능을 보입니다.';
      
      // 무향 그래프에 특화된 대안 추가
      if (nodes < 1000000) {
        recommendation.alternatives.push('HITS Algorithm (Hub/Authority)');
      }
    }

    // 정밀도 요구사항에 따른 조정
    if (highPrecision) {
      recommendation.reasoning += ` 높은 정밀도(${tolerance}) 요구사항으로 인해 더 정확한 방법을 선택했습니다.`;
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
          <p className="text-lg text-gray-600">다양한 데이터셋에 대한 최적의 PageRank 알고리즘을 추천받으세요</p>
        </div>

        {/* 데이터셋 선택 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 사전 정의된 데이터셋 */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl font-bold text-blue-800">📊 사전 정의된 데이터셋</CardTitle>
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
                      <div className="text-xs text-gray-500">{dataset.description}</div>
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
                      <option value="directed">유향 그래프</option>
                      <option value="undirected">무향 그래프</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">오차 허용도</label>
                    <select
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      value={manualEntry.tolerance}
                      onChange={(e) => handleManualInputChange('tolerance', e.target.value)}
                    >
                      <option value="1e-4">1e-4 (낮은 정밀도)</option>
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
                    placeholder="예: 20"
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
                      <div className="text-sm text-gray-500">밀도: {calculateDensity(dataset.nodes, dataset.edges).toFixed(2)}</div>
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
                  🎯 전체 데이터셋 분석하기
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
              <CardTitle className="text-2xl font-bold">🎯 알고리즘 추천 결과 비교</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">데이터셋</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">추천 알고리즘</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">프레임워크</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">예상 성능</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">메모리 (GB)</th>
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
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{rec.framework}</td>
                          <td className="border border-gray-300 p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              rec.performance.includes('최고') ? 'bg-green-100 text-green-800' :
                              rec.performance.includes('매우 높음') ? 'bg-blue-100 text-blue-800' :
                              rec.performance.includes('높음') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rec.performance}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{rec.memoryUsage.toFixed(2)}</td>
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
                      <h3 className="text-lg font-bold text-gray-800 mb-4">{dataset.name} - 상세 분석</h3>
                      
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>💡 추천 이유:</strong> {rec.reasoning}
                        </AlertDescription>
                      </Alert>

                      {rec.alternatives.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-gray-800">🔄 대안 알고리즘</h4>
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
                            <strong>🔧 파티셔닝 전략:</strong> 그래프를 {rec.partitionCount}개 파트로 분할하여 처리를 권장합니다. 
                            각 파트의 결과를 통합할 때 정확도 손실을 최소화하기 위해 오버랩 영역을 고려해야 합니다.
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

        {/* 알고리즘 참고 정보 */}
        <Card className="shadow-lg">
          <CardHeader className="bg-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-indigo-800">📚 GPU PageRank 알고리즘 가이드</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              
              {/* 최신 고성능 알고리즘 */}
              <div className="space-y-3">
                <h4 className="font-bold text-indigo-700 border-b border-indigo-200 pb-1">🚀 최신 고성능 알고리즘</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong className="text-green-800">Dynamic Frontier (DF-P)</strong><br/>
                  <span className="text-gray-700">변화된 노드만 처리, Gunrock 대비 5.9배 빠름</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong className="text-blue-800">Static PageRank (Atomics-free)</strong><br/>
                  <span className="text-gray-700">Pull-based 동기 구현, 파티셔닝 최적화</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <strong className="text-purple-800">Reduced Precision</strong><br/>
                  <span className="text-gray-700">Mantissa 분할, V100에서 30% 성능 향상</span>
                </div>
              </div>

              {/* 전통적 수치해석 방법 */}
              <div className="space-y-3">
                <h4 className="font-bold text-blue-700 border-b border-blue-200 pb-1">🔢 전통적 수치해석 방법</h4>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <strong className="text-yellow-800">Gauss-Seidel Method</strong><br/>
                  <span className="text-gray-700">Power Method 대비 40-45% 빠른 수렴</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <strong className="text-orange-800">Hessen Method</strong><br/>
                  <span className="text-gray-700">최소 반복, 고정밀도 요구시 최적</span>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <strong className="text-red-800">Aitken Extrapolation</strong><br/>
                  <span className="text-gray-700">가속화 기법, 작은 damping factor에 효과적</span>
                </div>
              </div>

              {/* Krylov 부공간 방법 */}
              <div className="space-y-3">
                <h4 className="font-bold text-teal-700 border-b border-teal-200 pb-1">🌀 Krylov 부공간 방법</h4>
                <div className="p-3 bg-teal-50 rounded-lg">
                  <strong className="text-teal-800">GMRES</strong><br/>
                  <span className="text-gray-700">비대칭 행렬 최적, 강력한 수렴</span>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <strong className="text-cyan-800">BiCGStab</strong><br/>
                  <span className="text-gray-700">메모리 효율적, 짧은 순환 관계식</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <strong className="text-emerald-800">Arnoldi Methods</strong><br/>
                  <span className="text-gray-700">고유값 문제 특화, GMRES 기반</span>
                </div>
              </div>

            </div>

            {/* 선택 기준 */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <h4 className="font-bold text-lg mb-4 text-gray-800">🎯 알고리즘 선택 기준</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">📊 그래프 크기별</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>&lt;50K 노드:</strong> Hessen Method / Power Method</li>
                    <li><strong>50K-500K:</strong> Gauss-Seidel / BiCGStab</li>
                    <li><strong>500K-5M:</strong> Static PageRank / DF-P</li>
                    <li><strong>5M-50M:</strong> DF-P / Monte Carlo</li>
                    <li><strong>&gt;50M:</strong> Distributed Block-Jacobi</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">⚙️ 특수 조건별</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li><strong>고정밀도:</strong> Hessen Method / GMRES</li>
                    <li><strong>메모리 제약:</strong> Monte Carlo / Reduced Precision</li>
                    <li><strong>고밀도 그래프:</strong> Gauss-Seidel / BiCGStab</li>
                    <li><strong>무향 그래프:</strong> HITS 추가 고려</li>
                    <li><strong>동적 그래프:</strong> DF-P 필수</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageRankRecommendationSystem;