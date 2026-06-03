import { afterEach, describe, expect, it, vi } from 'vitest';
import { hospitalApi } from '../hospital';

describe('hospitalApi media normalization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes storage-key media paths in extended hospital responses into absolute URLs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'hospital-1',
          slug: '3',
          name: 'Test Hospital',
          display_name: 'Test Hospital',
          city: 'Shanghai',
          district: 'Pudong',
          province: 'Shanghai',
          tier: 'Tier 3A',
          hospital_type: 'general',
          ownership_type: 'public',
          short_description: 'desc',
          department_count: 1,
          created_at: '2026-04-16T00:00:00.000Z',
          updated_at: '2026-04-16T00:00:00.000Z',
          hero_image_url: 'crm/dev/materials-regular/hero.png',
          facilities_info: {
            promotionalVideos: ['crm/dev/materials-regular/promo-video.mp4'],
          },
          gallery: [{ url: 'crm/dev/materials-regular/gallery.png', alt: '', type: 'facade' }],
          departments_info: [{
            department_slug: 'orthopedics',
            department_name: 'Orthopedics',
            description: 'dept desc',
            is_specialty_center: false,
            specialty_center_name: '',
            image_url: 'crm/dev/materials-regular/department.png',
          }],
          surgeons: [{
            id: 'surgeon-1',
            surgeon_id: 'surgeon-1',
            hospital_id: 'hospital-1',
            name: 'Dr Wang',
            image_url: 'crm/dev/materials-regular/surgeon.png',
            images: {
              hero: 'crm/dev/materials-regular/surgeon-hero.png',
              profile: 'crm/dev/materials-regular/surgeon-profile.png',
            },
          }],
          procedure_cases: [{
            id: 'case-1',
            hospital_id: 'hospital-1',
            case_number: '001',
            image_urls: [
              'crm/dev/materials-regular/case-before.png',
              'https://cdn.example.com/already-absolute.png',
            ],
          }],
          equipment: [{
            name: 'MRI',
            description: 'Advanced imaging',
            image_url: 'crm/dev/materials-regular/equipment.png',
          }],
          packages: [{
            id: 'package-1',
            title: 'Joint Recovery Package',
            image_url: 'crm/dev/materials-regular/packages/cover.jpg',
          }],
          patient_reviews: [{
            id: 'review-1',
            patient_name: 'John Zhang',
            patient_avatar_url: 'crm/dev/materials-regular/reviews/avatar.jpg',
            media: [{
              id: 'media-1',
              url: 'crm/dev/materials-regular/reviews/photo.jpg',
            }],
          }],
        },
        meta: {
          requested_locale: 'zh',
          resolved_locale: 'zh',
          slug: '3',
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalExtendedBySlug('3', 'zh');

    expect(response.data.hero_image_url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/hero.png');
    expect(response.data.promotional_videos).toEqual([
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/promo-video.mp4',
    ]);
    expect(response.data.gallery?.[0]?.url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/gallery.png');
    expect(response.data.departments_info?.[0]).toMatchObject({
      image_url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/department.png',
    });
    expect(response.data.surgeons?.[0]).toMatchObject({
      image_url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/surgeon.png',
      images: {
        hero: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/surgeon-hero.png',
        profile: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/surgeon-profile.png',
      },
    });
    expect(response.data.procedure_cases?.[0]?.image_urls).toEqual([
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/case-before.png',
      'https://cdn.example.com/already-absolute.png',
    ]);
    expect(response.data.equipment?.[0]?.image_url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/equipment.png');
    expect(response.data.packages?.[0]?.image_url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/packages/cover.jpg');
    expect(response.data.patient_reviews?.[0]?.patient_avatar_url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/reviews/avatar.jpg');
    expect(response.data.patient_reviews?.[0]?.media?.[0]?.url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/reviews/photo.jpg');
  });

  it('does not rewrite arbitrary relative media values that are not crm storage keys', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'hospital-1',
          slug: '3',
          name: 'Test Hospital',
          display_name: 'Test Hospital',
          city: 'Shanghai',
          district: 'Pudong',
          province: 'Shanghai',
          tier: 'Tier 3A',
          hospital_type: 'general',
          ownership_type: 'public',
          short_description: 'desc',
          department_count: 1,
          created_at: '2026-04-16T00:00:00.000Z',
          updated_at: '2026-04-16T00:00:00.000Z',
          hero_image_url: 'screenshot_2026-04-12_at_8.10.02_pm.png',
          gallery: [{ url: '/crm/dev/materials-regular/gallery.png', alt: '', type: 'facade' }],
        },
        meta: {
          requested_locale: 'zh',
          resolved_locale: 'zh',
          slug: '3',
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalExtendedBySlug('3', 'zh');

    expect(response.data.hero_image_url).toBe('screenshot_2026-04-12_at_8.10.02_pm.png');
    expect(response.data.gallery?.[0]?.url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/gallery.png');
  });

  it('normalizes nested package detail media into absolute URLs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'package-1',
          slug: 'joint-recovery-package',
          title: 'Joint Recovery Package',
          subtitle: 'Post-op support',
          cover_image_url: 'crm/dev/materials-regular/packages/cover.jpg',
          gallery: [
            'crm/dev/materials-regular/packages/gallery-1.jpg',
            'https://cdn.example.com/gallery-2.jpg',
          ],
          duration: '7 days',
          price_label: 'USD 12,000',
          summary: 'Includes consultation, treatment, and recovery support.',
          tags: [{ label: 'Orthopedics', category: 'treatment' }],
          includes: ['Pre-op consultation'],
          process: [{ step: 'Assessment', desc: 'Specialist review.' }],
          cases: [{ name: 'Alex', age: 31, country: 'Canada', story: 'Story', result: 'Result' }],
          reviews: [{ name: 'Pat', country: 'Singapore', rating: 5, date: '2026-04-25', comment: 'Excellent care.' }],
          hospital: {
            id: 'hospital-1',
            slug: 'sample-hospital',
            name: 'Sample Hospital',
            location: 'Shanghai, Shanghai',
          },
        },
        meta: {
          requested_locale: 'en',
          resolved_locale: 'en',
          slug: 'sample-hospital',
          package_slug: 'joint-recovery-package',
          generated_at: '2026-04-25T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalPackageDetailBySlug('sample-hospital', 'joint-recovery-package', 'en');

    expect(response.data.cover_image_url).toBe('https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/packages/cover.jpg');
    expect(response.data.gallery).toEqual([
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/crm/dev/materials-regular/packages/gallery-1.jpg',
      'https://cdn.example.com/gallery-2.jpg',
    ]);
  });

  it('sorts hospital listings with private hospitals before public hospitals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: [
          {
            id: 'hospital-public',
            slug: 'public-hospital',
            name: 'Public Hospital',
            display_name: 'Public Hospital',
            city: 'Shanghai',
            district: 'Pudong',
            province: 'Shanghai',
            tier: 'Tier 3A',
            hospital_type: 'general',
            ownership_type: 'public',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
          {
            id: 'hospital-private',
            slug: 'private-hospital',
            name: 'Private Hospital',
            display_name: 'Private Hospital',
            city: 'Shanghai',
            district: 'Pudong',
            province: 'Shanghai',
            tier: 'Tier 3A',
            hospital_type: 'general',
            ownership_type: 'private',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
          {
            id: 'hospital-joint',
            slug: 'joint-hospital',
            name: 'Joint Venture Hospital',
            display_name: 'Joint Venture Hospital',
            city: 'Shanghai',
            district: 'Pudong',
            province: 'Shanghai',
            tier: 'Tier 3A',
            hospital_type: 'general',
            ownership_type: 'joint_venture',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
        ],
        meta: {
          requested_locale: 'en',
          resolved_locale: 'en',
          filters: {},
          pagination: {
            limit: 24,
            offset: 0,
            returned: 3,
            total: 3,
          },
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitals({ locale: 'en' });

    expect(response.data.map((hospital) => hospital.id)).toEqual([
      'hospital-private',
      'hospital-public',
      'hospital-joint',
    ]);
  });

  it('cleans bilingual hospital names for non-Chinese locales', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: [
          {
            id: 'hospital-english-first',
            slug: 'english-first',
            name: "Children's Hospital of Chongqing Medical University (重庆医科大学附属儿童医院)",
            display_name: '重庆医科大学附属儿童医院',
            city: 'chongqing',
            district: 'Yuzhong',
            province: 'Chongqing',
            tier: 'Tier 3A',
            hospital_type: 'general',
            ownership_type: 'public',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
          {
            id: 'hospital-chinese-first',
            slug: 'chinese-first',
            name: '广州泰和肿瘤医院 (Guangzhou Concord Cancer Center)',
            display_name: '广州泰和肿瘤医院',
            city: 'guangzhou',
            district: 'Tianhe',
            province: 'Guangdong',
            tier: 'Tier 3A',
            hospital_type: 'specialist',
            ownership_type: 'private',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
          {
            id: 'hospital-english-alias',
            slug: 'english-alias',
            name: 'Chongqing University Cancer Hospital (Chongqing Cancer Hospital)',
            display_name: '重庆大学附属肿瘤医院',
            city: 'chongqing',
            district: 'Shapingba',
            province: 'Chongqing',
            tier: 'Tier 3A',
            hospital_type: 'specialist',
            ownership_type: 'public',
            short_description: 'desc',
            department_count: 1,
            created_at: '2026-04-16T00:00:00.000Z',
            updated_at: '2026-04-16T00:00:00.000Z',
          },
        ],
        meta: {
          requested_locale: 'en',
          resolved_locale: 'en',
          filters: {},
          pagination: {
            limit: 24,
            offset: 0,
            returned: 3,
            total: 3,
          },
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitals({ locale: 'en' });
    const hospitalsBySlug = Object.fromEntries(
      response.data.map((hospital) => [hospital.slug, hospital.name]),
    );

    expect(hospitalsBySlug['english-first']).toBe("Children's Hospital of Chongqing Medical University");
    expect(hospitalsBySlug['chinese-first']).toBe('Guangzhou Concord Cancer Center');
    expect(hospitalsBySlug['english-alias']).toBe('Chongqing University Cancer Hospital (Chongqing Cancer Hospital)');
  });

  it('falls back to the first hospital photo when extended detail is missing a hero image', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'e035c4a4-2a80-410e-a868-0cb5db5f5574',
          slug: 'childrens-hospital-of-chongqing-medical-university',
          name: "Children's Hospital of Chongqing Medical University (重庆医科大学附属儿童医院)",
          display_name: '重庆医科大学附属儿童医院',
          city: 'chongqing',
          district: 'Yuzhong',
          province: 'Chongqing',
          tier: 'Tier 3A',
          hospital_type: 'general',
          ownership_type: 'public',
          short_description: 'desc',
          department_count: 1,
          created_at: '2026-04-16T00:00:00.000Z',
          updated_at: '2026-04-16T00:00:00.000Z',
          hero_image_url: null,
          gallery: [],
        },
        meta: {
          requested_locale: 'en',
          resolved_locale: 'en',
          slug: 'childrens-hospital-of-chongqing-medical-university',
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalExtendedBySlug(
      'childrens-hospital-of-chongqing-medical-university',
      'en',
    );

    expect(response.data.hero_image_url).toBe(
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_1.png',
    );
    expect(response.data.gallery).toEqual([
      {
        alt: "Children's Hospital of Chongqing Medical University",
        type: 'facade',
        url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_1.png',
      },
      {
        alt: "Children's Hospital of Chongqing Medical University",
        type: 'facade',
        url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_2.png',
      },
      {
        alt: "Children's Hospital of Chongqing Medical University",
        type: 'facade',
        url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_3.png',
      },
      {
        alt: "Children's Hospital of Chongqing Medical University",
        type: 'facade',
        url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_4.png',
      },
      {
        alt: "Children's Hospital of Chongqing Medical University",
        type: 'facade',
        url: 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/e035c4a4-2a80-410e-a868-0cb5db5f5574_5.png',
      },
    ]);
  });

  it('uses the known private R2 image set for Raffles hospital when CRM images are unavailable in R2', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'eeeb46fe-7478-4250-abd1-a3954e74a212',
          slug: 'hospital-eeeb46fe',
          name: 'Raffles Hospital Beijing 北京莱佛士医院',
          display_name: 'Raffles Hospital Beijing 北京莱佛士医院',
          city: '北京',
          district: '朝阳',
          province: 'China',
          tier: '',
          hospital_type: 'general',
          ownership_type: 'Private',
          short_description: 'desc',
          department_count: 1,
          created_at: '2026-04-16T00:00:00.000Z',
          updated_at: '2026-04-16T00:00:00.000Z',
          hero_image_url: 'crm/prod/materials-regular/hospital-image/eeeb46fe-7478-4250-abd1-a3954e74a212/hero.jpg',
          gallery: [
            {
              alt: '',
              url: 'crm/prod/materials-regular/hospital-image/eeeb46fe-7478-4250-abd1-a3954e74a212/gallery.jpg',
              type: 'facade',
            },
          ],
        },
        meta: {
          requested_locale: 'zh',
          resolved_locale: 'zh',
          slug: 'hospital-eeeb46fe',
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalExtendedBySlug('hospital-eeeb46fe', 'zh');

    expect(response.data.hero_image_url).toBe(
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A2.png',
    );
    expect(response.data.gallery?.map((item) => item.url)).toEqual([
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A2.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A22.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A23.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A24.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E9%87%8D%E5%BA%86%E8%8E%B1%E4%BD%9B%E5%A3%AB%E5%8C%BB%E9%99%A25.png',
    ]);
  });

  it('uses the known private R2 image set for Clifford Hospital aliases', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: 'hospital-clifford',
          slug: 'clifford-hospital',
          name: '广东祈福医院 Clifford Hospital',
          display_name: '广东祈福医院 Clifford Hospital',
          city: '广州',
          district: '番禺',
          province: 'Guangdong',
          tier: '',
          hospital_type: 'general',
          ownership_type: 'Private',
          short_description: 'desc',
          department_count: 1,
          created_at: '2026-04-16T00:00:00.000Z',
          updated_at: '2026-04-16T00:00:00.000Z',
          hero_image_url: 'crm/prod/materials-regular/hospital-image/hospital-clifford/hero.jpg',
          gallery: [],
        },
        meta: {
          requested_locale: 'zh',
          resolved_locale: 'zh',
          slug: 'clifford-hospital',
          generated_at: '2026-04-16T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ));

    const response = await hospitalApi.getHospitalExtendedBySlug('clifford-hospital', 'zh');

    expect(response.data.hero_image_url).toBe(
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E5%B9%BF%E5%B7%9E%E7%A5%88%E7%A6%8F%E5%8C%BB%E9%99%A2.png',
    );
    expect(response.data.gallery?.map((item) => item.url)).toEqual([
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E5%B9%BF%E5%B7%9E%E7%A5%88%E7%A6%8F%E5%8C%BB%E9%99%A2.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E5%B9%BF%E5%B7%9E%E7%A5%88%E7%A6%8F%E5%8C%BB%E9%99%A22.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E5%B9%BF%E5%B7%9E%E7%A5%88%E7%A6%8F%E5%8C%BB%E9%99%A23.png',
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/private/%E5%B9%BF%E5%B7%9E%E7%A5%88%E7%A6%8F%E5%8C%BB%E9%99%A24.png',
    ]);
  });
});
