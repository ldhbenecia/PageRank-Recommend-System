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

const PageRankRecommendationSystem: React.FC = () => {
  const [graphData, setGraphData] = useState({
    nodes: '',
    edges: '',
    directed: 'directed',
    memoryLimit: '20'
  });
  
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const calculateDensity = (nodes: number, edges: number): number => {
    if (!nodes || !edges) return 0;
    return edges / nodes;
  };

  const calculateMemoryRequirement = (edges: number): number => {
    return (edges * 0.025) / 1024;
  };

  const resetForm = () => {
    setRecommendation(null);
    // 입력 값들은 유지하고 추천 결과만 초기화
  };

  const resetAll = () => {
    setRecommendation(null);
    setGraphData({
      nodes: '',
      edges: '',
      directed: 'directed',
      memoryLimit: '20'
    });
  };

  const getRecommendation = () => {
    const nodes = parseInt(graphData.nodes);
    const edges = parseInt(graphData.edges);
    const density = calculateDensity(nodes, edges);
    const memoryReq = calculateMemoryRequirement(edges);
    const memoryLimit = parseInt(graphData.memoryLimit);
    const isDirected = graphData.directed === 'directed';

    let newRecommendation: RecommendationResult = {
      algorithm: '',
      framework: '',
      partitioning: false,
      performance: '',
      reasoning: '',
      memoryUsage: memoryReq,
      alternatives: []
    };

    if (memoryReq > memoryLimit) {
      newRecommendation.partitioning = true;
      const partitions = Math.ceil(memoryReq / (memoryLimit * 0.8));
      newRecommendation.partitionCount = partitions;
    }

    if (nodes < 100000) {
      newRecommendation.algorithm = 'Hessen Method';
      newRecommendation.framework = 'Custom Implementation';
      newRecommendation.performance = '매우 높음 (빠른 수렴)';
      newRecommendation.reasoning = '소규모 그래프에서 Hessen Method가 최소 반복으로 빠른 수렴을 보입니다.';
      newRecommendation.alternatives = ['Power Method (안정성 중시)'];
    } else if (nodes < 1000000) {
      if (density > 30) {
        newRecommendation.algorithm = 'Power Method';
        newRecommendation.framework = 'Gunrock';
        newRecommendation.performance = '높음 (안정적)';
        newRecommendation.reasoning = '고밀도 그래프에서 Power Method가 안정적인 수렴을 보입니다.';
        newRecommendation.alternatives = ['cuGraph (빠른 처리)', 'Hessen Method (수렴 최적화)'];
      } else {
        newRecommendation.algorithm = 'Hessen Method';
        newRecommendation.framework = 'Custom Implementation';
        newRecommendation.performance = '매우 높음';
        newRecommendation.reasoning = '중규모 저밀도 그래프에서 Hessen Method가 최적 성능을 보입니다.';
        newRecommendation.alternatives = ['cuGraph (라이브러리 편의성)'];
      }
    } else if (nodes < 10000000) {
      newRecommendation.algorithm = 'Power Method';
      newRecommendation.framework = 'Gunrock';
      newRecommendation.performance = '높음';
      newRecommendation.reasoning = '대규모 그래프에서 Power Method가 선형 확장성과 안정성을 보입니다.';
      newRecommendation.alternatives = ['cuGraph (개발 편의성)', 'Hessen Method (메모리 충분시)'];
    } else {
      newRecommendation.algorithm = 'Power Method';
      newRecommendation.framework = 'Gunrock + Partitioning';
      newRecommendation.performance = '중-높음 (파티셔닝 필요)';
      newRecommendation.reasoning = '초대규모 그래프는 파티셔닝과 함께 Power Method 사용을 권장합니다.';
      newRecommendation.alternatives = ['분산 처리 프레임워크 고려'];
    }

    if (!isDirected) {
      newRecommendation.performance = newRecommendation.performance.replace('매우 높음', '높음').replace('높음', '중-높음');
      newRecommendation.reasoning += ' 무향 그래프는 유향 그래프 대비 약 1.7배 느린 성능을 보입니다.';
    }

    setRecommendation(newRecommendation);
  };

  const handleInputChange = (field: string, value: string) => {
    setGraphData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">
              GPU PageRank 알고리즘 추천 시스템
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">노드 수</label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="예: 1000000"
                  value={graphData.nodes}
                  onChange={(e) => handleInputChange('nodes', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">엣지 수</label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="예: 50000000"
                  value={graphData.edges}
                  onChange={(e) => handleInputChange('edges', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">그래프 유형</label>
                <select
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  value={graphData.directed}
                  onChange={(e) => handleInputChange('directed', e.target.value)}
                >
                  <option value="directed">유향 그래프</option>
                  <option value="undirected">무향 그래프</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">GPU 메모리 한계 (GB)</label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="예: 20"
                  value={graphData.memoryLimit}
                  onChange={(e) => handleInputChange('memoryLimit', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={getRecommendation}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                disabled={!graphData.nodes || !graphData.edges}
              >
                🚀 알고리즘 추천 받기
              </button>
              
              {recommendation && (
                <button
                  onClick={resetAll}
                  className="px-6 py-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-lg"
                  title="모든 입력값 초기화"
                >
                  🔄 초기화
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {recommendation && (
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-green-800">🎯 추천 결과</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                >
                  ↩️ 다시 추천받기
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                >
                  🆕 새로 시작
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-blue-200 pb-2">권장 알고리즘</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-blue-700 mb-2">{recommendation.algorithm}</p>
                    <p className="text-gray-700"><strong>프레임워크:</strong> {recommendation.framework}</p>
                    <p className="text-gray-700"><strong>예상 성능:</strong> {recommendation.performance}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-gray-800 border-b-2 border-green-200 pb-2">리소스 요구사항</h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p><strong>예상 메모리:</strong> <span className="font-bold text-green-700">{recommendation.memoryUsage.toFixed(2)} GB</span></p>
                    {recommendation.partitioning && (
                      <p className="text-orange-600 font-bold bg-orange-50 p-2 rounded">
                        ⚠️ 파티셔닝 필요: {recommendation.partitionCount}개 파트
                      </p>
                    )}
                    <p><strong>그래프 밀도:</strong> <span className="font-bold">{calculateDensity(parseInt(graphData.nodes), parseInt(graphData.edges)).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>💡 추천 이유:</strong> {recommendation.reasoning}
                </AlertDescription>
              </Alert>

              {recommendation.alternatives.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-3 text-gray-800">🔄 대안 알고리즘</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {recommendation.alternatives.map((alt, idx) => (
                      <li key={idx} className="hover:text-blue-600 transition-colors">{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.partitioning && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    <strong>🔧 파티셔닝 전략:</strong> 그래프를 {recommendation.partitionCount}개 파트로 분할하여 순차 처리하거나, 
                    분산 환경에서 병렬 처리를 권장합니다. 각 파트의 결과를 통합할 때 정확도 손실을 최소화하기 위해 
                    오버랩 영역을 고려해야 합니다.
                  </AlertDescription>
                </Alert>
              )}

              {/* 입력 정보 요약 카드 추가 */}
              <div className="bg-gray-100 p-4 rounded-lg border-t-4 border-purple-500">
                <h4 className="font-semibold text-gray-800 mb-2">📊 입력 정보 요약</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><strong>노드 수:</strong> {parseInt(graphData.nodes).toLocaleString()}</div>
                  <div><strong>엣지 수:</strong> {parseInt(graphData.edges).toLocaleString()}</div>
                  <div><strong>그래프 유형:</strong> {graphData.directed === 'directed' ? '유향' : '무향'}</div>
                  <div><strong>메모리 한계:</strong> {graphData.memoryLimit}GB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle className="text-xl font-bold text-purple-800">📋 추천 시스템 기준</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <strong className="text-blue-800">소규모 그래프</strong> (&lt;100K 노드)<br/>
                  <span className="text-gray-700">Hessen Method - 빠른 수렴</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <strong className="text-green-800">중규모 그래프</strong> (100K-1M 노드)<br/>
                  <span className="text-gray-700">밀도에 따라 Hessen/Power Method 선택</span>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <strong className="text-yellow-800">대규모 그래프</strong> (1M-10M 노드)<br/>
                  <span className="text-gray-700">Power Method + Gunrock - 안정성과 확장성</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <strong className="text-purple-800">초대규모 그래프</strong> (&gt;10M 노드)<br/>
                  <span className="text-gray-700">파티셔닝 + Power Method</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong className="text-gray-800">메모리 기준</strong><br/>
                  <span className="text-gray-700">엣지당 0.025KB, 안전 여유분 20% 고려</span>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <strong className="text-red-800">방향성 영향</strong><br/>
                  <span className="text-gray-700">무향 그래프는 유향 대비 약 1.7배 느린 성능</span>
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
