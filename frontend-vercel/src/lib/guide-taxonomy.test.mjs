import {describe,it,expect} from 'vitest';
import {GUIDE_AREAS,guideHealthArea} from './guide-taxonomy.mjs';
describe('guide health areas',()=>{
 it('uses confirmed disease metadata across article types',()=>{
  expect(guideHealthArea({conditionId:'follicular-lymphoma',title:{en:'Hospital selection'}})).toBe('cancer');
  expect(guideHealthArea({conditionId:'aplastic-anemia',title:{en:'Treatment options'}})).toBe('blood');
  expect(guideHealthArea({conditionId:'multiple-sclerosis',title:{en:'New drugs and clinical trials'}})).toBe('neurology');
  expect(guideHealthArea({conditionId:'graft-versus-host-disease',title:{en:'Cancer treatment complications'}})).toBe('blood');
 });
 it('classifies explicit legacy disease titles without treating all trials as cancer',()=>{
  expect(guideHealthArea({title:{en:'Cancer Vaccine Trials: What the Research Is Testing'}})).toBe('cancer');
  expect(guideHealthArea({title:{en:'Clinical Trial Eligibility: Why Patients May or May Not Qualify'}})).toBe('general');
  expect(guideHealthArea({title:{en:'Possible Stroke During Medical Travel'}})).toBe('neurology');
 });
 it('retains general patient logistics separately',()=>{
  expect(guideHealthArea({title:{en:'Medical Travel Costs and Insurance'}})).toBe('general');
 });
 it('provides all eight native interface labels',()=>{
  for(const area of GUIDE_AREAS)for(const locale of ['en','zh','es','fr','de','ru','ar','id'])expect(area.label[locale]?.length).toBeGreaterThan(2);
 });
});
