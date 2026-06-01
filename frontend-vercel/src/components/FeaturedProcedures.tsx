import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { DollarSign, ChevronRight } from "lucide-react";
import { apiCall } from "@/utils/auth";

interface DepartmentData {
  id: string;
  code: string;
  name: string;
  iconName: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  description: string;
  diseases: DiseaseData[];
}

interface DiseaseData {
  id: string;
  code: string;
  name: string;
  iconName: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  quickFacts?: QuickFactData[];
  costEstimate?: CostEstimateData;
  waitTime?: WaitTimeData;
}

interface QuickFactData {
  icon: string;
  label: string;
  value: string;
}

interface CostEstimateData {
  china: PriceRangeData;
  us: PriceRangeData;
  savings: string;
}

interface PriceRangeData {
  min: number;
  max: number;
  currency: string;
  includes: string[];
}

interface WaitTimeData {
  minDays: number;
  maxDays: number;
  typicalDays: number;
  factors: WaitTimeFactorData[];
}

interface WaitTimeFactorData {
  name: string;
  impact: string;
  description: string;
}

const DiseaseCard = ({ disease, departmentCode }: { disease: DiseaseData; departmentCode: string }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/treatment/department/${departmentCode}/disease/${disease.code}`);
  };
  
  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="font-medium mb-2">{disease.name}</h4>
            {disease.costEstimate && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>Save up to {disease.costEstimate.savings}</span>
              </div>
            )}
            {disease.waitTime && (
              <div className="text-sm text-gray-500 mt-1">
                Typical wait: {disease.waitTime.typicalDays} days
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

const DepartmentSection = ({ department, isActive, onClick }: { 
  department: DepartmentData; 
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div 
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        isActive ? "bg-primary/5 border-r-2 border-primary" : "hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {department.iconName && (
          <img 
            src={`/icons/${department.iconName}.svg`} 
            alt={department.name} 
            className="w-6 h-6"
          />
        )}
        <div>
          <h3 className="font-medium">{department.name}</h3>
          <p className="text-sm text-gray-500">
            {department.diseases.length} treatments available
          </p>
        </div>
      </div>
    </div>
  );
};

const FeaturedProcedures = () => {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiCall('/search');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch data');
        // }
        const data = await response.json();
        setDepartments(data.departments);
        if (data.departments.length > 0) {
          setActiveDepartment(data.departments[0].code);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const activeDepartmentData = departments.find(d => d.code === activeDepartment);

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Medical Departments & Treatments</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Departments List - Left Column */}
          <div className="md:col-span-4 md:border-r">
            {/* Mobile: horizontal scroll tabs */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex gap-3 snap-x snap-mandatory pb-2">
                {departments.map((department) => (
                  <button
                    key={department.code}
                    onClick={() => setActiveDepartment(department.code)}
                    className={cn(
                      "snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
                      department.code === activeDepartment
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-200"
                    )}
                  >
                    {department.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden md:block divide-y">
              {departments.map((department) => (
                <DepartmentSection
                  key={department.code}
                  department={department}
                  isActive={department.code === activeDepartment}
                  onClick={() => setActiveDepartment(department.code)}
                />
              ))}
            </div>
          </div>

          {/* Diseases List - Right Column */}
          <div className="md:col-span-8 p-4 sm:p-6">
            {activeDepartmentData && (
              <>
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{activeDepartmentData.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{activeDepartmentData.description}</p>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {activeDepartmentData.diseases.map((disease) => (
                    <DiseaseCard
                      key={disease.code}
                      disease={disease}
                      departmentCode={activeDepartmentData.code}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProcedures;
