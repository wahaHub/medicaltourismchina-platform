// Department related types

export interface Department {
  id: string;
  slug: string;
  name: string;           // 中文名称
  name_en: string;        // 英文名称 (用于搜索)
  short_desc?: string;    // 简短描述 (可选)
}

export interface DepartmentCapability {
  department_slug: string;
  
  // 1. 为什么在中国看这个病 - 使用Markdown支持格式化  
  why_china_md: string;             // 完整的Markdown内容，包含成本优势、技术水平、医疗资源、政策支持等
  
  // 2. 举例列表 (保持表格数据结构)
  examples: Array<{
    disease_name: string;             // 疾病名称
    procedure_method: string;         // 手术方式
    wait_time: string;               // 手术等待时间
    price_range_china: string;       // 中国价格区间
    annual_cases: number;            // 中国每年临床病例数
  }>;
  
  // 3. 中国在该领域的科研能力 - 使用Markdown
  research_capability_md: string;   // 完整的Markdown内容，包含论文发表、国际合作、临床试验、药物创新等
  
  // 4. 中国医生临床能力 - 使用Markdown
  clinical_capability_md: string;   // 完整的Markdown内容，包含培训体系、成功率、手术量、国际认证等
  
  // 5. 中国该领域专利 - 使用Markdown
  patents_md: string;               // 完整的Markdown内容，包含专利数量、核心技术、医疗器械、国际对比等
}