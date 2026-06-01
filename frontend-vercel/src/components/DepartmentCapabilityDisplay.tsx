import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  BookOpen, 
  Stethoscope, 
  Award,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { DepartmentCapability } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface DepartmentCapabilityDisplayProps {
  capability: DepartmentCapability;
  departmentName: string;
  loading?: boolean;
}

export const DepartmentCapabilityDisplay: React.FC<DepartmentCapabilityDisplayProps> = ({
  capability,
  departmentName,
  loading = false
}) => {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. 为什么在中国看这个病 */}
      <Card className="overflow-hidden border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-3 text-xl text-emerald-800">
            <Heart className="h-6 w-6 text-emerald-600" />
            {t('departmentCapability.whyChinaTitle', { departmentName })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-base max-w-none prose-emerald prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-emerald-700 prose-ul:text-gray-700 prose-table:text-sm prose-th:bg-emerald-50 prose-th:font-semibold prose-th:text-emerald-800 prose-td:border-emerald-100 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:text-emerald-800 hover:prose-a:underline">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    {children}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                )
              }}
            >
              {capability.why_china_md}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 2. 举例列表 */}
      <Card className="overflow-hidden border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            {departmentName.includes('肿瘤') || departmentName.toLowerCase().includes('onco')
              ? t('departmentCapability.costAndWaitTitle')
              : t('departmentCapability.treatmentExamples')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-blue-100">
                  <th className="text-left py-4 px-3 font-semibold text-gray-800">{t('departmentCapability.table.diseaseName')}</th>
                  <th className="text-left py-4 px-3 font-semibold text-gray-800">{t('departmentCapability.table.surgicalMethod')}</th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-800">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('departmentCapability.table.waitingTime')}
                    </div>
                  </th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-800">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t('departmentCapability.table.priceRange')}
                    </div>
                  </th>
                  <th className="text-center py-4 px-3 font-semibold text-gray-800">{t('departmentCapability.table.annualCases')}</th>
                </tr>
              </thead>
              <tbody>
                {capability.examples.map((example, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-4 px-3">
                      <div className="font-medium text-gray-900">{example.disease_name}</div>
                    </td>
                    <td className="py-4 px-3 text-gray-700">{example.procedure_method}</td>
                    <td className="py-4 px-3 text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {example.wait_time}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {example.price_range_china}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {example.annual_cases.toLocaleString()}{t('departmentCapability.table.casesUnit')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. 中国在该领域的科研能力 */}
      <Card className="overflow-hidden border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
            <BookOpen className="h-6 w-6 text-purple-600" />
            {t('departmentCapability.researchCapability', { departmentName })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-base max-w-none prose-purple prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-purple-700 prose-ul:text-gray-700 prose-table:text-sm prose-th:bg-purple-50 prose-th:font-semibold prose-th:text-purple-800 prose-td:border-purple-100 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 hover:prose-a:underline">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    {children}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                )
              }}
            >
              {capability.research_capability_md}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 4. 中国医生临床能力 */}
      <Card className="overflow-hidden border-indigo-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-indigo-100">
          <CardTitle className="flex items-center gap-3 text-xl text-indigo-800">
            <Stethoscope className="h-6 w-6 text-indigo-600" />
            {t('departmentCapability.clinicalCapability', { departmentName })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-base max-w-none prose-indigo prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-indigo-700 prose-ul:text-gray-700 prose-table:text-sm prose-th:bg-indigo-50 prose-th:font-semibold prose-th:text-indigo-800 prose-td:border-indigo-100 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-800 hover:prose-a:underline">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {children}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                )
              }}
            >
              {capability.clinical_capability_md}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 5. 中国该领域专利 */}
      <Card className="overflow-hidden border-amber-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <CardTitle className="flex items-center gap-3 text-xl text-amber-800">
            <Award className="h-6 w-6 text-amber-600" />
            {t('departmentCapability.patentAchievements', { departmentName })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-base max-w-none prose-amber prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-amber-700 prose-ul:text-gray-700 prose-table:text-sm prose-th:bg-amber-50 prose-th:font-semibold prose-th:text-amber-800 prose-td:border-amber-100 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-800 hover:prose-a:underline">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    {children}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                )
              }}
            >
              {capability.patents_md}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 页脚法律声明 */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          <strong className="text-gray-800">{t('departmentCapability.disclaimer.title')}</strong>
          {t('departmentCapability.disclaimer.text')}
        </p>
      </div>
    </div>
  );
};

export default DepartmentCapabilityDisplay;
