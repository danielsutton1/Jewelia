-- Create storage buckets for different types of files
insert into storage.buckets (id, name, public) values
  ('product-images', 'Product Images', true),
  ('customer-documents', 'Customer Documents', false),
  ('project-files', 'Project Files', false),
  ('company-logos', 'Company Logos', true);

-- Set up storage policies
create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Company logos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'company-logos');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can upload company logos"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos' and
    auth.role() = 'authenticated'
  );

create policy "Users can access their own customer documents"
  on storage.objects for select
  using (
    bucket_id = 'customer-documents' and
    auth.uid() = owner
  );

create policy "Users can upload their own customer documents"
  on storage.objects for insert
  with check (
    bucket_id = 'customer-documents' and
    auth.role() = 'authenticated'
  );

create policy "Users can access their own project files"
  on storage.objects for select
  using (
    bucket_id = 'project-files' and
    auth.uid() = owner
  );

create policy "Users can upload their own project files"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files' and
    auth.role() = 'authenticated'
  ); 
 
 