import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TopUtilityBar from "@/components/TopUtilityBar";
import MainNavigation from "@/components/MainNavigation";
import Footer from "@/components/Footer";
import {
  ChevronRight,
  Microscope,
  Syringe,
  Zap,
  Heart,
  Brain,
  Activity,
  Shield,
  Dna,
  Target
} from "lucide-react";

// Department data
const departmentData: { [key: string]: any } = {
  "cancer": {
    title: "Cancer Care",
    subtitle: "Comprehensive cancer treatment with advanced therapies and personalized care",
    description: "Cancer treatments encompass a range of therapies aimed at controlling, reducing, or eliminating cancer cells to prevent the disease from spreading or recurring.",
    treatments: [
      {
        icon: <Syringe className="w-6 h-6" />,
        name: "Surgery",
        description: "Involves physically removing cancerous tissue from the body. Surgery can be used for diagnosis, treatment, or prevention, and is often employed in combination with other therapies.",
        details: [
          "Minimally invasive procedures",
          "Robotic surgery options",
          "Advanced imaging guidance",
          "Rapid recovery protocols"
        ]
      },
      {
        icon: <Zap className="w-6 h-6" />,
        name: "Radiation Therapy",
        description: "Uses high-energy radiation to target and destroy cancer cells. It can be applied externally or internally (brachytherapy), and is often used to shrink tumors or prevent recurrence after surgery.",
        details: [
          "External beam radiation",
          "Internal brachytherapy",
          "Targeted radiation delivery",
          "Minimal side effects"
        ]
      },
      {
        icon: <Activity className="w-6 h-6" />,
        name: "Chemotherapy",
        description: "Involves the use of drugs to kill or inhibit the growth of cancer cells. Chemotherapy is systemic, affecting cells throughout the body, and is often used in conjunction with other treatments to manage cancer.",
        details: [
          "Latest drug protocols",
          "Targeted delivery systems",
          "Supportive care included",
          "Personalized dosing"
        ]
      },
      {
        icon: <Shield className="w-6 h-6" />,
        name: "Immunotherapy",
        description: "Stimulates the body's immune system to recognize and attack cancer cells. This approach can involve checkpoint inhibitors, CAR T-cell therapy, or other techniques to boost the immune response against cancer.",
        details: [
          "Checkpoint inhibitors",
          "CAR T-cell therapy",
          "Immune system boosting",
          "Innovative protocols"
        ]
      },
      {
        icon: <Target className="w-6 h-6" />,
        name: "Targeted Therapy",
        description: "Utilizes drugs designed to specifically target certain molecules or pathways involved in cancer growth. These therapies are often more selective than chemotherapy, potentially resulting in fewer side effects.",
        details: [
          "Molecular targeting",
          "Reduced side effects",
          "Precision medicine",
          "Customized treatment"
        ]
      },
      {
        icon: <Heart className="w-6 h-6" />,
        name: "Hormone Therapy",
        description: "Used to treat cancers that are hormone-sensitive, such as some breast and prostate cancers. Hormone therapy aims to block or alter the body's hormone production to slow cancer growth.",
        details: [
          "Hormone regulation",
          "Long-term management",
          "Minimal intervention",
          "Proven effectiveness"
        ]
      },
      {
        icon: <Dna className="w-6 h-6" />,
        name: "Stem Cell Transplant",
        description: "Involves replacing damaged bone marrow with healthy stem cells. This treatment is often used for blood-related cancers like leukemia and lymphoma, allowing the body to produce healthy blood cells after high-dose chemotherapy or radiation.",
        details: [
          "Bone marrow restoration",
          "Blood cancer treatment",
          "Advanced cell therapy",
          "Comprehensive care"
        ]
      },
      {
        icon: <Microscope className="w-6 h-6" />,
        name: "Clinical Trials",
        description: "Research studies that test new treatments, therapies, or combinations thereof. Clinical trials are an essential part of advancing cancer treatment and may offer patients access to innovative therapies.",
        details: [
          "Innovative treatments",
          "Research participation",
          "Latest therapies",
          "Expert monitoring"
        ]
      }
    ],
    specificTreatments: [
      {
        icon: <Activity className="w-12 h-12 text-primary" />,
        name: "Breast Cancer",
        description: "Comprehensive breast cancer care including surgery, reconstruction, and targeted therapy",
        slug: "breast-cancer"
      },
      {
        icon: <Brain className="w-12 h-12 text-primary" />,
        name: "Brain Cancer",
        description: "Advanced treatment options for all types of brain tumors",
        slug: "brain-cancer"
      },
      {
        icon: <Heart className="w-12 h-12 text-primary" />,
        name: "Lung Cancer",
        description: "Innovative therapies for early and advanced stage lung cancer",
        slug: "lung-cancer"
      },
      {
        icon: <Shield className="w-12 h-12 text-primary" />,
        name: "Liver Cancer",
        description: "Targeted treatments for hepatocellular carcinoma and other liver cancers",
        slug: "liver-cancer"
      }
    ]
  }
  // Add other departments here
};

const DepartmentDetail = () => {
  const { department } = useParams();
  const departmentInfo = departmentData[department || "cancer"];

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
            <span className="text-foreground font-medium">
              {departmentInfo.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Department Overview */}
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{departmentInfo.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{departmentInfo.subtitle}</p>
            <p className="text-lg text-muted-foreground">{departmentInfo.description}</p>
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {departmentInfo.treatments.map((treatment: any, index: number) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {treatment.icon}
                      </div>
                      <h3 className="text-xl font-semibold">{treatment.name}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{treatment.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {treatment.details.map((detail: string, i: number) => (
                        <div key={i} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          <span className="text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specific Cancer Types */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Types of Cancer We Treat</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {departmentInfo.specificTreatments.map((treatment: any, index: number) => (
              <Link key={index} to={`/treatment/${treatment.slug}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">{treatment.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{treatment.name}</h3>
                    <p className="text-muted-foreground mb-4">{treatment.description}</p>
                    <div className="flex items-center text-primary">
                      <span>Learn More</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DepartmentDetail; 