import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import Guides from '../Guides';
vi.mock('@/contexts/LanguageContext',()=>({useLanguage:()=>({currentLanguage:{code:'en'},t:(key:string)=>key})}));
vi.mock('@/components/Header',()=>({default:()=>null}));vi.mock('@/components/Footer',()=>({default:()=>null}));vi.mock('@/components/TopBanner',()=>({default:()=>null}));
vi.mock('@/utils/seo',()=>({setPageSeo:vi.fn(),SITE_ORIGIN:'https://www.medicaltourismchina.health'}));
vi.mock('@/seo/static-page',()=>({getStaticPageMetadata:()=>({locale:{title:'Guides',description:'Patient guides'},indexable:true,indexableLocales:['en']})}));
vi.mock('@/components/guides/GuideCard',()=>({default:({guide}:{guide:{title:{en:string}}})=><article>{guide.title.en}</article>}));
vi.mock('@/data/guides-manifest.json',()=>{
 const guide=(slug:string,conditionId:string,name:string)=>({slug,conditionId,condition:{en:name},title:{en:slug},subtitle:{en:''},locales:['en'],updatedDate:'2026/09/09'});
 return {default:{categories:[{slug:'clinical-trials-advanced-treatments',title:{en:'Clinical trials'},guides:[guide('Lymphoma trial','follicular-lymphoma','Follicular lymphoma'),guide('MS trial','multiple-sclerosis','Multiple sclerosis')]},{slug:'hospital-guides',title:{en:'Hospitals'},guides:[guide('Lymphoma hospital','follicular-lymphoma','Follicular lymphoma')]}]}};
});
afterEach(cleanup);
describe('patient-oriented guide filters',()=>{
 it('combines disease area with clinical trials and clears incompatible disease on area change',()=>{
  render(<MemoryRouter><Guides/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:/Cancer & blood cancers/}));
  expect(screen.queryByText('MS trial')).toBeNull();
  expect(screen.getByText('Lymphoma hospital')).toBeTruthy();
  fireEvent.change(document.getElementById('guides-condition')!,{target:{value:'follicular-lymphoma'}});
  fireEvent.click(screen.getByRole('button',{name:/Clinical trials/}));
  expect(screen.getByText('Lymphoma trial')).toBeTruthy();expect(screen.queryByText('Lymphoma hospital')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:/Brain, nerves & rehabilitation/}));
  expect((document.getElementById('guides-condition') as HTMLSelectElement).value).toBe('');
  expect(screen.getByText('MS trial')).toBeTruthy();expect(screen.queryByText('Lymphoma trial')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'guides.resetFilters'}));
  expect(screen.getByText('Lymphoma hospital')).toBeTruthy();expect(screen.getByText('Lymphoma trial')).toBeTruthy();expect(screen.getByText('MS trial')).toBeTruthy();
 });
});
