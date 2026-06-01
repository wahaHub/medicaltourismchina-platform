

import GradientText from '@/components/ui/GradientText';
import { useLanguage } from "@/contexts/LanguageContext";

export default function CoverageTable() {
  const { t } = useLanguage();
  
  const coverageData = [
    { benefitKey: "insurance.table.emergencyMedical", limit: "USD 250,000" },
    { benefitKey: "insurance.table.emergencyEvacuation", limit: "USD 500,000" },
    { benefitKey: "insurance.table.medicalComplications", limit: "USD 100,000" },
    { benefitKey: "insurance.table.tripDelay", limit: "USD 500 (max)" },
    { benefitKey: "insurance.table.baggageLoss", limit: "USD 2,500 (max)" },
    { benefitKey: "insurance.table.personalLiability", limit: "USD 100,000" },
    { benefitKey: "insurance.table.travelDelay", limit: "USD 500 per incident" },
    { benefitKey: "insurance.table.accidentalDeath", limit: "USD 50,000 (max)" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
            {t('insurance.table.title')}
          </GradientText>
        </div>

        <div className="max-w-3xl mx-auto bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th 
                    className="px-6 py-4 text-center font-bold text-base border-b-2 border-gray-300"
                    style={{ 
                      borderRight: '1px solid #dee2e6',
                      textTransform: 'uppercase'
                    }}
                  >
                    <GradientText>{t('insurance.table.benefit')}</GradientText>
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-bold text-base border-b-2 border-gray-300"
                    style={{ textTransform: 'uppercase' }}
                  >
                    <GradientText>{t('insurance.table.limit')}</GradientText>
                  </th>
                </tr>
              </thead>
              <tbody>
                {coverageData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td 
                      className="px-6 py-3.5 text-gray-700 text-sm font-medium"
                      style={{ 
                        borderBottom: index < coverageData.length - 1 ? '1px solid #e5e7eb' : 'none',
                        borderRight: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#F1F7F8' : 'transparent'
                      }}
                    >
                      {t(item.benefitKey)}
                    </td>
                    <td 
                      className="px-6 py-3.5 text-gray-700 text-sm text-center"
                      style={{ 
                        borderBottom: index < coverageData.length - 1 ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: index % 2 === 0 ? '#F1F7F8' : 'transparent'
                      }}
                    >
                      {item.limit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
