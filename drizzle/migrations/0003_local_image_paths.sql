UPDATE public.gallery SET image_url = CASE
 WHEN image_url LIKE '%/images_12.jpg' THEN '/images/leader-cap.jpg'
 WHEN image_url LIKE '%/images_9.jpg' THEN '/images/leader-cap-side.jpg'
 WHEN image_url LIKE '%/images_13.jpg' THEN '/images/leader-white.jpg'
 WHEN image_url LIKE '%/images_11.jpg' THEN '/images/leader-saffron.jpg'
 WHEN image_url LIKE '%/leader-banner.jpg' THEN '/images/leader-banner.jpg'
 ELSE image_url END
WHERE image_url LIKE '/__l5e/%';