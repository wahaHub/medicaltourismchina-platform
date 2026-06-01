
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopUtilityBar from "@/components/TopUtilityBar";
import MainNavigation from "@/components/MainNavigation";
import Footer from "@/components/Footer";
import { 
  Activity, 
  Shield, 
  Clock, 
  DollarSign,
  Stethoscope,
  Users,
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  User,
  Heart,
  Microscope,
  Zap,
  Brain,
  Quote,
  Dna,
  Scissors,
  Syringe,
  Eye,
  Bone,
  Wind,
  ChevronRight
} from "lucide-react";

// Treatment data configuration
const treatmentData: { [key: string]: any } = {
  "breast-cancer": {
    title: "Breast Cancer Care Coordination in China",
    subtitle: "Shorter scheduling windows | Evidence-based protocols | Transparent costs",
    department: {
      code: "cancer",
      name: "Cancer Care"
    },
    quickFacts: [
      {
        icon: <Clock className="w-6 h-6 text-primary" />,
        label: "Surgery Wait Time",
        value: "Median 23 days",
        detail: "from biopsy to OR"
      },
      {
        icon: <DollarSign className="w-6 h-6 text-primary" />,
        label: "Cost Savings",
        value: "30-70% lower",
        detail: "vs U.S. self-pay rates"
      },
      {
        icon: <Shield className="w-6 h-6 text-primary" />,
        label: "Quality Assurance",
        value: "JCI & CAP Certified",
        detail: "International standards"
      }
    ],
    comparisons: {
      waitTime: {
        china: {
          value: "Median 23 days from biopsy to OR",
          source: "PMC"
        },
        us: {
          value: "Median 33–39 days in multi-state audit",
          source: "PMC, breastcare.org"
        }
      },
      cost: {
        china: {
          value: "USD 7,400 – 10,300 (non-surgical phase)",
          source: "PMC, BioMed Central"
        },
        us: {
          value: "USD 20,000 – 100,000+ depending on stage",
          source: "WebMD, PMC"
        }
      }
    },
    treatmentProcess: [
      {
        title: "Virtual Oncologist Review",
        description: "English-speaking specialist confirms suitability.",
        duration: "Week 0"
      },
      {
        title: "Arrival & Diagnostics",
        description: "Mammography, MRI, genomic panel (if indicated).",
        duration: "Week 1"
      },
      {
        title: "Surgery",
        description: "Breast-conserving or mastectomy per NCCN guidelines.",
        duration: "Week 2-4"
      },
      {
        title: "Adjuvant Therapies",
        description: "Chemo ± radiation ± targeted therapy.",
        duration: "Months 2-6"
      },
      {
        title: "Remote Follow-up",
        description: "Pathology report in English; virtual visits every 3 months.",
        duration: "Ongoing"
      }
    ],
    qualityMetrics: {
      accreditation: "All partner centers hold Joint Commission International (JCI) or CAP lab certifications (ID list on request).",
      protocols: "Treatments follow NCCN 2025 & ESMO 2024 breast-cancer pathways.",
      infection: "Centers maintain < 0.4% post-op SSI rate (2023 internal audit)."
    },
    conciergePackage: {
      fee: "USD 2,000 – 5,000 (covers non-clinical services only)",
      services: [
        {
          title: "Care Coordinator",
          description: "Bilingual RN point-of-contact 24/7"
        },
        {
          title: "Airport-to-ward Escort",
          description: "Private transfer + translation"
        },
        {
          title: "Paperwork & Visa Letters",
          description: "Medical invitation, customs med-supply letter"
        },
        {
          title: "Post-discharge Telehealth",
          description: "Six video check-ins over 12 months"
        }
      ]
    },
    disclaimers: [
      {
        title: "Important — No Medical Advice",
        content: "The information above is for educational purposes only and should not be taken as medical advice. Clinical decisions must be made by licensed physicians after in-person evaluation."
      },
      {
        title: "No Affiliation",
        content: "Our concierge firm is independent and not owned by, operated by, or otherwise affiliated with any hospital or physician named or linked on this page."
      },
      {
        title: "Results & Costs Vary",
        content: "Treatment timelines, survival outcomes, and costs depend on stage, molecular subtype, comorbidities, and hospital selection. Written estimates are provided after medical record review."
      }
    ]
  },
  "lung-cancer": {
    title: "Lung Cancer Treatment",
    subtitle: "Comprehensive lung cancer care",
    department: {
      code: "cancer",
      name: "Cancer Care"
    },
    heroImage: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    quickFacts: [
      {
        icon: <Microscope className="w-6 h-6 text-primary" />,
        label: "Advanced Treatment",
        value: "Precision oncology"
      },
      {
        icon: <Shield className="w-6 h-6 text-primary" />,
        label: "Success Rate",
        value: "High survival rate"
      },
      {
        icon: <Clock className="w-6 h-6 text-primary" />,
        label: "Treatment Duration",
        value: "3-6 months"
      }
    ],
    treatmentTypes: [
      {
        id: "basic",
        label: "Basic Checkup",
        content: {
          title: "Basic Health Screening",
          description: "Comprehensive basic health screening package.",
          procedures: [
            "Physical examination",
            "Blood tests",
            "Urine analysis",
            "Chest X-ray",
            "ECG"
          ]
        }
      },
      {
        id: "advanced",
        label: "Advanced Screening",
        content: {
          title: "Advanced Health Screening",
          description: "In-depth health screening with advanced diagnostics.",
          procedures: [
            "All basic checkup items",
            "CT scan",
            "MRI",
            "Cancer markers",
            "Genetic testing"
          ]
        }
      }
    ],
    description: "Our deep health checkup program offers comprehensive health screenings with advanced diagnostics and same-day results. The program is designed to provide thorough health assessments at significantly lower costs compared to Western healthcare facilities.",
    pricing: {
      china: {
        range: "$2,000 - $5,000",
        includes: [
          "Comprehensive physical examination",
          "Advanced imaging (CT/MRI)",
          "Full blood panel and biomarkers",
          "Same-day results",
          "Medical consultation"
        ]
      },
      us: {
        range: "$5,000 - $15,000",
        includes: [
          "Basic physical examination",
          "Standard imaging",
          "Basic blood work",
          "Results in 1-2 weeks",
          "Follow-up consultation"
        ]
      },
      savings: "Up to 70%"
    }
  },
  "stem-cell-therapy": {
    title: "Stem Cell Therapy",
    subtitle: "Regenerative medicine treatments",
    department: {
      code: "regenerative",
      name: "Regenerative Medicine"
    },
    heroImage: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    quickFacts: [
      {
        icon: <Dna className="w-6 h-6 text-primary" />,
        label: "Regenerative Medicine",
        value: "Advanced cellular therapy"
      },
      {
        icon: <Shield className="w-6 h-6 text-primary" />,
        label: "Cost Savings",
        value: "30-50% lower costs"
      },
      {
        icon: <Clock className="w-6 h-6 text-primary" />,
        label: "Treatment Duration",
        value: "2-4 weeks"
      }
    ],
    treatmentTypes: [
      {
        id: "autologous",
        label: "Autologous",
        content: {
          title: "Autologous Stem Cell Therapy",
          description: "Using your own stem cells harvested from bone marrow or adipose tissue.",
          procedures: [
            "Bone marrow aspiration",
            "Adipose tissue extraction",
            "Stem cell isolation",
            "Quality testing",
            "Cell infusion"
          ]
        }
      },
      {
        id: "allogeneic",
        label: "Allogeneic",
        content: {
          title: "Allogeneic Stem Cell Therapy",
          description: "Using carefully screened donor stem cells.",
          procedures: [
            "Donor matching",
            "Cell preparation",
            "Pre-treatment evaluation",
            "Infusion protocol",
            "Post-treatment monitoring"
          ]
        }
      }
    ],
    description: "Our stem cell therapy program offers FDA- and NMPA-approved protocols with shorter wait times and significant cost savings. We provide both autologous and allogeneic stem cell treatments using state-of-the-art facilities and techniques.",
    pricing: {
      china: {
        range: "$15,000 - $30,000",
        includes: [
          "Pre-treatment evaluation",
          "Stem cell harvesting and processing",
          "Treatment procedure",
          "Post-treatment care",
          "14-day accommodation"
        ]
      },
      us: {
        range: "$50,000 - $100,000",
        includes: [
          "Initial consultation",
          "Basic procedure",
          "Minimal follow-up",
          "No accommodation included",
          "Additional fees may apply"
        ]
      },
      savings: "Up to 65%"
    }
  }
  // Additional treatments can be added here following the same structure
};

// Department data
const departmentData: { [key: string]: any } = {
  "cancer": {
    name: "Cancer Care",
    description: "Comprehensive cancer treatment and care"
  },
  "regenerative": {
    name: "Regenerative Medicine",
    description: "Advanced cellular and regenerative therapies"
  },
  // ... other departments
};

const TreatmentDetailPage = () => {
  const { slug } = useParams();
  const [showStickyBar, setShowStickyBar] = useState(true);
  const currentTreatment = treatmentData[slug || "breast-cancer"] || treatmentData["breast-cancer"];

  return (
    <div className="min-h-screen">
      <TopUtilityBar />
      <MainNavigation />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm">
            <Link to="/treatment" className="text-muted-foreground hover:text-primary">
              Treatments
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            <Link 
              to={`/treatment/department/${currentTreatment.department.code}`} 
              className="text-muted-foreground hover:text-primary"
            >
              {currentTreatment.department.name}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {currentTreatment.title}
            </span>
          </nav>
        </div>
      </div>
      
      {/* Page Header */}
      <section className="bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">{currentTreatment.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{currentTreatment.subtitle}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {currentTreatment.quickFacts.map((fact: any, index: number) => (
                <div key={index} className="bg-secondary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0">{fact.icon}</div>
                    <div className="font-medium">{fact.label}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{fact.value}</div>
                  <div className="text-sm text-muted-foreground">{fact.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Consider China?</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-6">Surgery Wait Time</h3>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="font-medium text-primary mb-2">China</div>
                        <div className="text-lg">{currentTreatment.comparisons.waitTime.china.value}</div>
                        <div className="text-sm text-muted-foreground">Source: {currentTreatment.comparisons.waitTime.china.source}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-2">United States</div>
                        <div className="text-lg">{currentTreatment.comparisons.waitTime.us.value}</div>
                        <div className="text-sm text-muted-foreground">Source: {currentTreatment.comparisons.waitTime.us.source}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-6">Total Treatment Cost</h3>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="font-medium text-primary mb-2">China</div>
                        <div className="text-lg">{currentTreatment.comparisons.cost.china.value}</div>
                        <div className="text-sm text-muted-foreground">Source: {currentTreatment.comparisons.cost.china.source}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-2">United States</div>
                        <div className="text-lg">{currentTreatment.comparisons.cost.us.value}</div>
                        <div className="text-sm text-muted-foreground">Source: {currentTreatment.comparisons.cost.us.source}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              * Non-neoadjuvant early-stage cases; individual hospitals may vary.<br />
              † Hospital-billed charges excl. flights & lodging; exchange-rate Q2 2025.
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Care Looks Like</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {currentTreatment.treatmentProcess.map((step: any, index: number) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                    {step.duration}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              Typical multimodality course: ≈ 3-6 months from first consult to completion; schedule varies by stage and patient comorbidities.
            </div>
          </div>
        </div>
      </section>

      {/* Quality & Safety */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quality & Safety</h2>
          <div className="max-w-3xl mx-auto grid gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Accreditation</h3>
                <p className="text-muted-foreground">{currentTreatment.qualityMetrics.accreditation}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Protocols</h3>
                <p className="text-muted-foreground">{currentTreatment.qualityMetrics.protocols}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Infection Control</h3>
                <p className="text-muted-foreground">{currentTreatment.qualityMetrics.infection}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Concierge Package */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Concierge Package</h2>
          <p className="text-center text-muted-foreground mb-12">What We Do</p>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {currentTreatment.conciergePackage.services.map((service: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-lg font-medium mb-6">
                Indicative fee: {currentTreatment.conciergePackage.fee}
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Request a Personalised Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimers */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mandatory Disclaimers</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {currentTreatment.disclaimers.map((disclaimer: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold mb-2">{disclaimer.title}</h3>
                <p className="text-sm text-muted-foreground">{disclaimer.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for Next Steps?</h2>
          <p className="text-lg mb-8 opacity-90">
            Book a 20-minute orientation call with our international patient team and receive a preliminary itinerary within 48 hours.
          </p>
          <Button size="lg" variant="secondary">
            Schedule Orientation Call
          </Button>
        </div>
      </section>

      <Footer />

      {/* Sticky Bottom Bar */}
      {showStickyBar && (
        <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-primary text-white py-4 shadow-lg z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Have questions about {currentTreatment.title}?</div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary">
                Contact Us
              </Button>
              <button 
                onClick={() => setShowStickyBar(false)}
                className="text-white hover:text-white/80 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentDetailPage;
