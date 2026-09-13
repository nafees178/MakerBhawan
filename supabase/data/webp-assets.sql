-- ============================================================================
-- ARTL — repoint stored asset paths at the WebP versions
-- ============================================================================
-- The photographs under /public were re-encoded as WebP: same pixels, roughly
-- a third fewer bytes, which on a phone over campus wifi is the difference
-- people actually feel. Paths stored in the database have to follow.
--
-- Only rows pointing at /images/ are touched. Anything uploaded through /admin
-- lives on Supabase Storage under a different prefix and is left alone.
-- ============================================================================

update members
   set photo_url = regexp_replace(photo_url, '\.(jpe?g)$', '.webp')
 where photo_url like '/images/%'
   and photo_url ~ '\.(jpe?g)$';

update items
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

update events
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

update projects
   set image_url = regexp_replace(image_url, '\.(jpe?g)$', '.webp')
 where image_url like '/images/%'
   and image_url ~ '\.(jpe?g)$';

select full_name, photo_url from members where photo_url is not null order by sort_order;
