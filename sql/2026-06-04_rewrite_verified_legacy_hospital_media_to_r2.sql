-- Rewrite verified legacy CloudFront hospital media URLs to canonical public R2 URLs.
-- Generated from artifacts/hospital_media_r2_object_audit.json and target verification artifacts.
-- Skips URLs whose canonical target object was not verified in R2.

BEGIN;

-- guangzhou-concord-cancer-center summary_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/002-0.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305838693_1.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/003-1.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305844777_1.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/004-2.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305846718_8.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/005-3.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305848499_.jpg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/006-4.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305851896_4.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/007-5.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305856753_1.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/008-6.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305860282_.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/009-7.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305864046_ct.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/010-8.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305868171_petct.jpeg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/011-9.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305869444_signatm_architect_3.0t.png';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/012-10.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305871391_senographe_pristina_x_.jpg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/013-11.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305872528_olympus_cv_-_290_.png';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/014-12.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305874012_.jpg';

-- guangzhou-concord-cancer-center gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/015-13.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/gallery/1773305878983_.jpg';

-- guangzhou-concord-cancer-center equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg', updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg')::jsonb, updated_at = now()
WHERE id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'f100fb70-3f9a-49c3-b85f-4efa3d73d696'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/016-varian-probeam-proton-therapy.jpeg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/equipment/1773306117068_4.jpeg';

-- chengdu-aidi-eye-hospital summary_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/002-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696624743_dscf8944.png';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/003-1.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696660107_dscf9004.png';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/004-2.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696683448_lwd02656.png';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/005-3.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696721986_ljr_4090.png';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/006-4.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696752595_.jpg';

-- chengdu-aidi-eye-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/007-5.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/gallery/1772696780446_2.jpg';

-- chengdu-aidi-eye-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/008-visumax-800.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772696803756_visumax_800.png';

-- chengdu-aidi-eye-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/009-alcon-constellation.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772700443393_alcon-constellation.jpg';

-- chengdu-aidi-eye-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/010-optovue.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1773643313706_optovue.jpg';

-- chengdu-aidi-eye-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/011-media.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772758589583_.jpg';

-- chengdu-aidi-eye-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/012-alcon-infiniti.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/equipment/1772761715330_alcon-infiniti.jpg';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/013-9405a6ab-dc3e-49aa-897b-ca961ab530e3.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773021229693/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/014-471a7afa-b36d-46f5-9c7d-c1796843b005.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024686246/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/015-c9c6d24d-9e71-4a59-8300-c68c3c862c0e.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773025366178/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/016-6efa6b02-cbfd-4a7d-83ae-ebb4948bde94.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773023361846/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/017-a2dea633-3572-4375-ac11-17d7c4301b8d.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773024418439/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/018-ae7d4406-df2a-466e-a437-71ded9d6e0c4.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773035686297/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/019-62155b66-2bb8-4b02-aa8c-a817575e1895.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773036046567/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/020-6da0abec-1908-4849-8093-7aea7840a860.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773037228221/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/021-b4383966-95fc-456f-b40f-c10944d26fef.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/b4383966-95fc-456f-b40f-c10944d26fef/profile.png';

-- chengdu-aidi-eye-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png', updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png')::jsonb, updated_at = now()
WHERE id = 'd4b86613-9459-487b-8b2a-e4b531548436' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = 'd4b86613-9459-487b-8b2a-e4b531548436'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/022-d42f6df0-f171-4e19-8aba-e19cfb27d0a0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/surgeons/new_1773038734868/profile.png';

-- chongqing-hygeia-hospital summary_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/002-0.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499945816_20230620100846.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/003-1.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499949211_1.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/004-2.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772499950362_1.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/005-3.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503809072_.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/006-4.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503833381_2.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/007-5.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503838181_3.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/008-6.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503839667_4.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/009-7.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503844101_7.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/010-8.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503846227_8.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/011-9.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503847538_9.jpg';

-- chongqing-hygeia-hospital gallery
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/012-10.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/1772503848899_10.jpg';

-- chongqing-hygeia-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/013-60.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772504676096_20260303102405_16_49.png';

-- chongqing-hygeia-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/014-elekta-vmat.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542352714_elekta_vmat.png';

-- chongqing-hygeia-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/015-pet-ct.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542773230_pet-ct.png';

-- chongqing-hygeia-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/016-media.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772542776076_.png';

-- chongqing-hygeia-hospital equipment
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/018-ge256-512-ct.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543258123_ge256512ct.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/019-40467997-4e35-4f0f-9c06-7025fdfacda4.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772505392447/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/020-b23b446c-1ce6-4713-94b8-2de32595e35d.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772585088931/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/021-c893196f-04ca-47d0-8d87-6690e54dfa9e.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772586877076/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/022-21354cb6-4dc9-4379-9337-dc5ddb57a7dc.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587251682/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/023-1e5afb07-3303-442c-99d2-25d70d655658.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772587354989/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/024-310f8aac-54e2-43d4-9855-87a7fd014335.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584433739/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/025-26e2c277-6f5b-40d0-bcd1-181bf04dd8eb.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772584846584/profile.png';

-- chongqing-hygeia-hospital surgeon_hero
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/026-ae148eaf-d37d-447d-a5da-79532a9c5b96.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/surgeons/new_1772544269185/profile.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/027-abb300aa-4192-4b36-8280-e38ee9dae4e5-0.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-1.jpg';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/028-abb300aa-4192-4b36-8280-e38ee9dae4e5-1.jpg', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/unknown/case-CASE-2026-001-3.jpg';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/029-fed3b93f-f337-44d6-98fc-084dd941753b-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-002-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/030-40fcc676-4a2d-4358-a0f9-124cdd59d314-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-003-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/032-a27cdf45-79ba-49c8-afb4-bd358308420b-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-005-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/033-b82c7a48-8f7c-4a54-9533-abe9dfbf7109-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-006-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/034-eae0c1eb-92b6-431f-8dad-fad730275d9d-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-007-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/035-5528b16f-956c-4e49-96cb-bd563eaeac0b-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-008-1.png';

-- chongqing-hygeia-hospital case_image
UPDATE hospitals
SET hero_image_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png', updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND hero_image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png';

UPDATE hospitals
SET gallery = replace(gallery::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND gallery::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png' || '%';

UPDATE hospitals
SET equipment = replace(equipment::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png')::jsonb, updated_at = now()
WHERE id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e' AND equipment::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png' || '%';

UPDATE surgeons
SET image_url = replace(image_url, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png'),
    images = CASE WHEN images IS NULL THEN images ELSE replace(images::text, 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png', 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png')::jsonb END,
    updated_at = now()
WHERE hospital_id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e'
  AND (image_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png' OR images::text LIKE '%' || 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png' || '%');

UPDATE case_media
SET media_url = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/036-205edd6e-7e15-4aef-bd06-dbe40f338cb9-0.png', updated_at = now()
WHERE media_url = 'https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-009-1.png';

COMMIT;

-- Skipped unverified target objects:
-- chongqing-hygeia-hospital equipment: https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/1772543254009_3.0tmri.png -> https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/equipment/017-3-0t-mri.png
-- chongqing-hygeia-hospital case_image: https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/60/case-CASE-2026-004-1.png -> https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/cases/031-7be92e4d-23ea-457e-9f4b-d01db1a37ce9-0.png
